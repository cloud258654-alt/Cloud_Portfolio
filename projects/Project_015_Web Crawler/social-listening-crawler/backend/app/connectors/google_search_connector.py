import datetime
import random
from typing import List, Dict, Any
from app.connectors.base import BaseConnector

class GoogleSearchConnector(BaseConnector):
    def __init__(self):
        super().__init__("Google Search")

    def fetch_mentions(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        sites = ["inside.com.tw", "bnext.com.tw", "ithome.com.tw", "technews.tw", "yahoo.com.tw"]
        templates = [
            "{keyword} 產業趨勢與未來市場展望報告",
            "如何使用 {keyword} 提升企業競爭力？專家詳細剖析",
            "{keyword} 最新技術突破！引領行業新風潮",
            "二○二六年度最佳 {keyword} 工具推薦與評比",
            "深入探討 {keyword}：原理、應用與未來挑戰"
        ]
        snippets = [
            "根據最新市場調查，{keyword} 在亞太地區的需求正以年均複合增長率15%的速度成長。各大廠商正積極佈局相關產品線...",
            "本篇文章為您解析 {keyword} 的核心價值，並分享三個成功導入的實際案例，幫助您的團隊快速上手、發揮綜效。",
            "科技大廠今日宣佈推出全新一代 {keyword} 解決方案，宣稱效能提升超過50%，能有效降低客戶部署成本與時程。",
            "評測團隊針對市面上熱門的五款 {keyword} 進行了為期一個月的深度測試，從功能、易用性、性價比等維度進行綜合評估。",
            "雖然 {keyword} 帶來了極大的便利，但在資料安全、隱私保護以及合規性上依然存在諸多挑戰，需要業界共同制定標準。"
        ]

        results = []
        count = min(limit, random.randint(2, 6))
        for i in range(count):
            title = random.choice(templates).format(keyword=keyword)
            content = random.choice(snippets).format(keyword=keyword)
            site = random.choice(sites)
            
            days_ago = random.randint(0, 14)
            pub_date = datetime.datetime.utcnow() - datetime.timedelta(days=days_ago)
            
            results.append({
                "platform": "Google Search",
                "keyword": keyword,
                "title": title,
                "content": content,
                "author_hash": f"system_google_index_{site.split('.')[0]}",
                "url": f"https://www.{site}/article/{random.randint(1000, 99999)}",
                "published_at": pub_date,
                "likes": 0,
                "comments": 0,
                "shares": 0
            })
        return results
