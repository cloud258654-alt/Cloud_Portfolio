from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.keyword import Keyword as KeywordModel
from app.schemas.keyword import Keyword, KeywordCreate, KeywordUpdate

router = APIRouter()

@router.post("/", response_model=Keyword, status_code=status.HTTP_201_CREATED)
def create_keyword(keyword: KeywordCreate, db: Session = Depends(get_db)):
    db_keyword = db.query(KeywordModel).filter(KeywordModel.name == keyword.name).first()
    if db_keyword:
        raise HTTPException(
            status_code=400,
            detail=f"Keyword '{keyword.name}' already exists."
        )
    new_keyword = KeywordModel(
        name=keyword.name,
        group_name=keyword.group_name,
        is_active=keyword.is_active,
        platforms=keyword.platforms
    )
    db.add(new_keyword)
    db.commit()
    db.refresh(new_keyword)
    return new_keyword

@router.get("/", response_model=List[Keyword])
def list_keywords(db: Session = Depends(get_db)):
    return db.query(KeywordModel).all()

@router.get("/{keyword_id}", response_model=Keyword)
def get_keyword(keyword_id: int, db: Session = Depends(get_db)):
    kw = db.query(KeywordModel).filter(KeywordModel.id == keyword_id).first()
    if not kw:
        raise HTTPException(status_code=404, detail="Keyword not found")
    return kw

@router.put("/{keyword_id}", response_model=Keyword)
def update_keyword(keyword_id: int, keyword_in: KeywordUpdate, db: Session = Depends(get_db)):
    db_keyword = db.query(KeywordModel).filter(KeywordModel.id == keyword_id).first()
    if not db_keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")
    
    update_data = keyword_in.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != db_keyword.name:
        existing = db.query(KeywordModel).filter(KeywordModel.name == update_data["name"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="Keyword name already exists")

    for field, value in update_data.items():
        setattr(db_keyword, field, value)
        
    db.commit()
    db.refresh(db_keyword)
    return db_keyword

@router.delete("/{keyword_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_keyword(keyword_id: int, db: Session = Depends(get_db)):
    db_keyword = db.query(KeywordModel).filter(KeywordModel.id == keyword_id).first()
    if not db_keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")
    db.delete(db_keyword)
    db.commit()
    return None
