import logging
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIGateway:
    """Unified AI gateway routing to configured providers."""

    def __init__(self):
        self._openai_client = None
        self._anthropic_client = None

    @property
    def openai_client(self):
        if self._openai_client is None and settings.openai_api_key:
            from openai import OpenAI
            self._openai_client = OpenAI(api_key=settings.openai_api_key)
        return self._openai_client

    def chat(
        self,
        messages: list[dict[str, str]],
        *,
        model: str = "gpt-4o-mini",
        temperature: float = 0.2,
        max_tokens: int = 2048,
        provider: str = "openai",
    ) -> str:
        if provider == "openai" and self.openai_client:
            return self._chat_openai(messages, model, temperature, max_tokens)
        if provider == "anthropic" and settings.anthropic_api_key:
            return self._chat_anthropic(messages, model, temperature, max_tokens)
        if provider == "gemini" and settings.gemini_api_key:
            return self._chat_gemini(messages, model, temperature, max_tokens)

        return self._chat_fallback(messages)

    def _chat_openai(self, messages, model, temperature, max_tokens) -> str:
        response = self.openai_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""

    def _chat_anthropic(self, messages, model, temperature, max_tokens) -> str:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        system_msg = next((m["content"] for m in messages if m["role"] == "system"), None)
        user_msgs = [m for m in messages if m["role"] != "system"]

        kwargs: dict[str, Any] = {
            "model": model or "claude-3-haiku-20240307",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": user_msgs,
        }
        if system_msg:
            kwargs["system"] = system_msg

        response = client.messages.create(**kwargs)
        return response.content[0].text if response.content else ""

    def _chat_gemini(self, messages, model, temperature, max_tokens) -> str:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)
        model_name = model or "gemini-2.0-flash"

        contents: list[dict] = []
        for m in messages:
            if m["role"] == "system":
                contents.append({"role": "user", "parts": [m["content"]]})
            else:
                role = "model" if m["role"] == "assistant" else "user"
                contents.append({"role": role, "parts": [m["content"]]})

        response = genai.GenerativeModel(model_name).generate_content(
            contents,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            },
        )
        return response.text or ""

    @staticmethod
    def _chat_fallback(messages: list[dict[str, str]]) -> str:
        user_msg = next((m["content"] for m in messages if m["role"] == "user"), "")
        if not user_msg:
            return "No input provided."
        return (
            f"[Offline Mode] No AI API key configured.\n"
            f"Question: {user_msg}\n"
            f"Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY in .env to enable AI features."
        )


ai_gateway = AIGateway()
