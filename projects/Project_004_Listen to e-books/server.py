from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import edge_tts
import uvicorn
import os

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

# Asynchronous TTS endpoint proxying edge-tts voice synthesis
@app.get("/api/tts")
async def tts(text: str, voice: str = "zh-TW-HsiaoChenNeural", rate: str = "+10%", pitch: str = "+1Hz"):
    if not text:
        raise HTTPException(status_code=400, detail="Missing text parameter")
    
    # Asynchronous stream generator for chunks of audio bytes
    async def tts_stream():
        try:
            communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]
        except Exception as e:
            # Output error to server console logs for debugging
            print(f"[TTS Error] Failed to generate speech for text '{text[:20]}...': {e}")
            
    return StreamingResponse(tts_stream(), media_type="audio/mpeg")

if __name__ == "__main__":
    # Ensure port reuse is allowed and run server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
