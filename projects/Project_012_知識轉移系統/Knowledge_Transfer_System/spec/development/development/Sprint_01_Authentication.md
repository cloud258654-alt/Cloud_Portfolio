# Sprint_01_Authentication

AI Knowledge Transfer System

Sprint Development Plan

Sprint : 01

Sprint Name : Authentication, User, Role, Permission Foundation

Version : v1.0.0

Owner : Project Manager / Tech Lead

Last Update : 2026-06-25

---

# 1. Sprint Goal

建立系統最基礎的身份驗證與權限管理功能。

本 Sprint 完成後，系統必須支援：

```text
User
Department
Role
Permission
Login
Logout
JWT Access Token
Refresh Token
Current User Profile
RBAC Permission Check
```

完成後，後續 Sprint 才能安全地開發：

```text
Document Upload
Search
AI QA
SOP
Training
Agent
Governance
Dashboard
```

---

# 2. Business Value

Authentication 是整個 Enterprise AI Knowledge Platform 的安全入口。

所有模組都依賴：

```text
Who is the user?
Which department?
Which role?
What permission?
What data can be accessed?
```

沒有 Authentication，不能進入 M01~M13 的正式開發。

---

# 3. Scope

本 Sprint 包含：

```text
User Table
Department Table
Role Table
Permission Table
User Role Mapping
Role Permission Mapping
Password Hash
JWT Login
JWT Refresh Token
Current User API
RBAC Check
Seed Default Roles
Seed Default Admin User
Basic Auth UI
Auth API Tests
```

---

# 4. Out of Scope

本 Sprint 不包含：

```text
Document Upload
File Permission
AI QA Permission
Agent Permission
ABAC
Chunk Permission
OAuth
SSO
MFA
Email Verification
Password Reset
```

上述功能留到後續 Sprint 或 M11 Permission Management 擴充。

---

# 5. Dependencies

必須已完成：

```text
Sprint_00_Project_Setup
Docker Compose
FastAPI Foundation
PostgreSQL Connection
Alembic Setup
Frontend Next.js Foundation
Health Check API
```

---

# 6. Database Tables

請依照 `spec/DB/Database_Schema_v1.md` 建立本 Sprint 所需資料表。

本 Sprint 需建立：

```text
org.departments
auth.users
auth.roles
auth.user_roles
auth.permissions
auth.role_permissions
```

---

# 7. Alembic Migration

請建立 Alembic migration：

```text
001_create_auth_org_tables.py
```

內容包含：

```text
schemas:
auth
org

tables:
org.departments
auth.users
auth.roles
auth.user_roles
auth.permissions
auth.role_permissions
```

---

# 8. Default Seed Data

請建立 seed script：

```text
backend/app/db/seed.py
```

---

## 8.1 Default Departments

```text
Head Office
Engineering
Procurement
HR
Finance
IT
Quality
Sales
```

---

## 8.2 Default Roles

```text
employee
manager
department_admin
knowledge_owner
auditor
system_admin
```

---

## 8.3 Default Permissions

建立基礎權限：

```text
user:view
user:create
user:update
user:disable

department:view
department:create
department:update

role:view
role:create
role:update

permission:view

auth:login
auth:refresh
auth:me

document:view
document:create
document:update
document:delete

ai:ask

admin:access
audit:view
```

---

## 8.4 Default Admin User

建立預設管理員：

```text
email: admin@example.com
password: Admin123456!
role: system_admin
department: Head Office
```

重要：

```text
密碼必須 hash
不可明碼存入資料庫
```

---

# 9. Backend Folder Additions

請新增或更新：

```text
backend/app/api/v1/endpoints/auth.py
backend/app/api/v1/endpoints/users.py
backend/app/api/v1/endpoints/departments.py
backend/app/api/v1/endpoints/roles.py
backend/app/core/security.py
backend/app/core/deps.py
backend/app/models/user.py
backend/app/models/department.py
backend/app/models/role.py
backend/app/models/permission.py
backend/app/schemas/auth.py
backend/app/schemas/user.py
backend/app/schemas/department.py
backend/app/schemas/role.py
backend/app/repositories/user_repository.py
backend/app/repositories/role_repository.py
backend/app/repositories/department_repository.py
backend/app/services/auth_service.py
backend/app/services/user_service.py
backend/app/services/permission_service.py
```

---

# 10. Backend API Requirements

所有 API prefix：

```text
/api/v1
```

---

## 10.1 Login

```http
POST /api/v1/auth/login
```

Request：

```json
{
  "email": "admin@example.com",
  "password": "Admin123456!"
}
```

Response：

```json
{
  "success": true,
  "data": {
    "access_token": "jwt-access-token",
    "refresh_token": "jwt-refresh-token",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "name": "System Admin",
      "email": "admin@example.com",
      "roles": ["system_admin"],
      "department": "Head Office"
    }
  },
  "message": "login success"
}
```

---

## 10.2 Refresh Token

```http
POST /api/v1/auth/refresh
```

Request：

```json
{
  "refresh_token": "jwt-refresh-token"
}
```

Response：

```json
{
  "success": true,
  "data": {
    "access_token": "new-jwt-access-token",
    "token_type": "Bearer",
    "expires_in": 3600
  },
  "message": "token refreshed"
}
```

---

## 10.3 Logout

```http
POST /api/v1/auth/logout
```

Note：

v1 可先前端清除 token。

後端可回傳：

```json
{
  "success": true,
  "data": {},
  "message": "logout success"
}
```

---

## 10.4 Current User

```http
GET /api/v1/auth/me
```

Header：

```http
Authorization: Bearer <access_token>
```

Response：

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "System Admin",
    "email": "admin@example.com",
    "job_title": "System Administrator",
    "department": {
      "id": "uuid",
      "name": "Head Office",
      "code": "HQ"
    },
    "roles": ["system_admin"],
    "permissions": ["admin:access", "user:view"]
  },
  "message": "success"
}
```

---

# 11. User API

## 11.1 List Users

```http
GET /api/v1/users
```

Permission：

```text
user:view
```

Query：

```text
department_id
role
status
keyword
page
page_size
```

---

## 11.2 Create User

```http
POST /api/v1/users
```

Permission：

```text
user:create
```

Request：

```json
{
  "department_id": "uuid",
  "name": "User Name",
  "email": "user@example.com",
  "password": "Password123!",
  "job_title": "Engineer",
  "roles": ["employee"]
}
```

---

## 11.3 Get User Detail

```http
GET /api/v1/users/{user_id}
```

Permission：

```text
user:view
```

---

## 11.4 Update User

```http
PUT /api/v1/users/{user_id}
```

Permission：

```text
user:update
```

---

## 11.5 Disable User

```http
DELETE /api/v1/users/{user_id}
```

Permission：

```text
user:disable
```

只做 soft disable：

```text
status = inactive
```

---

# 12. Department API

## 12.1 List Departments

```http
GET /api/v1/departments
```

Permission：

```text
department:view
```

---

## 12.2 Create Department

```http
POST /api/v1/departments
```

Permission：

```text
department:create
```

Request：

```json
{
  "name": "Engineering",
  "code": "ENG",
  "parent_id": null
}
```

---

## 12.3 Update Department

```http
PUT /api/v1/departments/{department_id}
```

Permission：

```text
department:update
```

---

# 13. Role API

## 13.1 List Roles

```http
GET /api/v1/roles
```

Permission：

```text
role:view
```

---

## 13.2 List Permissions

```http
GET /api/v1/permissions
```

Permission：

```text
permission:view
```

---

# 14. Security Requirements

## 14.1 Password Hash

使用：

```text
passlib[bcrypt]
```

不得明碼保存密碼。

---

## 14.2 JWT

Access Token：

```text
60 minutes
```

Refresh Token：

```text
7 days
```

JWT Payload：

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "roles": ["employee"],
  "type": "access",
  "exp": 1234567890
}
```

---

## 14.3 Token Validation

需檢查：

```text
token signature
token expiration
token type
user exists
user status active
```

---

## 14.4 RBAC

建立：

```text
require_permission(permission_code)
```

Example：

```python
require_permission("user:view")
```

若無權限：

```http
403 Forbidden
```

---

# 15. Frontend Requirements

新增頁面：

```text
/login
/dashboard
```

---

## 15.1 Login Page

UI：

```text
Email input
Password input
Login button
Error message
Loading state
```

呼叫：

```http
POST /api/v1/auth/login
```

成功後：

```text
保存 access_token
保存 refresh_token
導向 /dashboard
```

---

## 15.2 Dashboard Page

登入後顯示：

```text
Welcome, {user.name}
Department
Roles
Permissions
Logout Button
System Status Card
```

---

## 15.3 Auth Store

建立：

```text
frontend/stores/auth-store.ts
```

保存：

```text
accessToken
refreshToken
user
isAuthenticated
login()
logout()
fetchMe()
```

---

## 15.4 API Client

更新：

```text
frontend/lib/api.ts
```

需求：

```text
自動帶 Authorization Header
401 時導向 login
```

---

# 16. Backend Tests

建立測試：

```text
backend/tests/test_auth.py
backend/tests/test_users.py
backend/tests/test_departments.py
```

---

## 16.1 Test Cases

至少包含：

```text
login success
login wrong password
me success
me without token returns 401
list users with admin token
list users without permission returns 403
create user success
list departments success
```

---

# 17. Frontend Tests

可先建立基本測試或略過。

至少確認：

```text
Login page renders
Dashboard renders after auth state
```

---

# 18. Logging

需記錄：

```text
login_success
login_failed
token_refresh
user_created
user_disabled
permission_denied
```

禁止記錄：

```text
password
refresh_token
access_token
```

---

# 19. Audit Log

如果 `audit.audit_logs` 已可用，請記錄：

```text
login_success
login_failed
user_create
user_update
user_disable
permission_denied
```

若 Sprint 00 尚未建立 audit service，本 Sprint 可先建立基礎 audit service。

---

# 20. Acceptance Criteria

本 Sprint 完成後必須符合：

```text
Alembic migration 可成功執行
Seed data 可成功建立
admin@example.com 可登入
登入成功取得 access token
/auth/me 可取得使用者資料
無 token 呼叫 /auth/me 回傳 401
無權限呼叫保護 API 回傳 403
可建立新使用者
可列出部門
可列出角色
Frontend login 頁面可登入
Frontend dashboard 可顯示使用者資訊
pytest 通過
docker compose up 後功能正常
```

---

# 21. Definition of Done

```text
Auth API 完成
User API 基礎完成
Department API 基礎完成
Role API 基礎完成
RBAC 基礎完成
JWT 完成
Password Hash 完成
Seed 完成
Frontend Login 完成
Frontend Dashboard 完成
測試通過
README 更新
無 hard-coded secret
無 token/password log
```

---

# 22. Codex Execution Instruction

請依照本 Sprint 文件執行。

重要限制：

```text
不要實作文件上傳
不要實作 AI QA
不要實作 RAG
不要實作 OCR
不要實作 Agent
不要實作完整 M11 權限系統
不要加入 OAuth / SSO / MFA
```

只完成：

```text
Authentication + User + Role + Basic RBAC Foundation
```

完成後請輸出：

```text
完整目錄樹
新增檔案清單
Alembic migration 名稱
Seed 指令
啟動指令
測試指令
API 測試範例
下一步建議
```

---

# 23. Next Sprint

Sprint 01 完成後，下一個 Sprint：

```text
development/Sprint_02_Document_Center.md
```

內容將包含：

```text
Document Upload
Metadata
Version
Storage
Download
List
Detail
Permission Scope
Document Status
MinIO Integration
```
