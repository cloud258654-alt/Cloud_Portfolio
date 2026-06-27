"""LINE Bot webhook endpoint."""

import json
import logging

from fastapi import APIRouter, Header, Request
from fastapi.responses import JSONResponse

from app.integrations.line_bot import line_bot

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/line/callback")
async def line_webhook(
    request: Request,
    x_line_signature: str = Header(""),
):
    body = await request.body()
    body_text = body.decode("utf-8")

    if not line_bot.verify_signature(body, x_line_signature):
        logger.warning("LINE webhook: invalid signature")
        return JSONResponse(status_code=401, content={"error": "Invalid signature"})

    try:
        events = json.loads(body_text)
        results = line_bot.handle_webhook(events)
        logger.info("LINE webhook: processed %d events", len(results))
    except Exception as e:
        logger.error("LINE webhook error: %s", e)
        return JSONResponse(status_code=500, content={"error": "Internal error"})

    return JSONResponse(content={"status": "ok"})
