"""LINE Bot integration using LINE Messaging API + RAG pipeline."""

import json
import logging
import os
from urllib.request import Request, urlopen

from app.ai.chat_service import ChatService
from app.schemas.chat import ChatRequest

logger = logging.getLogger(__name__)


class LineBot:
    """LINE Messaging API bot with RAG-powered responses.

    Requires environment variables:
        LINE_CHANNEL_ACCESS_TOKEN
        LINE_CHANNEL_SECRET
    """

    def __init__(self, db_session_factory=None):
        self.access_token = os.getenv("LINE_CHANNEL_ACCESS_TOKEN", "")
        self.channel_secret = os.getenv("LINE_CHANNEL_SECRET", "")
        self.enabled = bool(self.access_token and self.channel_secret)
        self._db_factory = db_session_factory

    def verify_signature(self, body: bytes, signature: str) -> bool:
        if not self.channel_secret:
            return False
        import hashlib
        import hmac

        computed = hmac.new(
            self.channel_secret.encode("utf-8"),
            body,
            hashlib.sha256,
        ).digest()
        try:
            return hmac.compare_digest(computed, bytes.fromhex(signature))
        except (ValueError, TypeError):
            return False

    def handle_webhook(self, body: dict) -> list[dict]:
        events = body.get("events", [])
        results = []

        for event in events:
            if event.get("type") != "message":
                continue

            message = event.get("message", {})
            if message.get("type") != "text":
                continue

            user_text = message.get("text", "").strip()
            reply_token = event.get("replyToken", "")
            user_id = event.get("source", {}).get("userId", "")

            answer = self._get_answer(user_text, user_id)
            self._send_reply(reply_token, answer)
            results.append({"user_id": user_id, "question": user_text, "answer": answer[:200]})

        return results

    def _get_answer(self, question: str, user_id: str) -> str:
        try:
            from app.db.session import SessionLocal

            db = SessionLocal()
            try:
                service = ChatService(db)
                result = service.ask(ChatRequest(
                    question=question,
                    conversation_id=f"line_{user_id}",
                ))
                db.close()

                citations = "\n".join(
                    f"📄 {c.document_title} (v{c.version or 'n/a'})"
                    for c in result.citations[:3]
                )
                tier_emoji = {"verified": "🟢", "partial": "🟡", "uncertain": "🔴"}
                tier_label = tier_emoji.get(result.confidence_tier, "⚪")

                header = f"{tier_label} 回答（可信度：{result.confidence:.0%}）"
                body = result.answer[:2800]
                footer = f"📚 參考來源：\n{citations}" if citations else ""

                grounded = f"{header}\n\n{body}\n\n{footer}"

                if len(grounded) > 4500:
                    grounded = grounded[:4500] + "..."

                return grounded
            except Exception:
                db.close()
                raise
        except Exception as e:
            logger.warning("LINE RAG lookup failed: %s", e)
            return (
                "目前無法從知識庫中檢索到相關資訊。"
                "\n建議："
                "\n- 確認知識庫中已有相關文件"
                "\n- 換一種方式描述您的問題"
                "\n- 聯繫管理員補充相關知識"
            )

    def _send_reply(self, reply_token: str, text: str) -> bool:
        if not self.access_token or not reply_token:
            return False

        try:
            body = json.dumps({
                "replyToken": reply_token,
                "messages": [{"type": "text", "text": text}],
            }).encode("utf-8")

            req = Request(
                "https://api.line.me/v2/bot/message/reply",
                data=body,
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                },
            )
            urlopen(req, timeout=10)
            return True
        except Exception as e:
            logger.warning("LINE reply failed: %s", e)
            return False


line_bot = LineBot()
