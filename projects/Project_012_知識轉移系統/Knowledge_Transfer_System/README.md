# AI Knowledge Transfer System (KTS)

Enterprise AI platform for knowledge management, search, and transfer.

## Quick Start

```bash
# 1. Enter project directory
cd Knowledge_Transfer_System

# 2. Create environment file
cp .env.example .env

# 3. (Optional) Set your OpenAI API key in .env for AI features
#    OPENAI_API_KEY=sk-xxxxx

# 4. Start all services
docker compose -f docker/docker-compose.yml --profile app up -d

# 5. Create admin user (wait ~30s for backend to be ready)
docker compose -f docker/docker-compose.yml --profile app exec backend python scripts/create_admin.py
```

## Access

| Service | URL | Credentials |
|---|---|---|
| **Frontend** | http://localhost:3000 | Login with admin user |
| **API Docs** | http://localhost:8000/docs | — |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin |
| **Grafana** | http://localhost:3001 | admin / admin (with `--profile observability`) |

## Default Accounts

| Email | Password | Role |
|---|---|---|
| admin@kts.local | Admin123! | System Admin |
| employee@kts.local | Employee123! | Employee |

## Architecture

```
Frontend (Next.js :3000) → Backend (FastAPI :8000) → PostgreSQL (:5432)
                                                      ├── pgvector
                                                      ├── Redis (:6379)
                                                      └── MinIO (:9000)
```

## Profiles

| Profile | Services |
|---|---|
| (default) | postgres, redis, minio |
| `app` | backend, worker, frontend, nginx |
| `observability` | prometheus, grafana |
| `optional` | qdrant |

```bash
# Infrastructure only
docker compose -f docker/docker-compose.yml up -d

# Full app stack
docker compose -f docker/docker-compose.yml --profile app up -d

# Full stack + monitoring
docker compose -f docker/docker-compose.yml --profile app --profile observability up -d
```

## Key Features

- **Document Knowledge Center** — Upload, parse, chunk, and embed documents
- **AI QA Assistant** — RAG-powered chat with citations and confidence tiers
- **Experience Transfer** — Audio/video transcription, summary, FAQ generation
- **SOP Generator** — Full lifecycle with templates, versions, steps, reviews
- **Analytics Dashboard** — Real-time metrics, knowledge gaps, department scorecards
- **ROI Calculator** — Estimate financial impact of the system
- **Learn & Confirm** — Auto-generated quizzes from documents
- **Knowledge Request Board** — Request and claim knowledge creation tasks

## Development

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript check |
| `pytest` | Run backend tests |
| `ruff check .` | Lint Python code |
| `black --check .` | Check Python formatting |

## Environment Variables

See `.env.example` for all configurable variables. Key ones:

| Variable | Required | Default |
|---|---|---|
| `OPENAI_API_KEY` | For AI features | *(empty — AI runs in offline mode)* |
| `POSTGRES_PASSWORD` | Yes | `kts_password` |
| `JWT_SECRET_KEY` | Yes | `change-me-change-me-123` |
| `APP_SECRET_KEY` | Yes | `change-me-change-me-123` |
