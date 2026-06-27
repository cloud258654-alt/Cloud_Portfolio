import json
import logging

from app.ai.ai_gateway import ai_gateway

logger = logging.getLogger(__name__)


class QuizService:
    def generate_from_document(self, document_text: str, title: str, count: int = 5) -> list[dict]:
        prompt = (
            f"Generate {count} multiple-choice quiz questions based on the following document. "
            "Return ONLY a JSON array. Each object must have: "
            "question (string), options (array of 4 strings), correct_index (int 0-3), "
            "explanation (string), source (string with relevant quote from the text).\n\n"
            f"Document Title: {title}\n\n"
            f"Document Content:\n{document_text[:3000]}"
        )

        messages = [
            {"role": "system", "content": "You are an expert quiz generator. Output ONLY valid JSON array."},
            {"role": "user", "content": prompt},
        ]

        try:
            response = ai_gateway.chat(messages, temperature=0.3, max_tokens=2048)
            result = json.loads(response)
            return result if isinstance(result, list) else []
        except Exception as e:
            logger.warning("Quiz generation failed: %s", e)
            return self._fallback_quiz(document_text, count)

    @staticmethod
    def _fallback_quiz(text: str, count: int) -> list[dict]:
        sentences = [s.strip() for s in text.split("。") if len(s.strip()) > 20]
        quiz = []
        for i, sentence in enumerate(sentences[:count]):
            quiz.append({
                "question": f"根據文件內容，以下哪一項是正確的？",
                "options": [
                    sentence[:80],
                    "以上皆非",
                    "文件未提及此內容",
                    "部分正確但缺少關鍵細節",
                ],
                "correct_index": 0,
                "explanation": f"文件原文：{sentence[:120]}",
                "source": sentence[:200],
            })
        return quiz

    def grade(self, quiz: list[dict], answers: list[int]) -> dict:
        correct = 0
        results = []
        for i, (q, a) in enumerate(zip(quiz, answers)):
            is_correct = a == q["correct_index"]
            if is_correct:
                correct += 1
            results.append({
                "question_index": i,
                "user_answer": a,
                "correct_answer": q["correct_index"],
                "is_correct": is_correct,
                "explanation": q.get("explanation", ""),
            })

        total = len(quiz)
        return {
            "score": correct,
            "total": total,
            "percentage": round(correct / max(total, 1) * 100),
            "passed": (correct / max(total, 1)) >= 0.8,
            "results": results,
        }
