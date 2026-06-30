from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.keyword import Keyword as KeywordModel
from app.models.crawl_log import CrawlLog as CrawlLogModel
from app.schemas.crawl_log import CrawlLog
from app.services.crawler_service import CrawlerService
from app.connectors.csv_importer import CSVImporter

router = APIRouter()
crawler_service = CrawlerService()


class CSVImportRequest(BaseModel):
    file_path: str


def _process_import(db: Session, parsed_items: list) -> dict:
    total_rows = len(parsed_items)
    imported = 0
    skipped = 0
    errors = []
    keywords = db.query(KeywordModel).all()
    keyword_map = {k.name: k for k in keywords}

    for i, item in enumerate(parsed_items):
        try:
            kw_name = item.get("keyword", "")
            if not kw_name:
                errors.append({"row": i + 2, "reason": "Missing keyword field"})
                skipped += 1
                continue

            kw_obj = keyword_map.get(kw_name)
            if not kw_obj:
                kw_obj = db.query(KeywordModel).filter(KeywordModel.name == kw_name).first()
                if not kw_obj:
                    kw_obj = KeywordModel(name=kw_name, platforms="Imported", is_active=True)
                    db.add(kw_obj)
                    db.commit()
                    db.refresh(kw_obj)
                keyword_map[kw_name] = kw_obj

            saved = crawler_service.import_single_mention(db, item, kw_obj)
            if saved: imported += 1
            else: skipped += 1
        except Exception as row_err:
            errors.append({"row": i + 2, "reason": str(row_err)})
            skipped += 1

    return {"total_rows": total_rows, "imported": imported, "skipped": skipped, "errors": errors}


@router.post("/run")
def trigger_crawl(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        background_tasks.add_task(crawler_service.crawl_all_keywords, db)
        return {"message": "Crawling triggered in background for all active keywords."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crawl trigger failed: {str(e)}")


@router.post("/run/{keyword_id}")
def trigger_keyword_crawl(keyword_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        kw = db.query(KeywordModel).filter(KeywordModel.id == keyword_id).first()
        if not kw:
            raise HTTPException(status_code=404, detail="Keyword not found")
        platforms = [p.strip() for p in kw.platforms.split(",") if p.strip()]
        for platform in platforms:
            background_tasks.add_task(crawler_service.crawl_keyword_for_platform, db, kw, platform)
        return {"message": f"Crawling triggered for '{kw.name}' across {len(platforms)} platforms."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crawl trigger failed: {str(e)}")


@router.get("/logs", response_model=List[CrawlLog])
def list_crawler_logs(limit: int = 50, db: Session = Depends(get_db)):
    try:
        return db.query(CrawlLogModel).order_by(CrawlLogModel.started_at.desc()).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch logs: {str(e)}")


@router.post("/import-csv/mentions")
def import_csv_mentions(req: Optional[CSVImportRequest] = None, file: UploadFile = File(None), db: Session = Depends(get_db)):
    try:
        if file and file.filename:
            raw = file.file.read()
            parsed = CSVImporter.import_mentions(raw)
        elif req and req.file_path:
            parsed = CSVImporter.import_mentions(req.file_path)
        else:
            raise HTTPException(status_code=400, detail="Please provide file upload or file_path in JSON body.")

        if not parsed:
            return {"message": "No mentions found.", "total_rows": 0, "imported": 0, "skipped": 0, "errors": []}

        result = _process_import(db, parsed)
        return {"message": "Import complete.", **result}
    except HTTPException:
        raise
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@router.post("/import-csv/google-reviews")
def import_csv_google_reviews(req: Optional[CSVImportRequest] = None, file: UploadFile = File(None), db: Session = Depends(get_db)):
    try:
        if file and file.filename:
            raw = file.file.read()
            parsed = CSVImporter.import_google_reviews(raw)
        elif req and req.file_path:
            parsed = CSVImporter.import_google_reviews(req.file_path)
        else:
            raise HTTPException(status_code=400, detail="Please provide file upload or file_path in JSON body.")

        if not parsed:
            return {"message": "No reviews found.", "total_rows": 0, "imported": 0, "skipped": 0, "errors": []}

        result = _process_import(db, parsed)
        return {"message": "Import complete.", **result}
    except HTTPException:
        raise
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
