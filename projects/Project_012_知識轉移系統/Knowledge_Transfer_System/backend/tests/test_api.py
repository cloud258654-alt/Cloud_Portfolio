from app.services.health_service import HealthService


def test_health_endpoint_returns_200(client, monkeypatch):
    def fake_check_all():
        return {
            "status": "ok",
            "services": {"postgres": "ok", "redis": "ok", "minio": "ok"},
        }

    monkeypatch.setattr(HealthService, "check_all", fake_check_all)

    response = client.get("/api/v1/admin/health")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "ok"


def test_login_requires_db(client, monkeypatch):
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.login",
        lambda db, email, password: {"access_token": "fake-token", "token_type": "bearer"},
    )

    response = client.post("/api/v1/auth/login", json={"email": "test@kts.local", "password": "test"})
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["access_token"] == "fake-token"


def test_me_endpoint_returns_user(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["email"] == "test@kts.local"
    assert body["data"]["name"] == "Test User"


def test_me_endpoint_requires_auth(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 403


def test_admin_health_no_auth_required(client, monkeypatch):
    def fake_check_all():
        return {
            "status": "ok",
            "services": {"postgres": "ok"},
        }

    monkeypatch.setattr(HealthService, "check_all", fake_check_all)

    response = client.get("/api/v1/admin/health")
    assert response.status_code == 200
