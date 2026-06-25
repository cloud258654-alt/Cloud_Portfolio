from fastapi.testclient import TestClient

from app.main import app
from app.services.health_service import HealthService


def test_health_check_returns_standard_response(monkeypatch):
    def fake_check_all():
        return {
            "status": "ok",
            "services": {
                "postgres": "ok",
                "redis": "ok",
                "minio": "ok",
            },
        }

    monkeypatch.setattr(HealthService, "check_all", fake_check_all)

    client = TestClient(app)
    response = client.get("/api/v1/admin/health")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "ok"
    assert body["data"]["services"]["postgres"] == "ok"
    assert body["data"]["services"]["redis"] == "ok"
    assert body["data"]["services"]["minio"] == "ok"
    assert body["message"] == "system healthy"
