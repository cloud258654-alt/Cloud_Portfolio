import logging
import time

from sqlalchemy.orm import Session

from app.ai.ai_gateway import ai_gateway
from app.ai.answer_validator import AnswerValidator
from app.ai.citation_service import CitationService
from app.ai.context_builder import ContextBuilder
from app.ai.prompt_loader import PromptLoader
from app.repositories.chat_repository import ChatRepository
from app.schemas.chat import ChatAnswer, ChatRequest, CitationRead


class ChatService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = ChatRepository(db)
        self.context_builder = ContextBuilder(db)
        self.prompt_loader = PromptLoader()
        self.validator = AnswerValidator()
        self.logger = logging.getLogger(__name__)

    def ask(self, payload: ChatRequest) -> ChatAnswer:
        started = time.perf_counter()
        conversation = (
            self.repository.get_conversation(payload.conversation_id)
            if payload.conversation_id
            else None
        )
        if conversation is None:
            conversation = self.repository.create_conversation(
                title=self._make_title(payload.question)
            )

        self.repository.add_message(
            conversation.id,
            sender_type="user",
            message=payload.question,
        )

        context, search_results, history = self.context_builder.build(
            question=payload.question,
            conversation_id=conversation.id,
        )
        answer = self._generate_answer(payload.question, context, search_results, history)
        validation = self.validator.validate(
            answer=answer,
            citation_count=len(search_results),
        )

        context_snippets = [r.content for r in search_results] if search_results else []
        grounding = self.validator.check_grounding(
            answer=answer,
            context_snippets=context_snippets,
            citations=[
                CitationRead(**r.citation.model_dump()) for r in search_results
            ],
        )

        assistant_message = self.repository.add_message(
            conversation.id,
            sender_type="assistant",
            message=answer,
            model_name=ai_gateway.openai_client and "openai" or "offline-fallback",
            token_usage=len((payload.question + context + answer).split()),
            confidence_score=validation["confidence"],
            metadata={"validation": validation, "grounding": grounding},
        )
        CitationService(self.repository).persist(assistant_message.id, search_results)

        citations = [
            CitationRead(**result.citation.model_dump())
            for result in search_results
        ]
        suggested = self._suggest_questions(payload.question)
        self.logger.info(
            "chat_answer question=%s latency=%.3fs citation_count=%s confidence=%.2f",
            payload.question[:120],
            time.perf_counter() - started,
            len(citations),
            validation["confidence"],
        )
        return ChatAnswer(
            conversation_id=conversation.id,
            message_id=assistant_message.id,
            answer=answer,
            citations=citations,
            confidence=validation["confidence"],
            confidence_tier=validation.get("tier", "uncertain"),
            grounding_ratio=grounding["grounding_ratio"],
            suggested_questions=suggested,
        )

    def _generate_answer(self, question: str, context: str, search_results: list, history: list) -> str:
        if not search_results:
            return (
                "目前公司文件中暫無此情境的標準流程。\n\n"
                "建議您可以：\n"
                "1. 改用其他關鍵字描述您的問題（例如：客訴、退換貨、緊急通報）\n"
                "2. 請示直屬主管或值班經理\n"
                "3. 若此情境經常發生，請向管理部建議新增 SOP"
            )

        system_msg = self.prompt_loader.load("System_Base.md")
        qa_instructions = self.prompt_loader.load("QA.md")
        service_prompt = self.prompt_loader.load("Service_Industry_QA.md")

        formatted_context = "\n\n".join(
            f"[Source {i+1}] {r.document_title}\n{r.content[:600]}"
            for i, r in enumerate(search_results[:5])
        )

        messages = [
            {"role": "system", "content": f"{system_msg}\n\n{qa_instructions}\n\n{service_prompt}"},
            {"role": "user", "content": (
                f"Question: {question}\n\n"
                f"Reference knowledge:\n{formatted_context}\n\n"
                f"Answer the question based on the reference knowledge above. "
                f"Include [Source N] citations where applicable."
            )},
        ]

        return ai_gateway.chat(messages, temperature=0.2, max_tokens=1024)

    @staticmethod
    def _make_title(question: str) -> str:
        return question.strip()[:80] or "New Conversation"

    @staticmethod
    def _suggest_questions(question: str) -> list[str]:
        return [
            f"{question} 的相關 SOP 是什麼？",
            f"{question} 有哪些注意事項？",
            f"{question} 可以引用哪些文件？",
        ]
