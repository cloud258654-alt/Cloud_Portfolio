from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
from app.database import get_db
from app.models.system_setting import SystemSetting

router = APIRouter()

DEFAULT_SETTINGS = {
    "company_name": "我的公司",
    "brand_name": "我的品牌",
    "competitors": "",
    "high_risk_keywords": "",
    "notification_email": "",
    "demo_mode": "true",
}


class SettingsUpdate(BaseModel):
    settings: Dict[str, str]


@router.get("")
def get_settings(db: Session = Depends(get_db)) -> Dict[str, str]:
    try:
        result = dict(DEFAULT_SETTINGS)
        rows = db.query(SystemSetting).all()
        for r in rows:
            result[r.key] = r.value or ""
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch settings: {str(e)}")


@router.put("")
def update_settings(req: SettingsUpdate, db: Session = Depends(get_db)):
    try:
        for key, value in req.settings.items():
            setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
            if setting:
                setting.value = value
                setting.updated_at = datetime.utcnow()
            else:
                db.add(SystemSetting(key=key, value=value, updated_at=datetime.utcnow()))
        db.commit()
        return {"message": "Settings updated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")
