import datetime
import logging
import json
import hashlib
from sqlalchemy.orm import Session
from app.models.keyword import Keyword
from app.models.mention import Mention
from app.models.crawl_log import CrawlLog
from app.connectors.ptt_connector import PTTConnector
from app.connectors.dcard_connector import DcardConnector
from app.connectors.google_search_connector import GoogleSearchConnector
from app.connectors.google_maps_connector import GoogleMapsConnector
from app.connectors.facebook_connector import FacebookConnector
from app.connectors.threads_connector import ThreadsConnector
from app.connectors.xiaohongshu_connector import XiaohongshuConnector
from app.connectors.tiktok_connector import TikTokConnector
from app.services.notification_service import NotificationService
from app.services.llm_service import analyze_with_llm

logger = logging.getLogger("app.crawler_service")


def content_hash(text: str) -> str:
    return hashlib.sha256(text.strip().encode()).hexdigest()[:16]


class CrawlerService:
    def __init__(self):
        self.connectors = {
            "PTT": PTTConnector(),
            "Dcard": DcardConnector(),
            "Google Search": GoogleSearchConnector(),
            "Google Maps": GoogleMapsConnector(),
            "Facebook Import": FacebookConnector(),
            "Threads Import": ThreadsConnector(),
            "小紅書 Import": XiaohongshuConnector(),
            "TikTok Import": TikTokConnector(),
        }

    def crawl_all_keywords(self, db: Session):
        keywords = db.query(Keyword).filter(Keyword.is_active == True).all()
        results = []
        for kw in keywords:
            platforms = [p.strip() for p in kw.platforms.split(",") if p.strip()]
            kw_results = []
            for platform in platforms:
                if platform in self.connectors:
                    try:
                        res = self.crawl_keyword_for_platform(db, kw, platform)
                        kw_results.append(res)
                    except Exception as e:
                        logger.error(f"Platform {platform} failed for '{kw.name}': {e}")
                        kw_results.append({"platform": platform, "keyword": kw.name, "status": "Failed", "error": str(e)})
                else:
                    kw_results.append({"platform": platform, "keyword": kw.name, "status": "Skipped - Connector Not Found"})
            results.extend(kw_results)
        return results

    def crawl_keyword_for_platform(self, db: Session, keyword: Keyword, platform: str) -> dict:
        connector = self.connectors.get(platform)
        if not connector:
            return {"platform": platform, "keyword": keyword.name, "status": "Skipped"}

        log_entry = CrawlLog(keyword_id=keyword.id, platform=platform, status="Running", started_at=datetime.datetime.utcnow())
        db.add(log_entry)
        db.commit()

        try:
            raw_mentions = connector.fetch_mentions(keyword.name)
            saved_count = 0
            twenty_four_hours_ago = datetime.datetime.utcnow() - datetime.timedelta(hours=24)
            recent_count = db.query(Mention).filter(Mention.keyword_id == keyword.id, Mention.created_at >= twenty_four_hours_ago).count()

            for raw in raw_mentions:
                url = raw.get("url", "")
                title = raw.get("title", "")
                ct = raw.get("content", "")
                ch = content_hash(ct)

                dup = None
                if url:
                    dup = db.query(Mention).filter(Mention.platform == platform, Mention.url == url).first()
                if not dup:
                    dup = db.query(Mention).filter(Mention.platform == platform, Mention.title == title, Mention.content == ct).first()

                if dup:
                    continue

                likes = raw.get("likes", 0)
                comments = raw.get("comments", 0)
                shares = raw.get("shares", 0)

                ai_result = analyze_with_llm(
                    ct, keyword.name, likes=likes, comments=comments, shares=shares,
                    is_resolved=False, recent_count=recent_count, platform=platform
                )
                now = datetime.datetime.utcnow()

                mention = Mention(
                    keyword_id=keyword.id, platform=platform, title=title, content=ct,
                    url=url, author=raw.get("author_hash"),
                    published_at=raw.get("published_at"),
                    sentiment=ai_result["sentiment"], sentiment_score=ai_result["sentiment_score"],
                    risk_level=ai_result["risk_level"], purchase_intent=ai_result["purchase_intent"],
                    ai_summary=ai_result["ai_summary"], ai_suggestion=ai_result["ai_suggestion"],
                    status=ai_result.get("status", "new"),
                    assigned_to=None,
                    model_name=ai_result.get("model_name"),
                    analyzed_at=now,
                    raw_data=json.dumps({"likes": likes, "comments": comments, "shares": shares, "content_hash": ch}),
                    # Reputation Risk fields
                    risk_score=ai_result.get("risk_score", 0),
                    risk_reason=ai_result.get("risk_reason"),
                    crisis_keywords_matched=ai_result.get("crisis_keywords_matched"),
                    recommended_priority=ai_result.get("recommended_priority", "P3"),
                    root_cause_category=ai_result.get("root_cause_category"),
                    root_cause_tags=",".join(ai_result.get("root_cause_tags", [])) if ai_result.get("root_cause_tags") else None,
                    suggested_action=ai_result.get("suggested_action"),
                )
                db.add(mention)
                saved_count += 1

                if ai_result.get("recommended_priority") in ("P0", "P1"):
                    NotificationService.create(
                        mention_id=None,
                        title=f"【商譽危機警報 - {ai_result.get('recommended_priority')}】品牌: {keyword.name}",
                        content=f"商譽風險指數：{ai_result.get('risk_score')}分 | 原因：{ai_result.get('risk_reason')} | 貼文：{title or ct[:100]}",
                        level="warning" if ai_result.get("recommended_priority") == "P1" else "error",
                    )

            log_entry.status = "Success"
            log_entry.items_count = saved_count
            log_entry.finished_at = datetime.datetime.utcnow()
            db.commit()
            return {"platform": platform, "keyword": keyword.name, "status": "Success", "items_saved": saved_count}

        except Exception as e:
            logger.error(f"Crawl error '{keyword.name}' on '{platform}': {e}")
            log_entry.status = "Failed"
            log_entry.error_message = str(e)
            log_entry.finished_at = datetime.datetime.utcnow()
            db.commit()
            return {"platform": platform, "keyword": keyword.name, "status": "Failed", "error": str(e)}

    def import_single_mention(self, db: Session, item: dict, kw_obj: Keyword) -> bool:
        url = item.get("url", "") or ""
        title = item.get("title", "") or ""
        ct = item.get("content", "") or ""

        dup = None
        if url:
            dup = db.query(Mention).filter(Mention.platform == item["platform"], Mention.url == url).first()
        if not dup and ct:
            dup = db.query(Mention).filter(Mention.platform == item["platform"], Mention.title == title, Mention.content == ct).first()

        if dup:
            return False

        twenty_four_hours_ago = datetime.datetime.utcnow() - datetime.timedelta(hours=24)
        recent_count = db.query(Mention).filter(Mention.keyword_id == kw_obj.id, Mention.created_at >= twenty_four_hours_ago).count()
        likes = item.get("likes", 0)
        comments = item.get("comments", 0)
        shares = item.get("shares", 0)

        ai_result = analyze_with_llm(
            ct, kw_obj.name, likes=likes, comments=comments, shares=shares,
            is_resolved=False, recent_count=recent_count, platform=item["platform"]
        )
        now = datetime.datetime.utcnow()
        sentiment = item.get("sentiment") or ai_result["sentiment"]
        score = item.get("sentiment_score")
        if score is None or score == 0.0:
            score = ai_result["sentiment_score"]
        else:
            score = float(score)

        mention = Mention(
            keyword_id=kw_obj.id, platform=item["platform"], title=title, content=ct,
            url=url, author=item.get("author_hash"),
            published_at=item.get("published_at"),
            sentiment=sentiment, sentiment_score=float(score),
            risk_level=ai_result["risk_level"], purchase_intent=ai_result["purchase_intent"],
            ai_summary=ai_result["ai_summary"], ai_suggestion=ai_result["ai_suggestion"],
            status=ai_result.get("status", "new"),
            assigned_to=None,
            model_name=ai_result.get("model_name"),
            analyzed_at=now,
            raw_data=json.dumps({"likes": likes, "comments": comments, "shares": shares}),
            # Reputation Risk fields
            risk_score=ai_result.get("risk_score", 0),
            risk_reason=ai_result.get("risk_reason"),
            crisis_keywords_matched=ai_result.get("crisis_keywords_matched"),
            recommended_priority=ai_result.get("recommended_priority", "P3"),
            root_cause_category=ai_result.get("root_cause_category"),
            root_cause_tags=",".join(ai_result.get("root_cause_tags", [])) if ai_result.get("root_cause_tags") else None,
            suggested_action=ai_result.get("suggested_action"),
        )
        db.add(mention)
        db.commit()

        if ai_result.get("recommended_priority") in ("P0", "P1"):
            NotificationService.create(
                mention_id=None,
                title=f"【商譽危機警報 - {ai_result.get('recommended_priority')}】品牌: {kw_obj.name}",
                content=f"商譽風險指數：{ai_result.get('risk_score')}分 | 原因：{ai_result.get('risk_reason')} | 貼文：{title or ct[:100]}",
                level="warning" if ai_result.get("recommended_priority") == "P1" else "error",
            )

        return True
