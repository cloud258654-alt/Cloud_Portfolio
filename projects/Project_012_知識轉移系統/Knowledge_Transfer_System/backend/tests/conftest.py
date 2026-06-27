import pytest
from fastapi.testclient import TestClient

from app.core.deps import get_current_user
from app.db.session import get_db
from app.main import app


class FakeDB:
    """Simple in-memory store for unit tests."""

    def __init__(self):
        self.data: dict = {}
        self.committed = False

    def query(self, model):
        return FakeQuery(self, model)

    def add(self, obj):
        pass

    def flush(self):
        pass

    def commit(self):
        self.committed = True

    def close(self):
        pass


class FakeQuery:
    def __init__(self, db, model):
        self.db = db
        self.model = model
        self._filters = []
        self._result = []

    def filter(self, *args):
        self._filters.extend(args)
        return self

    def first(self):
        return self._result[0] if self._result else None

    def all(self):
        return self._result

    def count(self):
        return len(self._result)

    def offset(self, n):
        return self

    def limit(self, n):
        return self

    def order_by(self, *args):
        return self

    def join(self, *args):
        return self


class FakeUser:
    id = "test-user-id"
    email = "test@kts.local"
    name = "Test User"
    job_title = "Tester"
    department_id = None
    status = "active"
    employment_status = "active"
    roles = []


@pytest.fixture
def client(monkeypatch):
    db = FakeDB()

    async def override_get_db():
        yield db

    async def override_get_current_user():
        return FakeUser()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    yield TestClient(app)

    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    return {"Authorization": "Bearer test-token"}
