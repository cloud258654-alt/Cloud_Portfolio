# v2.0 Gap Analysis -- 專案關鍵缺口評估報告

> **日期**: 2026-06-26
> **版本**: v2.0
> **狀態**: Draft
> **作者**: PM Review

---

## 執行摘要

本報告針對 AI 知識轉移系統（KTS）目前的專案狀態進行全盤盤點，識別出阻擋上線與技術債的關鍵缺口。共分類為四大面向、十項缺失，依 P0-P3 優先級排序。

**核心結論**：v1.0 架構骨架完整，但 Auth 與 CI/CD 的缺席使得系統**無法交付給真實使用者**，列為 P0 最高優先級。

---

## 一、阻擋上線的關鍵缺失

### P0-1: 認證與授權系統（零實作）

| 項目 | 現狀 | 風險 |
|---|---|---|
| JWT 工具函式 | `core/security.py` 有 `create_access_token()` | 僅有基礎函式，未掛載 middleware |
| Login API | **不存在** | 使用者無法登入 |
| Auth Middleware | **不存在** | 所有 API 端點無保護，等同裸奔 |
| RBAC 強制 | Database schema 有 `auth.users`、`roles`、`role_permissions` | 寫了 schema 卻完全沒用 |
| User Context Injection | 無 `Depends(get_current_user)` | 所有 `current_user_id` 參數只是裝飾 |

**影響範圍**: 全部 API 端點（/documents、/chat、/experience、/sops、/ingestion）

**建議行動**:
1. 建立 `POST /api/v1/auth/login` 端點
2. 建立 `get_current_user` dependency（JWT 解碼 + DB 查詢）
3. 將所有現有 endpoint 掛上 auth dependency
4. 建立 RBAC decorator / dependency 做權限檢查

---

### P0-2: 缺少 CI/CD Pipeline

| 項目 | 現狀 | 風險 |
|---|---|---|
| CI 配置 | **不存在**（無 GitHub Actions / GitLab CI） | 無法自動驗證 PR |
| CD 配置 | **不存在** | 部署靠人工，不可重現 |
| 環境區隔 | 無 dev / staging / prod 策略 | 開發用變數直接打在 production |
| Docker image registry | 無 push 腳本 | 手動 build 容易出錯 |

**建議行動**:
1. 建立 `.github/workflows/ci.yml`：lint → typecheck → test → build
2. 建立 `.github/workflows/deploy.yml`：區分 dev/staging/prod 部署
3. 設定環境變數區隔（GitHub Environments / Vault）

---

## 二、測試與品質基礎設施

### P1-1: 測試覆蓋率嚴重不足

| 項目 | 現狀 | 期望 |
|---|---|---|
| 單元測試 | 15 個檔案，僅測靜態方法 | 所有 service/repository 皆需單元測試 |
| API 整合測試 | **零** | 使用 `httpx.AsyncClient` + test DB |
| 資料庫測試 | **零** | 需有 test database fixture |
| E2E 測試 | **零** | 至少 happy path smoke test |
| Coverage 門檻 | 未設定 | 設定 `--cov-fail-under=70` 以上 |

**建議行動**:
1. 建立 `conftest.py`：test DB session、test client、auth fixture
2. 逐模組補齊整合測試（優先順序：health → documents → chat → experience → sops）
3. 設定 `pytest-cov` 並在 CI 強制 coverage 門檻

---

### P1-2: Pre-commit + Lint 強制執行

| 項目 | 現狀 | 風險 |
|---|---|---|
| Python lint | `pyproject.toml` 有 `black` + `ruff` 配置 | 開發者可以忽略，無強制力 |
| Frontend lint | 已有 ESLint + Prettier 配置（本次補齊） | 同上 |
| Pre-commit hooks | **不存在** | commit 前不檢查，品質劣化 |
| Commit message lint | **不存在** | 無 conventional commits，CHANGELOG 無法自動生成 |

**建議行動**:
1. 安裝 `pre-commit`，設定 `.pre-commit-config.yaml`
2. hooks：`black`、`ruff`、`eslint`、`prettier`、`check-yaml`、`check-json`
3. 安裝 `commitlint` + husky 強制 conventional commits

---

### P1-3: 缺少 PR / Issue Template

- 無 `.github/PULL_REQUEST_TEMPLATE.md`
- 無 `.github/ISSUE_TEMPLATE/`
- 無 CODEOWNERS 檔案

**建議行動**:
1. 建立標準 PR template（含 checklist：tested、linted、linked issue）
2. 建立 bug report / feature request issue template

---

## 三、功能完整性

### P2-1: 前端路由有空白樁頁

| 路由 | 大小 | 狀態 |
|---|---|---|
| `/documents/favorites` | 126B | 空白頁，無功能 |
| `/documents/recent` | 126B | 空白頁，無功能 |
| SOP 模組 (M04) | 後端完整 | **前端零頁面** |

**建議行動**:
1. 若 favorites/recent 暫不實作，應移除路由或顯示 "Coming Soon"
2. SOP 前端為下一個開發重點，優先建立 `/sops` 路由

---

### P2-2: AI/ML 大部分為 Stub

| 服務 | 現狀 |
|---|---|
| `EmbeddingService` | SHA-256 雜湊，非真實 embedding |
| `OCRService` | 回傳空字串 |
| `SpeechService` | 回傳 hardcoded 文字 |
| `AIGateway` | `pass` 空類別 |
| Document parsers | 皆回傳 "pending binary extraction" |
| Chat `_generate_answer()` | 只拼接 prompt 檔案前綴，未呼叫 LLM |

**建議行動**:
1. 逐一串接真實 AI provider（OpenAI / Anthropic / Gemini）
2. 補上實際的文件解析邏輯（PDF → pymupdf, DOCX → python-docx 等）
3. 串接 Whisper API 做真實語音轉文字

---

## 四、營運與安全

### P3-1: 可觀測性不完整

| 元件 | 現狀 | 缺失 |
|---|---|---|
| Prometheus | docker-compose 有容器 | 無 metrics endpoint、無 scrape config、無 alert rules |
| Grafana | docker-compose 有容器 | 無 dashboard JSON、無 datasource provisioning |
| 結構化日誌 | 使用 loguru | 無 JSON format、無 ELK/Loki 串接 |
| Readiness/Liveness | 僅 `/admin/health` | 無 `/ready`、`/live` 端點供 K8s 使用 |

**建議行動**:
1. 後端掛上 `prometheus-fastapi-instrumentator`
2. 建立 Grafana dashboard provisioning（至少 system health + request rate + error rate）
3. 建立 Prometheus alert rules（DB down、high latency、high error rate）

---

### P3-2: 安全性掃描與 Secrets 管理

| 項目 | 現狀 | 風險 |
|---|---|---|
| Dependency scan | 無 | `npm audit` 有 2 moderate vulnerabilities |
| SAST | 無 | 無 SonarQube / CodeQL |
| Secrets | `.env` 有 gitignore 保護 | 無 vault / sealed secrets 策略 |
| API rate limiting | 無 | 容易被 DDoS |

**建議行動**:
1. CI 中加入 `npm audit --audit-level=high` + `pip-audit` 或 `safety check`
2. 啟用 GitHub CodeQL / Dependabot
3. 評估使用 HashiCorp Vault 或 SOPS

---

### P3-3: 資料備份與災難恢復

- 無 PostgreSQL backup cronjob 或 pg_dump 策略
- 無 MinIO bucket 備份
- 無 database migration rollback 驗證流程
- 無 RTO（Recovery Time Objective）/ RPO 定義

**建議行動**:
1. 建立 `pg_dump` cron job（或使用 pgBackRest）
2. 建立 MinIO mirror / replication 策略
3. 撰寫 Disaster Recovery Runbook

---

### P3-4: 檔案結構清理

| 重複檔案 | 路徑 A | 路徑 B |
|---|---|---|
| `00_MASTER_PROJECT.md` | `Project_012/` | `Knowledge_Transfer_System/` |
| `01_Project_Charter.md` | `Project_012/` | `Knowledge_Transfer_System/` |
| `03_System_Architecture.md` | `Project_012/` | `Knowledge_Transfer_System/` |

**建議行動**: 確認正本位置，刪除重複檔案或以 symlink / README pointer 取代。

---

## 優先級摘要矩陣

| 優先級 | ID | 項目 | 投入估算 | 影響 |
|---|---|---|---|---|
| **P0** | Auth System | Login + middleware + RBAC | 3-5 天 | 無此系統無法交貨 |
| **P0** | CI/CD | GitHub Actions pipeline | 1-2 天 | 無可重現部署 |
| **P1** | Test Coverage | 整合測試 + API 測試 | 5-7 天 | 無安全網 |
| **P1** | Pre-commit | hooks + commitlint | 0.5 天 | 品質自動化 |
| **P1** | PR/Issue Template | 標準流程 | 0.5 天 | 協作規範 |
| **P2** | AI Stubs → Real | 串接真實 AI API | 5-10 天 | 核心價值 |
| **P2** | SOP Frontend | 前端頁面實作 | 3-5 天 | 使用者介面 |
| **P2** | Stub Pages | 移除或補實作 favorites/recent | 0.5-1 天 | UI 完整性 |
| **P3** | Observability | Metrics + dashboards + alerts | 2-3 天 | 營運安全感 |
| **P3** | Security Scan | dependency + SAST | 1 天 | 資安合規 |
| **P3** | Backup/DR | 備份腳本 + runbook | 1-2 天 | 災難恢復 |
| **P3** | File Cleanup | 刪除重複文件 | 0.5 天 | 維護性 |

**總計估算**: 約 22-40 工作天（取決於 AI stub 串接的複雜度）
