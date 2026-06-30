# AI Reputation Risk Detection Platform - Backend

This is the backend for the AI Reputation Risk Detection Platform (AI 商譽風險偵測平台).

## Stack
- **Python**
- **FastAPI**
- **SQLAlchemy**
- **SQLite**
- **Pydantic**
- **Uvicorn**

## How to Run
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the application:
   ```bash
   uvicorn app.main:app --reload
   ```
5. View API documentation at `http://localhost:8000/docs`.
