# Docker_Deployment

AI Knowledge Transfer System

Docker Deployment Specification

Version : v1.0.0

Owner : DevOps Architect

Last Update : 2026-06-25

---

# 1. Purpose

本文件定義 AI Knowledge Transfer System 的 Docker 本地開發與部署規格。

目標是讓開發者可以用一個指令啟動完整系統：

```bash
docker compose up -d
```

---

# 2. Deployment Scope

本 Docker 環境需包含：

```text
frontend
backend
worker
postgres
redis
minio
nginx
```

選配：

```text
qdrant
ollama
prometheus
grafana
```

---

# 3. Recommended Project Structure

```text
Knowledge_Transfer_System/
├── frontend/
├── backend/
├── worker/
├── docker/
│   ├── Docker_Deployment.md
│   ├── docker-compose.yml
│   ├── docker-compose.override.yml
│   ├── nginx/
│   │   └── default.conf
│   ├── postgres/
│   │   └── init.sql
│   ├── minio/
│   │   └── README.md
│   └── scripts/
│       ├── up.sh
│       ├── down.sh
│       ├── logs.sh
│       └── reset.sh
├── .env.example
└── README.md
```

---

# 4. Core Services

## 4.1 Frontend

Technology:

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
```

Container:

```text
frontend
```

Port:

```text
3000
```

---

## 4.2 Backend API

Technology:

```text
FastAPI
Python
SQLAlchemy
Alembic
Pydantic
```

Container:

```text
backend
```

Port:

```text
8000
```

---

## 4.3 Worker

Technology:

```text
Celery
Python
Redis
```

Container:

```text
worker
```

用途：

```text
OCR
Embedding
Document Parsing
Speech to Text
SOP Generation
Training Generation
Agent Tasks
```

---

## 4.4 PostgreSQL

Technology:

```text
PostgreSQL 16
pgvector
uuid-ossp
pg_trgm
```

Container:

```text
postgres
```

Port:

```text
5432
```

---

## 4.5 Redis

用途：

```text
cache
queue
rate limit
session
celery broker
```

Container:

```text
redis
```

Port:

```text
6379
```

---

## 4.6 MinIO

用途：

```text
document storage
audio storage
video storage
screenshot storage
export files
```

Container:

```text
minio
```

Ports:

```text
9000
9001
```

---

## 4.7 Nginx

用途：

```text
reverse proxy
static file proxy
api proxy
upload size control
```

Container:

```text
nginx
```

Ports:

```text
80
443
```

---

# 5. Optional Services

## 5.1 Qdrant

如果不使用 pgvector，可使用 Qdrant。

Container:

```text
qdrant
```

Port:

```text
6333
```

---

## 5.2 Ollama

用於本地 LLM 測試。

Container:

```text
ollama
```

Port:

```text
11434
```

---

## 5.3 Prometheus

監控系統指標。

Port:

```text
9090
```

---

## 5.4 Grafana

Dashboard。

Port:

```text
3001
```

---

# 6. Environment Variables

建立：

```text
.env.example
```

內容：

```env
# App
APP_NAME=AI Knowledge Transfer System
APP_ENV=development
APP_DEBUG=true
APP_SECRET_KEY=change-me

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Backend
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
JWT_SECRET_KEY=change-me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=kts_db
POSTGRES_USER=kts_user
POSTGRES_PASSWORD=kts_password
DATABASE_URL=postgresql+psycopg2://kts_user:kts_password@postgres:5432/kts_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379/0

# Celery
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET_DOCUMENTS=documents
MINIO_BUCKET_MEDIA=media
MINIO_BUCKET_EXPORTS=exports
MINIO_SECURE=false

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# Embedding
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536

# OCR
OCR_PROVIDER=paddleocr

# STT
STT_PROVIDER=whisper

# Vector Store
VECTOR_STORE=pgvector

# Upload
MAX_UPLOAD_SIZE_MB=1024

# Security
CORS_ORIGINS=http://localhost:3000
```

---

# 7. docker-compose.yml

Codex 需建立：

```yaml
version: "3.9"

services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: kts_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: kts_db
      POSTGRES_USER: kts_user
      POSTGRES_PASSWORD: kts_password
    ports:
      - "5432:5432"
    volumes:
      - kts_postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - kts_network

  redis:
    image: redis:7-alpine
    container_name: kts_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    networks:
      - kts_network

  minio:
    image: minio/minio:latest
    container_name: kts_minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - kts_minio_data:/data
    networks:
      - kts_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: kts_backend
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
      - minio
    volumes:
      - ./backend:/app
    networks:
      - kts_network

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: kts_worker
    restart: unless-stopped
    command: celery -A app.worker.celery_app worker --loglevel=info
    env_file:
      - .env
    depends_on:
      - backend
      - redis
      - postgres
      - minio
    volumes:
      - ./backend:/app
    networks:
      - kts_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: kts_frontend
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - kts_network

  nginx:
    image: nginx:alpine
    container_name: kts_nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - frontend
      - backend
    networks:
      - kts_network

volumes:
  kts_postgres_data:
  kts_minio_data:

networks:
  kts_network:
    driver: bridge
```

---

# 8. docker/postgres/init.sql

Codex 需建立：

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS org;
CREATE SCHEMA IF NOT EXISTS knowledge;
CREATE SCHEMA IF NOT EXISTS ai;
CREATE SCHEMA IF NOT EXISTS training;
CREATE SCHEMA IF NOT EXISTS agent;
CREATE SCHEMA IF NOT EXISTS governance;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS audit;
```

---

# 9. docker/nginx/default.conf

Codex 需建立：

```nginx
server {
    listen 80;

    client_max_body_size 1024M;

    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /docs {
        proxy_pass http://backend:8000/docs;
    }
}
```

---

# 10. Backend Dockerfile

位置：

```text
backend/Dockerfile
```

內容：

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    poppler-utils \
    tesseract-ocr \
    ffmpeg \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

---

# 11. Frontend Dockerfile

位置：

```text
frontend/Dockerfile
```

內容：

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
```

---

# 12. Required Backend Packages

Codex 需建立：

```text
backend/requirements.txt
```

內容：

```text
fastapi
uvicorn[standard]
sqlalchemy
alembic
psycopg2-binary
pydantic
pydantic-settings
python-jose[cryptography]
passlib[bcrypt]
python-multipart
redis
celery
boto3
minio
pgvector
openai
anthropic
google-generativeai
pymupdf
pdfplumber
python-docx
openpyxl
python-pptx
pillow
pytesseract
paddleocr
whisper
ffmpeg-python
python-dotenv
loguru
pytest
httpx
```

---

# 13. Required Frontend Packages

Codex 需建立：

```text
frontend/package.json
```

必要套件：

```text
next
react
react-dom
typescript
tailwindcss
shadcn/ui
lucide-react
framer-motion
zustand
@tanstack/react-query
react-hook-form
zod
recharts
axios
```

---

# 14. Startup Scripts

## 14.1 docker/scripts/up.sh

```bash
#!/bin/bash
docker compose up -d
```

---

## 14.2 docker/scripts/down.sh

```bash
#!/bin/bash
docker compose down
```

---

## 14.3 docker/scripts/logs.sh

```bash
#!/bin/bash
docker compose logs -f
```

---

## 14.4 docker/scripts/reset.sh

```bash
#!/bin/bash
docker compose down -v
docker compose up -d --build
```

---

# 15. Health Check

Backend：

```http
GET /api/v1/admin/health
```

Response：

```json
{
  "status": "ok",
  "services": {
    "postgres": "ok",
    "redis": "ok",
    "minio": "ok"
  }
}
```

---

# 16. Local Development Commands

啟動：

```bash
cp .env.example .env
docker compose up -d --build
```

查看 log：

```bash
docker compose logs -f backend
```

關閉：

```bash
docker compose down
```

重置：

```bash
docker compose down -v
docker compose up -d --build
```

---

# 17. Development URLs

```text
Frontend:
http://localhost:3000

Backend API:
http://localhost:8000

Swagger Docs:
http://localhost:8000/docs

MinIO Console:
http://localhost:9001

PostgreSQL:
localhost:5432

Redis:
localhost:6379
```

---

# 18. Production Notes

正式環境需調整：

```text
disable debug
secure JWT secret
enable HTTPS
use production database password
enable object storage lifecycle
enable backup
enable monitoring
enable logging
disable reload
use gunicorn/uvicorn workers
```

---

# 19. Backup Strategy

PostgreSQL：

```bash
pg_dump
```

MinIO：

```text
bucket replication
scheduled backup
```

Redis：

```text
optional persistence
```

---

# 20. Security Notes

必須：

```text
.env 不可提交 Git
使用強密碼
正式環境必須 HTTPS
API 需 rate limit
上傳檔案需病毒掃描
MinIO Bucket 不可公開
AI API Key 必須使用 secret manager
```

---

# 21. Deployment Stages

```text
local
development
staging
production
```

---

# 22. Future Deployment

v2.0 可支援：

```text
Kubernetes
Helm Chart
AWS ECS
Azure Container Apps
GCP Cloud Run
On-Premise
Hybrid Cloud
```

---

# 23. Final Goal

本 Docker Deployment 的目標：

讓整套 Enterprise AI Knowledge Platform 能夠：

```text
one command start
repeatable
portable
developer friendly
production ready foundation
```

成為後續 Codex 開發、測試與部署的標準環境。
