from datetime import datetime

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.ai.chat_service import ChatService
from app.ai.conversation_service import ConversationService
from app.ai.stream_service import StreamService
from app.db.session import get_db
from app.models.chat import Feedback
from app.repositories.chat_repository import ChatRepository
from app.schemas.chat import ChatRequest, ConversationUpdate, FeedbackCreate
from app.schemas.response import StandardResponse


router = APIRouter()


def get_chat_repository(db: Session = Depends(get_db)) -> ChatRepository:
    return ChatRepository(db)


@router.post("", response_model=StandardResponse)
def ask_chat(payload: ChatRequest, db: Session = Depends(get_db)):
    answer = ChatService(db).ask(payload)
    if payload.stream:
        return StreamingResponse(
            StreamService().events(answer),
            media_type="text/event-stream",
        )
    return StandardResponse(success=True, data=answer.model_dump(), message="answer generated")


@router.get("", response_model=StandardResponse)
def list_conversations(repository: ChatRepository = Depends(get_chat_repository)):
    conversations = ConversationService(repository).list()
    return StandardResponse(
        success=True,
        data=[item.model_dump() for item in conversations],
        message="success",
    )


@router.get("/{conversation_id}", response_model=StandardResponse)
def get_conversation(
    conversation_id: str,
    repository: ChatRepository = Depends(get_chat_repository),
):
    detail = ConversationService(repository).detail(conversation_id)
    return StandardResponse(success=True, data=detail.model_dump(), message="success")


@router.put("/{conversation_id}", response_model=StandardResponse)
def rename_conversation(
    conversation_id: str,
    payload: ConversationUpdate,
    repository: ChatRepository = Depends(get_chat_repository),
):
    conversation = repository.update_conversation(conversation_id, payload.title)
    return StandardResponse(
        success=True,
        data={"id": conversation_id, "title": conversation.title if conversation else payload.title},
        message="conversation renamed",
    )


@router.delete("/{conversation_id}", response_model=StandardResponse)
def delete_conversation(
    conversation_id: str,
    repository: ChatRepository = Depends(get_chat_repository),
):
    repository.delete_conversation(conversation_id)
    return StandardResponse(success=True, data={}, message="conversation deleted")


@router.post("/{conversation_id}/feedback", response_model=StandardResponse)
def add_feedback(
    conversation_id: str,
    payload: FeedbackCreate,
    repository: ChatRepository = Depends(get_chat_repository),
):
    feedback = repository.add_feedback(
        Feedback(
            message_id=payload.message_id,
            rating=payload.rating,
            feedback_type=payload.feedback_type,
            comment=payload.comment,
            feedback_metadata={"conversation_id": conversation_id},
            created_at=datetime.utcnow(),
        )
    )
    return StandardResponse(
        success=True,
        data={"id": feedback.id},
        message="feedback saved",
    )
