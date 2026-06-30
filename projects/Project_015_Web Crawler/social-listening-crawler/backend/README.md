# Social Listening Crawler - Backend

This is the backend for the Taiwan Social Media Keyword Monitoring System.

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
