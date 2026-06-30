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


def run_background_crawl_all():
    from app.database import SessionLocal
    db_session = SessionLocal()
    try:
        crawler_service.crawl_all_keywords(db_session)
    except Exception as e:
        import logging
        logging.getLogger("app.crawler_api").error(f"Background crawl all failed: {e}")
    finally:
        db_session.close()


def run_background_crawl_keyword_platform(keyword_id: int, platform: str):
    from app.database import SessionLocal
    db_session = SessionLocal()
    try:
        kw = db_session.query(KeywordModel).filter(KeywordModel.id == keyword_id).first()
        if kw:
            crawler_service.crawl_keyword_for_platform(db_session, kw, platform)
    except Exception as e:
        import logging
        logging.getLogger("app.crawler_api").error(f"Background crawl keyword platform failed: {e}")
    finally:
        db_session.close()


@router.post("/run")
def trigger_crawl(background_tasks: BackgroundTasks):
    try:
        background_tasks.add_task(run_background_crawl_all)
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
            background_tasks.add_task(run_background_crawl_keyword_platform, keyword_id, platform)
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
    import datetime
    import json
    import os
    from app.models.import_log import ImportLog

    file_name = file.filename if (file and file.filename) else (os.path.basename(req.file_path) if (req and req.file_path) else "unknown_file")
    try:
        if file and file.filename:
            raw = file.file.read()
            parsed = CSVImporter.import_mentions(raw)
        elif req and req.file_path:
            parsed = CSVImporter.import_mentions(req.file_path)
        else:
            raise HTTPException(status_code=400, detail="Please provide file upload or file_path in JSON body.")

        if not parsed:
            # Log empty file import
            import_log = ImportLog(
                file_name=file_name, import_type="mentions", total_rows=0, imported=0, skipped=0,
                error_count=0, status="completed", created_at=datetime.datetime.utcnow()
            )
            db.add(import_log)
            db.commit()
            return {"message": "No mentions found.", "total_rows": 0, "imported": 0, "skipped": 0, "errors": []}

        result = _process_import(db, parsed)
        
        # Save import audit log
        import_log = ImportLog(
            file_name=file_name,
            import_type="mentions",
            total_rows=result.get("total_rows", 0),
            imported=result.get("imported", 0),
            skipped=result.get("skipped", 0),
            error_count=len(result.get("errors", [])),
            errors_text=json.dumps(result.get("errors", [])) if result.get("errors") else None,
            status="completed" if len(result.get("errors", [])) == 0 else "partial_success",
            created_at=datetime.datetime.utcnow()
        )
        db.add(import_log)
        db.commit()

        return {"message": "Import complete.", **result}
    except HTTPException:
        raise
    except FileNotFoundError as e:
        # Save fail log
        try:
            import_log = ImportLog(
                file_name=file_name, import_type="mentions", total_rows=0, imported=0, skipped=0,
                error_count=1, errors_text=str(e), status="failed", created_at=datetime.datetime.utcnow()
            )
            db.add(import_log)
            db.commit()
        except Exception:
            pass
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Save fail log
        try:
            import_log = ImportLog(
                file_name=file_name, import_type="mentions", total_rows=0, imported=0, skipped=0,
                error_count=1, errors_text=str(e), status="failed", created_at=datetime.datetime.utcnow()
            )
            db.add(import_log)
            db.commit()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@router.post("/import-csv/google-reviews")
def import_csv_google_reviews(req: Optional[CSVImportRequest] = None, file: UploadFile = File(None), db: Session = Depends(get_db)):
    import datetime
    import json
    import os
    from app.models.import_log import ImportLog

    file_name = file.filename if (file and file.filename) else (os.path.basename(req.file_path) if (req and req.file_path) else "unknown_file")
    try:
        if file and file.filename:
            raw = file.file.read()
            parsed = CSVImporter.import_google_reviews(raw)
        elif req and req.file_path:
            parsed = CSVImporter.import_google_reviews(req.file_path)
        else:
            raise HTTPException(status_code=400, detail="Please provide file upload or file_path in JSON body.")

        if not parsed:
            # Log empty file import
            import_log = ImportLog(
                file_name=file_name, import_type="google-reviews", total_rows=0, imported=0, skipped=0,
                error_count=0, status="completed", created_at=datetime.datetime.utcnow()
            )
            db.add(import_log)
            db.commit()
            return {"message": "No reviews found.", "total_rows": 0, "imported": 0, "skipped": 0, "errors": []}

        result = _process_import(db, parsed)

        # Save import audit log
        import_log = ImportLog(
            file_name=file_name,
            import_type="google-reviews",
            total_rows=result.get("total_rows", 0),
            imported=result.get("imported", 0),
            skipped=result.get("skipped", 0),
            error_count=len(result.get("errors", [])),
            errors_text=json.dumps(result.get("errors", [])) if result.get("errors") else None,
            status="completed" if len(result.get("errors", [])) == 0 else "partial_success",
            created_at=datetime.datetime.utcnow()
        )
        db.add(import_log)
        db.commit()

        return {"message": "Import complete.", **result}
    except HTTPException:
        raise
    except FileNotFoundError as e:
        try:
            import_log = ImportLog(
                file_name=file_name, import_type="google-reviews", total_rows=0, imported=0, skipped=0,
                error_count=1, errors_text=str(e), status="failed", created_at=datetime.datetime.utcnow()
            )
            db.add(import_log)
            db.commit()
        except Exception:
            pass
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        try:
            import_log = ImportLog(
                file_name=file_name, import_type="google-reviews", total_rows=0, imported=0, skipped=0,
                error_count=1, errors_text=str(e), status="failed", created_at=datetime.datetime.utcnow()
            )
            db.add(import_log)
            db.commit()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@router.get("/import-logs")
def list_import_logs(limit: int = 50, db: Session = Depends(get_db)):
    try:
        from app.models.import_log import ImportLog
        return db.query(ImportLog).order_by(ImportLog.created_at.desc()).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch import logs: {str(e)}")
