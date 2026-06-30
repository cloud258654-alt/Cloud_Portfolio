import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base

class ImportLog(Base):
    __tablename__ = "import_logs"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=True)
    import_type = Column(String, nullable=True)
    total_rows = Column(Integer, default=0)
    imported = Column(Integer, default=0)
    skipped = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    errors_text = Column(Text, nullable=True)
    status = Column(String, default="completed")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
