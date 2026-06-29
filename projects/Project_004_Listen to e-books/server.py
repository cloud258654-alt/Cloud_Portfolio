from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import edge_tts
import uvicorn
import os
import aiohttp
import json

app = FastAPI()

# Enable CORS for frontend API calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route to serve the main HTML file
@app.get("/")
async def read_index():
    if os.path.exists("index.html"):
        return FileResponse("index.html")
    raise HTTPException(status_code=404, detail="index.html not found")

# Route to serve the stylesheet
@app.get("/style.css")
async def read_style():
    if os.path.exists("style.css"):
        return FileResponse("style.css")
    raise HTTPException(status_code=404, detail="style.css not found")

# Route to serve the main JavaScript logic
@app.get("/app.js")
async def read_js():
    if os.path.exists("app.js"):
        return FileResponse("app.js")
    raise HTTPException(status_code=404, detail="app.js not found")

# Endpoint to test server status
@app.get("/ping")
def ping():
    return {"status": "ok"}

import re

# Helper: extract valid JSON from LLM text response
def extract_json(text: str) -> str:
    """Try to extract a JSON object or array from mixed text output."""
    # Try parsing directly first
    text = text.strip()
    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        pass

    # Remove markdown code fences (handle all variations)
    cleaned = text
    cleaned = re.sub(r'^```(?:json)?\s*\n?', '', cleaned)
    cleaned = re.sub(r'\n?```\s*$', '', cleaned)
    cleaned = cleaned.strip()
    try:
        json.loads(cleaned)
        return cleaned
    except json.JSONDecodeError:
        pass

    # Find the outermost { } or [ ] block
    for start_char, end_char in [("{", "}"), ("[", "]")]:
        start = cleaned.find(start_char)
        end = cleaned.rfind(end_char)
        if start != -1 and end != -1 and end > start:
            candidate = cleaned[start:end + 1]
            try:
                json.loads(candidate)
                return candidate
            except json.JSONDecodeError:
                continue

    # Failed to extract JSON, return original text
    return text

# Request body model for LLM generation endpoint
class LLMRequest(BaseModel):
    prompt: str
    isJson: bool = False
    model: str = "qwen2.5:3b"
    temperature: float = 0.3

# Asynchronous LLM endpoint proxying to local Ollama (no API key required)
@app.post("/api/llm")
async def llm_generate(req: LLMRequest):
    if not req.prompt:
        raise HTTPException(status_code=400, detail="Missing prompt parameter")

    ollama_url = "http://localhost:11434/api/generate"

    # Build prompt: for JSON mode, add strong formatting instruction as a prefix
    final_prompt = req.prompt
    if req.isJson:
        json_prefix = (
            "【重要指示】你必須只輸出合法的 JSON，不要添加任何解釋、前言、結語或 markdown 格式。"
            "直接輸出 JSON 物件，從 { 開始，以 } 結束。\n\n"
        )
        final_prompt = json_prefix + req.prompt

    payload = {
        "model": req.model,
        "prompt": final_prompt,
        "stream": False,
        "options": {
            "temperature": req.temperature
        }
    }

    # Do NOT use Ollama's native "format": "json" — it often produces malformed JSON
    # Instead, rely on prompt instruction + our extract_json post-processing

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(ollama_url, json=payload, timeout=aiohttp.ClientTimeout(total=120)) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    raise HTTPException(status_code=502, detail=f"Ollama error: {resp.status} - {error_text[:200]}")
                data = await resp.json()
                raw_text = data.get("response", "")

        # For JSON mode, extract clean JSON from the response
        if req.isJson:
            # Log raw response for debugging
            print(f"[LLM Debug] Raw response (first 300 chars): {raw_text[:300]}")
            result_text = extract_json(raw_text)
            print(f"[LLM Debug] Extracted JSON (first 300 chars): {result_text[:300]}")
        else:
            result_text = raw_text

        return {"text": result_text}
    except aiohttp.ClientConnectorError:
        raise HTTPException(
            status_code=503,
            detail="無法連線到 Ollama。請確認 Ollama 已安裝並執行（https://ollama.com），然後執行 `ollama pull qwen2.5:3b`"
        )
    except Exception as e:
        print(f"[LLM Error] {e}")
        raise HTTPException(status_code=500, detail=f"LLM 請求失敗: {str(e)[:300]}")

# Request body model for TTS POST endpoint
class TTSRequest(BaseModel):
    text: str
    voice: str = "zh-TW-HsiaoChenNeural"
    rate: str = "+10%"
    pitch: str = "+1Hz"

# Asynchronous TTS endpoint proxying edge-tts voice synthesis
@app.post("/api/tts")
async def tts(req: TTSRequest):
    if not req.text:
        raise HTTPException(status_code=400, detail="Missing text parameter")
    
    # Asynchronous stream generator for chunks of audio bytes
    async def tts_stream():
        try:
            communicate = edge_tts.Communicate(req.text, req.voice, rate=req.rate, pitch=req.pitch)
            async for chunk in communicate.stream():
                if chunk.get("type") == "audio":
                    yield chunk["data"]
        except Exception as e:
            # Output error to server console logs for debugging
            print(f"[TTS Error] Failed to generate speech for text '{req.text[:20]}...': {e}")
            
    return StreamingResponse(tts_stream(), media_type="audio/mpeg")

if __name__ == "__main__":
    # Ensure port reuse is allowed and run server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
