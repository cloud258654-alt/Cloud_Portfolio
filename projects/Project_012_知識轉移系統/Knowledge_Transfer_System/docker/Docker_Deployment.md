# Docker Deployment

AI Knowledge Transfer System Docker 部署文件

Version: v1.0.0  
Owner: DevOps Architect  
Last Update: 2026-06-25

---

## 1. 目的

本文件說明 AI Knowledge Transfer System 的本機 Docker 部署方式，讓開發者可以用一致的流程啟動基礎設施、應用服務與選配服務。

目前 Docker 設定以 `Knowledge_Transfer_System/docker/docker-compose.yml` 為準，並使用 `../.env` 作為環境變數來源。

---

## 2. 部署範圍

### 預設基礎服務

不指定 profile 時會啟動：

```text
postgres
redis
minio
minio-init
```

### 應用服務

使用 `app` profile 啟動：

```text
backend
worker
frontend
nginx
```

### 選配服務

使用 `optional` profile 啟動：

```text
qdrant
```

使用 `observability` profile 啟動：

```text
prometheus
grafana
```

---

## 3. 專案結構

```text
Knowledge_Transfer_System/
├── backend/
│   ├── Dockerfile
│   └── requirements.txt
├── database/
│   ├── schema_v1.sql
│   └── seed_v1.sql
├── docker/
│   ├── Docker_Deployment.md
│   ├── docker-compose.yml
│   ├── docker-compose.override.yml
│   ├── minio/
│   │   └── README.md
│   ├── nginx/
│   │   └── default.conf
│   ├── postgres/
│   │   └── README.md
│   └── scripts/
│       ├── up.ps1
│       ├── down.ps1
│       ├── logs.ps1
│       ├── reset.ps1
│       ├── up.sh
│       ├── down.sh
│       ├── logs.sh
│       └── reset.sh
├── frontend/
│   ├── Dockerfile
│   └── package.json
└── .env.example
```

---

## 4. 服務說明

| Service | Container | Profile | Port | 說明 |
| --- | --- | --- | --- | --- |
| PostgreSQL | `kts_postgres` | default | `5432` | 主資料庫，使用 pgvector 映像 |
| Redis | `kts_redis` | default | `6379` | 快取、佇列與 Celery broker |
| MinIO | `kts_minio` | default | `9000`, `9001` | 文件、媒體與匯出檔案物件儲存 |
| MinIO Init | `kts_minio_init` | default | N/A | 建立預設 bucket |
| Backend | `kts_backend` | `app` | `8000` | FastAPI 後端 API |
| Worker | `kts_worker` | `app` | N/A | Celery 背景任務 |
| Frontend | `kts_frontend` | `app` | `3000` | Next.js 前端 |
| Nginx | `kts_nginx` | `app` | `80` | 反向代理 |
| Qdrant | `kts_qdrant` | `optional` | `6333` | 選配向量資料庫 |
| Prometheus | `kts_prometheus` | `observability` | `9090` | 選配監控 |
| Grafana | `kts_grafana` | `observability` | `3001` | 選配儀表板 |

---

## 5. 前置需求

請先確認本機已安裝：

```text
Docker Engine 或 Docker Desktop
Docker Compose v2
```

建議使用 Docker Compose v2 指令格式：

```bash
docker compose version
```

---

## 6. 環境變數

第一次啟動前，請從 `.env.example` 建立 `.env`：

```powershell
Copy-Item .env.example .env
```

或在 macOS/Linux：

```bash
cp .env.example .env
```

主要環境變數：

| 變數 | 預設值 | 說明 |
| --- | --- | --- |
| `APP_ENV` | `development` | 執行環境 |
| `APP_DEBUG` | `true` | 是否開啟除錯 |
| `BACKEND_PORT` | `8000` | 後端對外 port |
| `POSTGRES_DB` | `kts_db` | PostgreSQL database |
| `POSTGRES_USER` | `kts_user` | PostgreSQL user |
| `POSTGRES_PASSWORD` | `kts_password` | PostgreSQL password |
| `REDIS_PORT` | `6379` | Redis 對外 port |
| `MINIO_ROOT_USER` | `minioadmin` | MinIO root user |
| `MINIO_ROOT_PASSWORD` | `minioadmin` | MinIO root password |
| `MINIO_BUCKET_DOCUMENTS` | `documents` | 文件 bucket |
| `MINIO_BUCKET_MEDIA` | `media` | 媒體 bucket |
| `MINIO_BUCKET_EXPORTS` | `exports` | 匯出 bucket |
| `VECTOR_STORE` | `pgvector` | 向量儲存後端 |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost` | CORS 允許來源 |

正式環境不可沿用範例中的 secret、password 或 API key。

---

## 7. 啟動方式

以下指令建議在 `Knowledge_Transfer_System` 目錄執行。

### 7.1 啟動基礎服務

只啟動 PostgreSQL、Redis、MinIO：

```powershell
docker\scripts\up.ps1
```

等同於：

```powershell
Set-Location docker
docker compose --env-file ../.env -f docker-compose.yml up -d
```

### 7.2 啟動完整應用

啟動基礎服務加上 backend、worker、frontend、nginx：

```powershell
$env:COMPOSE_PROFILES = "app"
docker\scripts\up.ps1 --build
```

macOS/Linux：

```bash
COMPOSE_PROFILES=app ./docker/scripts/up.sh --build
```

### 7.3 啟動選配 Qdrant

```powershell
$env:COMPOSE_PROFILES = "optional"
docker\scripts\up.ps1
```

### 7.4 啟動監控服務

```powershell
$env:COMPOSE_PROFILES = "observability"
docker\scripts\up.ps1
```

### 7.5 同時啟動全部 profile

```powershell
$env:COMPOSE_PROFILES = "app,optional,observability"
docker\scripts\up.ps1 --build
```

PowerShell 的 `$env:COMPOSE_PROFILES` 會保留在目前 shell session。若要回到預設基礎服務，可清除它：

```powershell
Remove-Item Env:COMPOSE_PROFILES
```

若不使用腳本，也可以在 `docker` 目錄直接執行：

```powershell
docker compose --env-file ../.env --profile app -f docker-compose.yml up -d --build
```

---

## 8. 停止、查看紀錄與重建

### 停止服務

```powershell
docker\scripts\down.ps1
```

macOS/Linux：

```bash
./docker/scripts/down.sh
```

### 查看全部 logs

```powershell
docker\scripts\logs.ps1
```

查看單一服務：

```powershell
docker\scripts\logs.ps1 backend
```

### 清除 volume 並重新建立

此操作會刪除 PostgreSQL、Redis、MinIO 等 Docker volume 內的資料。

```powershell
$env:COMPOSE_PROFILES = "app"
docker\scripts\reset.ps1 --build
```

macOS/Linux：

```bash
COMPOSE_PROFILES=app ./docker/scripts/reset.sh --build
```

---

## 9. 開發模式

`docker-compose.override.yml` 目前提供開發模式 command：

```yaml
services:
  backend:
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    command: npm run dev
```

目前腳本明確指定 `-f docker-compose.yml`，因此不會自動套用 `docker-compose.override.yml`。如果需要套用 override，請在 `docker` 目錄下手動執行：

```powershell
docker compose --env-file ../.env --profile app -f docker-compose.yml -f docker-compose.override.yml up -d --build
```

---

## 10. 資料初始化

PostgreSQL 會在首次建立 volume 時執行：

```text
database/schema_v1.sql
database/seed_v1.sql
```

這兩個檔案掛載到容器內：

```text
/docker-entrypoint-initdb.d/01_schema_v1.sql
/docker-entrypoint-initdb.d/02_seed_v1.sql
```

注意：PostgreSQL init script 只會在資料目錄第一次初始化時執行。若已經存在 `kts_postgres_data` volume，修改 SQL 後不會自動重跑。需要重新初始化時請使用 reset 指令。

MinIO 會透過 `minio-init` 建立以下 buckets：

```text
documents
media
exports
```

實際 bucket 名稱可透過 `.env` 的 `MINIO_BUCKET_*` 變數調整。

---

## 11. 健康檢查

Compose 已設定以下 healthcheck：

| Service | Healthcheck |
| --- | --- |
| PostgreSQL | `pg_isready` |
| Redis | `redis-cli ping` |
| MinIO | `mc ready local` |
| Backend | `GET /api/v1/admin/health` |

Backend 預期健康檢查端點：

```http
GET /api/v1/admin/health
```

預期回應格式：

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

## 12. 開發網址

| 服務 | URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8000` |
| Swagger Docs | `http://localhost:8000/docs` |
| Nginx | `http://localhost` |
| MinIO API | `http://localhost:9000` |
| MinIO Console | `http://localhost:9001` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |
| Qdrant | `http://localhost:6333` |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3001` |

---

## 13. Nginx 設定

Nginx 設定檔位於：

```text
docker/nginx/default.conf
```

目前路由：

| Path | Target |
| --- | --- |
| `/` | `frontend:3000` |
| `/api/` | `backend:8000/api/` |
| `/docs` | `backend:8000/docs` |

目前上傳大小限制：

```nginx
client_max_body_size 1024M;
```

---

## 14. 映像建置

### Backend Dockerfile

位置：

```text
backend/Dockerfile
```

基礎映像：

```text
python:3.11-slim
```

主要系統套件：

```text
build-essential
poppler-utils
tesseract-ocr
ffmpeg
libpq-dev
curl
```

預設 command：

```text
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Dockerfile

位置：

```text
frontend/Dockerfile
```

基礎映像：

```text
node:20-alpine
```

預設 command：

```text
npm run dev
```

---

## 15. 常用操作

### 重新建置 app 服務

```powershell
$env:COMPOSE_PROFILES = "app"
docker\scripts\up.ps1 --build
```

### 進入 backend 容器

```powershell
Set-Location docker
docker compose --env-file ../.env -f docker-compose.yml exec backend bash
```

### 進入 PostgreSQL

```powershell
Set-Location docker
docker compose --env-file ../.env -f docker-compose.yml exec postgres psql -U kts_user -d kts_db
```

### 查看容器狀態

```powershell
Set-Location docker
docker compose --env-file ../.env -f docker-compose.yml ps
```

---

## 16. 故障排查

### `.env` 不存在

症狀：啟動時出現 env file 找不到。

處理：

```powershell
Copy-Item .env.example .env
```

### Backend 未啟動

確認是否有指定 `app` profile：

```powershell
$env:COMPOSE_PROFILES = "app"
docker\scripts\up.ps1 --build
```

### SQL 修改後沒有生效

PostgreSQL init script 只會在 volume 第一次建立時執行。需要重建資料庫 volume：

```powershell
docker\scripts\reset.ps1
```

### Port 被占用

請修改 `.env` 中的 port，例如：

```env
BACKEND_PORT=18000
POSTGRES_PORT=15432
REDIS_PORT=16379
```

MinIO、Frontend、Nginx、Qdrant、Prometheus、Grafana 的 port 目前寫在 `docker-compose.yml` 中；若衝突，需直接調整 compose。

### MinIO bucket 沒有建立

確認 `minio` 是否 healthy，並查看 `minio-init` logs：

```powershell
docker\scripts\logs.ps1 minio-init
```

---

## 17. 生產環境注意事項

正式環境部署前至少需要調整：

```text
關閉 APP_DEBUG
更換 APP_SECRET_KEY 與 JWT_SECRET_KEY
更換 PostgreSQL 與 MinIO 密碼
不要使用預設 minioadmin
設定 HTTPS 與正式網域
限制 CORS_ORIGINS
設定備份與還原流程
設定集中式 logging
設定監控與告警
移除開發用 volume mount
避免使用 npm run dev 作為正式前端 command
使用 production ASGI server 設定
保護 AI provider API keys
```

---

## 18. 備份建議

### PostgreSQL

建議使用排程執行：

```bash
pg_dump
```

### MinIO

建議採用：

```text
bucket replication
scheduled object backup
lifecycle policy
```

### Redis

Redis 目前主要用於 cache、queue 與 Celery broker。若未來承載不可遺失資料，需啟用 persistence 並納入備份策略。

---

## 19. 安全檢查

部署前請確認：

```text
.env 不提交到 Git
正式 secret 不使用範例值
對外服務有防火牆或網路限制
API 有 rate limit
MinIO bucket 不公開敏感資料
資料庫不直接暴露到公開網路
Nginx 啟用 HTTPS
AI API Key 使用 secret manager 或部署平台 secret
```

---

## 20. 後續演進

未來可擴充：

```text
Kubernetes
Helm Chart
AWS ECS
Azure Container Apps
GCP Cloud Run
On-Premise deployment
Hybrid cloud deployment
Prometheus scrape config
Grafana dashboard provisioning
CI/CD image build and release
```

---

## 21. 完成標準

Docker 部署視為完成時，需符合：

```text
一個指令可啟動本機完整應用
基礎服務有 healthcheck
資料庫與物件儲存可初始化
backend、worker、frontend 可透過 profile 啟動
Nginx 可代理 frontend 與 API
文件與實際 docker-compose.yml 一致
開發者能依照本文件完成啟動、停止、查看 logs 與重建
```
