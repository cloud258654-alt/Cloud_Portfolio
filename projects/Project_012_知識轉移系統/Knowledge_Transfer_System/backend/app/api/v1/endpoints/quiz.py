from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.response import StandardResponse
from app.services.quiz_service import QuizService

router = APIRouter()


class QuizGenerateRequest(BaseModel):
    document_text: str
    title: str
    count: int = 5


class QuizGradeRequest(BaseModel):
    quiz: list[dict]
    answers: list[int]


@router.post("/generate", response_model=StandardResponse)
def generate_quiz(body: QuizGenerateRequest):
    service = QuizService()
    result = service.generate_from_document(body.document_text, body.title, body.count)
    return StandardResponse(success=True, data=result, message="ok")


@router.post("/grade", response_model=StandardResponse)
def grade_quiz(body: QuizGradeRequest):
    service = QuizService()
    result = service.grade(body.quiz, body.answers)
    return StandardResponse(success=True, data=result, message="ok")
