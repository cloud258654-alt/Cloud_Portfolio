import logging
from typing import Dict, Any

logger = logging.getLogger("app.alert_service")

class AlertService:
    @staticmethod
    def check_and_send_alerts(mention: Dict[str, Any], keyword_text: str):
        if mention.get("sentiment") == "Negative":
            logger.warning(
                f"[ALERT] Negative sentiment for '{keyword_text}' on '{mention.get('platform')}' "
                f"| Author: {mention.get('author')} | Score: {mention.get('sentiment_score')}"
            )
        else:
            logger.info(f"Mention checked. Sentiment: {mention.get('sentiment')}. No alert triggered.")
