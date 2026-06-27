import json
import logging
import os
from urllib.request import Request, urlopen

from app.ai.chat_service import ChatService
from app.schemas.chat import ChatRequest

logger = logging.getLogger(__name__)


class SlackBot:
    """Slack-integrated RAG knowledge bot."""

    def __init__(self):
        self.token = os.getenv("SLACK_BOT_TOKEN", "")
        self.signing_secret = os.getenv("SLACK_SIGNING_SECRET", "")
        self.enabled = bool(self.token and self.signing_secret)

    def handle_slash_command(self, text: str, channel_id: str, user_id: str) -> dict:
        if not text.strip():
            return {"text": "Usage: `/kts ask <question>`"}

        question = text.strip()
        try:
            from app.db.session import SessionLocal

            db = SessionLocal()
            try:
                service = ChatService(db)
                result = service.ask(ChatRequest(
                    question=question,
                    conversation_id=f"slack_{user_id}",
                ))
                db.close()

                citations = "\n".join(
                    f"• *{c.document_title}* (score: {c.score:.0%})"
                    for c in result.citations[:5]
                )
                tier_emoji = {"verified": "🟢", "partial": "🟡", "uncertain": "🔴"}
                tier_label = tier_emoji.get(result.confidence_tier, "⚪")

                msg = (
                    f"*Q:* {question}\n\n"
                    f"*Answer* {tier_label}: {result.answer}\n\n"
                )
                if citations:
                    msg += f"*Sources:*\n{citations}"

                return {"response_type": "in_channel", "text": msg[:3000]}
            except Exception:
                db.close()
                raise
        except Exception as e:
            logger.warning("Slack RAG lookup failed: %s", e)
            return {"text": "知識庫查詢失敗，請確認文件已上傳並完成處理。"}

    def post_message(self, channel: str, text: str) -> bool:
        if not self.token:
            return False
        try:
            body = json.dumps({"channel": channel, "text": text[:3000]}).encode("utf-8")
            req = Request(
                "https://slack.com/api/chat.postMessage",
                data=body,
                headers={
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json; charset=utf-8",
                },
            )
            urlopen(req, timeout=10)
            return True
        except Exception as e:
            logger.warning("Slack post failed: %s", e)
            return False


slack_bot = SlackBot()
