from app.ai.answer_validator import AnswerValidator
from app.ai.chat_service import ChatService
from app.schemas.chat import ChatRequest


def test_answer_validator_requires_citation():
    result = AnswerValidator().validate(answer="Some answer", citation_count=0)

    assert result["valid"] is False
    assert result["confidence"] < 0.5


def test_chat_title_is_generated_from_question():
    title = ChatService._make_title("How do I find ERP SOP documents?")

    assert title == "How do I find ERP SOP documents?"


def test_chat_request_schema():
    request = ChatRequest(question="What is ISO 9001?", conversation_id=None)

    assert request.question == "What is ISO 9001?"
    assert request.stream is False
