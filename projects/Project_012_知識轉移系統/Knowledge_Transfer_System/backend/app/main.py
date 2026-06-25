import os

from fastapi import FastAPI


app = FastAPI(
    title=os.getenv("APP_NAME", "AI Knowledge Transfer System"),
    version="1.0.0",
)


@app.get("/api/v1/admin/health")
def health() -> dict:
    return {
        "status": "ok",
        "services": {
            "postgres": "configured",
            "redis": "configured",
            "minio": "configured",
        },
    }
