"""
Seed script: python -m app.seed
Creates sample keywords + demo-quality mentions for presentation.
"""
import random
import datetime
import json
import logging

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.keyword import Keyword
from app.models.mention import Mention
from app.models.crawl_log import CrawlLog

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app.seed")

Base.metadata.create_all(bind=engine)

KEYWORDS = [
    {"name": "台積電", "group_name": "科技股", "platforms": "PTT,Dcard,Google Search"},
    {"name": "ChatGPT", "group_name": "AI工具", "platforms": "PTT,Dcard,Google Search"},
    {"name": "人工智慧", "group_name": "AI主題", "platforms": "PTT,Dcard,Google Search"},
    {"name": "鼎泰豐", "group_name": "餐飲品牌", "platforms": "Google Maps,Facebook Import,小紅書 Import"},
    {"name": "電動車", "group_name": "產業趨勢", "platforms": "PTT,Dcard,Google Search"},
    {"name": "iPhone 16", "group_name": "消費電子", "platforms": "Dcard,PTT,TikTok Import"},
    {"name": "日本旅遊", "group_name": "生活旅遊", "platforms": "PTT,Dcard,Facebook Import,小紅書 Import"},
    {"name": "NVIDIA", "group_name": "科技股", "platforms": "PTT,Dcard,Google Search"},
]

PLATFORM_TEMPLATES = {
    "PTT": [
        {"title": "[討論] 關於{keyword}的最新消息", "sentiment": "Neutral", "risk": "Low"},
        {"title": "[心得] {keyword}使用經驗分享", "sentiment": "Positive", "risk": "Low"},
        {"title": "[問卦] {keyword}是不是過譽了？", "sentiment": "Negative", "risk": "High"},
        {"title": "[新聞] {keyword}營收再創新高", "sentiment": "Positive", "risk": "Low"},
        {"title": "[爆卦] {keyword}又出包了", "sentiment": "Negative", "risk": "High"},
        {"title": "Re: [問卦] {keyword}值得入手嗎", "sentiment": "Neutral", "risk": "Medium"},
        {"title": "[請益] {keyword} vs 競品怎麼選？", "sentiment": "Neutral", "risk": "Low"},
        {"title": "[標的] {keyword} 多空分析", "sentiment": "Neutral", "risk": "Medium"},
    ],
    "Dcard": [
        {"title": "#請益 {keyword} 選擇困難", "sentiment": "Neutral", "risk": "Low"},
        {"title": "#分享 {keyword} 完整心得", "sentiment": "Positive", "risk": "Low"},
        {"title": "#黑特 {keyword}後悔的經歷", "sentiment": "Negative", "risk": "High"},
        {"title": "{keyword} 真的值得買嗎？求評價", "sentiment": "Neutral", "risk": "Medium"},
        {"title": "開箱！{keyword} 使用一個月心得", "sentiment": "Positive", "risk": "Low"},
        {"title": "#討論 {keyword} 真實受害者現身說法", "sentiment": "Negative", "risk": "High"},
    ],
    "Google Search": [
        {"title": "{keyword} - 最新新聞總整理 2026", "sentiment": "Neutral", "risk": "Low"},
        {"title": "{keyword}價格、評價、優缺點比較", "sentiment": "Positive", "risk": "Low"},
        {"title": "{keyword} 缺點、災情、問題彙整", "sentiment": "Negative", "risk": "Medium"},
        {"title": "{keyword} 2026 市場分析與展望", "sentiment": "Neutral", "risk": "Low"},
    ],
    "Google Maps": [
        {"title": "{keyword} - 5顆星好評", "sentiment": "Positive", "risk": "Low"},
        {"title": "{keyword} - 超失望的用餐體驗", "sentiment": "Negative", "risk": "Medium"},
        {"title": "{keyword} - 值得再訪的好店", "sentiment": "Positive", "risk": "Low"},
        {"title": "{keyword} - 服務有待加強", "sentiment": "Negative", "risk": "Medium"},
    ],
    "Facebook Import": [
        {"title": "大推！{keyword} 真的好用", "sentiment": "Positive", "risk": "Low"},
        {"title": "{keyword} 社團討論串：有人遇過這問題嗎？", "sentiment": "Neutral", "risk": "Medium"},
        {"title": "真心不推薦{keyword}，踩雷心得", "sentiment": "Negative", "risk": "High"},
    ],
    "TikTok Import": [
        {"title": "{keyword} 開箱實測！真的那麼神？", "sentiment": "Positive", "risk": "Low"},
        {"title": "{keyword} 翻車現場 #討論", "sentiment": "Negative", "risk": "Medium"},
    ],
    "小紅書 Import": [
        {"title": "{keyword} 🇹🇼 真實測評來了！", "sentiment": "Positive", "risk": "Low"},
        {"title": "避雷！{keyword} 千萬別買❌", "sentiment": "Negative", "risk": "High"},
        {"title": "{keyword} 種草清單✨分享", "sentiment": "Positive", "risk": "Low"},
    ],
    "Threads Import": [
        {"title": "有人在用{keyword}嗎？求真實心得", "sentiment": "Neutral", "risk": "Low"},
        {"title": "{keyword} 真的被低估了", "sentiment": "Positive", "risk": "Low"},
    ],
}

POSITIVE_CONTENTS = [
    "{keyword}真的是太好用了，服務周到品質穩定，CP值超高，強烈推薦給大家！",
    "用{keyword}一個月了，各方面表現都很優秀，回購率100%。",
    "不得不說{keyword}真的超讚，團隊用心看得見，細節處理得很好。",
    "真心推薦{keyword}！朋友用了也都說棒，物超所值的選擇。",
    "{keyword}完全超出預期，功能強大又穩定，值得入手！",
    "被{keyword}圈粉了，之前聽別人說不錯，實際體驗真的很驚豔。",
    "{keyword}不愧是台灣之光，國際級的水準讓人也感到驕傲。",
    "{keyword}價格合理服務又好，已經回購第三次了，真的沒話說。",
]

NEUTRAL_CONTENTS = [
    "{keyword}使用上還算OK，有些地方可以改進，但整體來說不差。",
    "關於{keyword}最近討論度蠻高的，想聽聽更多人的真實意見。",
    "看了{keyword}的規格資料，中規中矩的表現，不知道實際用起來如何？",
    "有人有{keyword}的詳細比較資訊嗎？考慮入手但還在觀望中。",
    "{keyword}這個月好像有改版，不確定新版本表現如何，求分享。",
    "剛開始用{keyword}，還在摸索中，目前感覺還可以。",
]

NEGATIVE_CONTENTS = [
    "{keyword}品質真的越來越差了，價格又貴，客服也愛理不理，下次不買了。",
    "對{keyword}超級失望的，明明花了不少錢，用不到一個月就出問題。",
    "{keyword}根本是騙人的吧？廣告講得那麼好，實際體驗整個踩雷。",
    "看到{keyword}負評這麼多終於懂了，之前不信邪，現在超後悔。",
    "{keyword}真的讓人很生氣！買來三天就壞掉，退貨流程又拖超久。",
    "認真覺得{keyword}是雷貨，朋友也都這麼說，大家買之前請三思。",
    "{keyword}的服務態度有夠敷衍！打電話去問問題被踢皮球踢半天。",
    "不推薦{keyword}，品質不穩定，買兩次都不一樣，根本在賭運氣。",
]

PURCHASE_CONTENTS = [
    "看到{keyword}好心動！想問在哪買最划算？最近有優惠嗎？",
    "被{keyword}燒到了，求推薦入手管道，考慮入手一款試試看。",
    "有人已經買{keyword}了嗎？求開箱實測分享！考慮要不要下單。",
    "{keyword}這次折扣真的漂亮，已經下單了，期待到貨！",
]


def seed():
    db: Session = SessionLocal()
    try:
        existing_kw = db.query(Keyword).count()
        existing_m = db.query(Mention).count()

        if existing_m > 110:
            logger.info(f"DB has {existing_m} mentions, skipping seed.")
            return

        if existing_kw < len(KEYWORDS):
            db.query(Mention).delete()
            db.query(CrawlLog).delete()
            db.query(Keyword).delete()
            db.commit()

            kw_objs = []
            for kd in KEYWORDS:
                kw = Keyword(name=kd["name"], group_name=kd["group_name"], is_active=True, platforms=kd["platforms"])
                db.add(kw)
                kw_objs.append(kw)
            db.commit()
            for kw in kw_objs:
                db.refresh(kw)
            logger.info(f"Seeded {len(kw_objs)} keywords.")

        kw_objs = db.query(Keyword).all()
        random.seed(42)
        base_date = datetime.datetime.utcnow() - datetime.timedelta(days=30)

        for kw in kw_objs:
            platforms = [p.strip() for p in kw.platforms.split(",")]
            for platform in platforms:
                templates = PLATFORM_TEMPLATES.get(platform, PLATFORM_TEMPLATES["PTT"])
                n = random.randint(3, 7)
                for _ in range(n):
                    t = random.choice(templates)
                    s = t["sentiment"]
                    r = t["risk"]
                    title = t["title"].format(keyword=kw.name)

                    if s == "Positive":
                        content = random.choice(POSITIVE_CONTENTS).format(keyword=kw.name)
                    elif s == "Negative":
                        content = random.choice(NEGATIVE_CONTENTS).format(keyword=kw.name)
                    else:
                        content = random.choice(NEUTRAL_CONTENTS).format(keyword=kw.name)

                    should_purchase = (s == "Positive" and random.random() > 0.5)
                    if should_purchase and random.random() > 0.3:
                        content = random.choice(PURCHASE_CONTENTS).format(keyword=kw.name)

                    days_ago = random.randint(0, 30)
                    hours_ago = random.randint(0, 23)
                    pub_date = base_date + datetime.timedelta(days=days_ago, hours=hours_ago)

                    likes = random.randint(0, 500)
                    comments = random.randint(0, 80)
                    shares = random.randint(0, 60)
                    recent_count = random.randint(0, 6)

                    from app.services.ai_service import AIService
                    ai_res = AIService.analyze_content(
                        content, kw.name, likes=likes, comments=comments, shares=shares,
                        is_resolved=False, recent_count=recent_count, platform=platform
                    )

                    mention = Mention(
                        keyword_id=kw.id, platform=platform, title=title, content=content,
                        url=f"https://example.com/{platform.lower().replace(' ','')}/{random.randint(1000,9999)}",
                        author=f"user_{random.randint(100,999)}",
                        published_at=pub_date,
                        sentiment=ai_res["sentiment"], sentiment_score=ai_res["sentiment_score"],
                        risk_level=ai_res["risk_level"], purchase_intent=should_purchase,
                        ai_summary=ai_res["ai_summary"], ai_suggestion=ai_res["ai_suggestion"],
                        status="new",
                        raw_data=json.dumps({"likes": likes, "comments": comments, "shares": shares}),
                        risk_score=ai_res["risk_score"],
                        risk_reason=ai_res["risk_reason"],
                        crisis_keywords_matched=ai_res["crisis_keywords_matched"],
                        recommended_priority=ai_res["recommended_priority"],
                    )
                    db.add(mention)

            db.commit()

        total = db.query(Mention).count()
        neg = db.query(Mention).filter(Mention.sentiment == "Negative").count()
        high = db.query(Mention).filter(Mention.risk_level == "High").count()
        pi = db.query(Mention).filter(Mention.purchase_intent == True).count()

        logger.info(f"Seed complete: {total} mentions | {neg} negative | {high} high-risk | {pi} purchase-intent")

        log_count = db.query(CrawlLog).count()
        if log_count < 5:
            for kw in kw_objs[:4]:
                for _ in range(3):
                    log = CrawlLog(
                        keyword_id=kw.id, platform=kw.platforms.split(",")[0].strip(),
                        status=random.choice(["Success", "Success", "Success", "Failed"]),
                        items_count=random.randint(1, 8),
                        started_at=datetime.datetime.utcnow() - datetime.timedelta(hours=random.randint(1, 72)),
                    )
                    log.finished_at = log.started_at + datetime.timedelta(seconds=random.randint(5, 60))
                    db.add(log)
            db.commit()
            logger.info(f"Seeded {db.query(CrawlLog).count()} crawl logs.")

    except Exception as e:
        logger.error(f"Seed failed: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
