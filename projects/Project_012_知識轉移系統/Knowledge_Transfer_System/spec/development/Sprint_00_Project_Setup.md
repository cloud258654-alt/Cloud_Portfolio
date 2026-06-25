# Sprint_00_Project_Setup

AI Knowledge Transfer System

Sprint Development Plan

Sprint : 00

Sprint Name : Project Foundation Setup

Version : v1.0.0

Owner : Project Manager / Tech Lead

Last Update : 2026-06-25

---

# 1. Sprint Goal

建立 AI Knowledge Transfer System 的可執行專案骨架。

本 Sprint 完成後，系統必須可以透過：

```bash
docker compose up -d --build
```

啟動：

```text
Frontend
Backend
PostgreSQL
Redis
MinIO
Worker
Nginx
```

並可確認：

```text
Frontend 可開啟
Backend Health Check 正常
Swagger Docs 可開啟
PostgreSQL 可連線
Redis 可連線
MinIO 可開啟
```

---

# 2. Business Value

Sprint 00 的目的不是建立功能，而是建立可持續開發的工程基礎。

完成後，後續 Sprint 可以穩定開發：

```text
Authentication
Document Center
RAG
Search
AI QA
SOP
Training
Agent
Dashboard
```

---

# 3. Scope

本 Sprint 包含：

```text
Project Folder Structure
Docker Compose
Backend FastAPI Foundation
Frontend Next.js Foundation
PostgreSQL Connection
Redis Connection
MinIO Connection
Alembic Setup
Celery Worker Setup
Health Check API
Environment Config
Base Response Format
Base Exception
Logging
Testing Framework
```

---

# 4. Out of Scope

本 Sprint 不實作：

```text
Login
JWT
Document Upload
AI QA
RAG
OCR
Embedding
Search
SOP Generator
Training
Agent
Dashboard
```

---

# 5. Required Folder Structure

請建立以下完整目錄：

```text
Knowledge_Transfer_System/
├── frontend/
├── backend/
├── worker/
├── docker/
├── development/
├── spec/
├── modules/
├── prompts/
├── assets/
├── versions/
├── .env.example
├── docker-compose.yml
└── README.md
```

---

# 6. Backend Folder Structure

請建立：

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── v1/
│   │   │   ├── router.py
│   │   │   └── endpoints/
│   │   │       └── health.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── logging.py
│   │   └── exceptions.py
│   ├── db/
│   │   ├── session.py
│   │   ├── base.py
│   │   └── init_db.py
│   ├── models/
│   │   └── base.py
│   ├── schemas/
│   │   └── response.py
│   ├── services/
│   │   └── health_service.py
│   ├── repositories/
│   │   └── base_repository.py
│   ├── workers/
│   │   └── celery_app.py
│   ├── ai/
│   │   └── ai_gateway.py
│   ├── search/
│   │   └── search_gateway.py
│   └── utils/
│       └── datetime.py
├── alembic/
├── tests/
│   └── test_health.py
├── Dockerfile
├── requirements.txt
├── alembic.ini
└── pyproject.toml
```

---

# 7. Frontend Folder Structure

請建立：

```text
frontend/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   └── common/
├── lib/
│   ├── api.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/
├── stores/
├── services/
│   └── health-service.ts
├── types/
│   └── api.ts
├── styles/
├── public/
├── Dockerfile
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

# 8. Docker Requirements

請建立：

```text
docker-compose.yml
docker/nginx/default.conf
docker/postgres/init.sql
docker/scripts/up.sh
docker/scripts/down.sh
docker/scripts/logs.sh
docker/scripts/reset.sh
```

Docker 服務需包含：

```text
postgres
redis
minio
backend
worker
frontend
nginx
```

---

# 9. Environment Variables

請建立：

```text
.env.example
```

必須包含：

```env
APP_NAME=AI Knowledge Transfer System
APP_ENV=development
APP_DEBUG=true
APP_SECRET_KEY=change-me

NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

JWT_SECRET_KEY=change-me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=kts_db
POSTGRES_USER=kts_user
POSTGRES_PASSWORD=kts_password
DATABASE_URL=postgresql+psycopg2://kts_user:kts_password@postgres:5432/kts_db

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379/0

CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

MINIO_ENDPOINT=minio:9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET_DOCUMENTS=documents
MINIO_BUCKET_MEDIA=media
MINIO_BUCKET_EXPORTS=exports
MINIO_SECURE=false

OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536

VECTOR_STORE=pgvector

CORS_ORIGINS=http://localhost:3000
```

---

# 10. Backend Requirements

## 10.1 FastAPI App

建立：

```text
backend/app/main.py
```

需求：

```text
建立 FastAPI app
掛載 /api/v1 router
啟用 CORS
啟用 exception handler
啟用 structured logging
提供 Swagger Docs
```

---

## 10.2 Health Check API

建立：

```http
GET /api/v1/admin/health
```

Response：

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "services": {
      "postgres": "ok",
      "redis": "ok",
      "minio": "ok"
    }
  },
  "message": "system healthy"
}
```

---

## 10.3 Standard Response

所有 API 回傳格式：

```json
{
  "success": true,
  "data": {},
  "message": "success"
}
```

錯誤格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

---

# 11. Database Requirements

建立 PostgreSQL 連線設定。

必須支援：

```text
SQLAlchemy
Alembic
PostgreSQL
pgvector
uuid-ossp
pg_trgm
```

Sprint 00 不需要建立完整資料表。

只需要：

```text
確認 database connection 正常
建立 Alembic 基礎設定
建立 Base Model
```

---

# 12. Redis Requirements

建立 Redis 連線測試。

用途：

```text
cache
queue
celery broker
```

Health Check 需檢查 Redis 是否正常。

---

# 13. MinIO Requirements

建立 MinIO 連線測試。

啟動時需確認 bucket：

```text
documents
media
exports
```

若不存在，系統可自動建立。

Health Check 需檢查 MinIO 是否正常。

---

# 14. Celery Worker Requirements

建立：

```text
backend/app/workers/celery_app.py
```

需求：

```text
可啟動 worker
可連線 Redis
建立測試 task
```

測試 task：

```text
debug_task
```

---

# 15. Frontend Requirements

## 15.1 Home Page

建立首頁：

```text
/
```

顯示：

```text
AI Knowledge Transfer System
System Status
Frontend Running
Backend Health Check Button
```

---

## 15.2 Health Check Button

Frontend 需呼叫：

```http
GET /api/v1/admin/health
```

並顯示：

```text
PostgreSQL: ok
Redis: ok
MinIO: ok
```

---

## 15.3 UI Style

遵守：

```text
spec/UI/Design_System.md
```

初版使用：

```text
Warm White Background
Rounded Card
Soft Shadow
Green Accent
```

---

# 16. Testing Requirements

建立 Backend 測試：

```text
backend/tests/test_health.py
```

測試：

```text
GET /api/v1/admin/health returns 200
response.success = true
```

建立 Frontend 基本測試可以先略過。

---

# 17. Logging Requirements

建立：

```text
backend/app/core/logging.py
```

支援：

```text
info
warning
error
debug
```

Log 需包含：

```text
timestamp
level
module
message
```

---

# 18. Error Handling

建立：

```text
backend/app/core/exceptions.py
```

至少包含：

```text
AppException
DatabaseConnectionError
RedisConnectionError
StorageConnectionError
```

---

# 19. Code Quality Requirements

Backend：

```text
black
ruff
pytest
mypy optional
```

Frontend：

```text
eslint
prettier
typescript strict
```

---

# 20. Acceptance Criteria

本 Sprint 完成後必須符合：

```text
docker compose up -d --build 可成功執行
Frontend 可在 http://localhost:3000 開啟
Backend 可在 http://localhost:8000/docs 開啟
Health Check API 回傳 success=true
PostgreSQL health = ok
Redis health = ok
MinIO health = ok
Celery worker 可啟動
Frontend 可呼叫 Backend Health API
Alembic 初始化完成
所有程式無明顯啟動錯誤
```

---

# 21. Definition of Done

完成定義：

```text
所有目錄建立完成
Docker 可啟動
Backend 啟動成功
Frontend 啟動成功
Health Check 成功
基本測試通過
README 更新
.env.example 完成
無 hard-coded secret
無重大錯誤 log
```

---

# 22. Codex Execution Instruction

請依照本 Sprint 文件執行。

重要限制：

```text
不要實作登入
不要實作文件上傳
不要實作 AI QA
不要實作 RAG
不要實作完整資料表
不要跳到下一個 Sprint
```

只完成：

```text
Project Foundation Setup
```

完成後請輸出：

```text
完整目錄樹
啟動指令
測試指令
Health Check 結果
下一步建議
```

---

# 23. Next Sprint

Sprint 00 完成後，下一個 Sprint：

```text
development/Sprint_01_Authentication.md
```

內容將包含：

```text
User
Role
Permission
JWT
Login
Refresh Token
RBAC
Department
Profile
```
