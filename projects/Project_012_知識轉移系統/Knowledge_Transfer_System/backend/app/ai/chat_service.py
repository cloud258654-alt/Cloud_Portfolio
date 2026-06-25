import logging
import time

from sqlalchemy.orm import Session

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

        context, search_results, _history = self.context_builder.build(
            question=payload.question,
            conversation_id=conversation.id,
        )
        answer = self._generate_answer(payload.question, context, search_results)
        validation = self.validator.validate(
            answer=answer,
            citation_count=len(search_results),
        )
        assistant_message = self.repository.add_message(
            conversation.id,
            sender_type="assistant",
            message=answer,
            model_name="local-rag-placeholder",
            token_usage=len((payload.question + context + answer).split()),
            confidence_score=validation["confidence"],
            metadata={"validation": validation},
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
            suggested_questions=suggested,
        )

    def _generate_answer(self, question: str, context: str, search_results: list) -> str:
        system_prompt = self.prompt_loader.load("System_Base.md")
        qa_prompt = self.prompt_loader.load("QA.md")
        if not search_results:
            return "目前找不到足夠的內部知識來源回答這個問題。請補充文件或換一個更具體的問法。"

        citations = ", ".join(
            f"[{index + 1}] {result.document_title}"
            for index, result in enumerate(search_results[:5])
        )
        top_context = search_results[0].content[:700]
        return (
            f"{system_prompt[:120]} {qa_prompt[:120]}\n\n"
            f"根據目前可檢索的知識內容，這個問題「{question}」可先參考：{top_context}\n\n"
            f"引用來源：{citations}"
        ).strip()

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
