from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification_log import NotificationLog

router = APIRouter()


@router.get("")
def list_notifications(limit: int = 50, db: Session = Depends(get_db)):
    try:
        logs = db.query(NotificationLog).order_by(NotificationLog.created_at.desc()).limit(limit).all()
        return [{
            "id": l.id, "mention_id": l.mention_id, "title": l.title,
            "content": l.content, "level": l.level, "is_read": l.is_read,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        } for l in logs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notifications: {str(e)}")


@router.post("/{nid}/read")
def mark_read(nid: int, db: Session = Depends(get_db)):
    try:
        n = db.query(NotificationLog).filter(NotificationLog.id == nid).first()
        if n:
            n.is_read = "true"
            db.commit()
            return {"message": "Marked as read."}
        raise HTTPException(status_code=404, detail="Notification not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
