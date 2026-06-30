import datetime
import random
from typing import List, Dict, Any
from app.connectors.base import BaseConnector

class PTTConnector(BaseConnector):
    def __init__(self):
        super().__init__("PTT")

    def fetch_mentions(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        # Mocking some PTT posts matching the keyword
        boards = ["Gossiping", "Stock", "Lifeismoney", "C_Chat", "Tech_Job"]
        templates = [
            "[問卦] 大家對 {keyword} 有什麼看法？",
            "[新聞] 震驚！{keyword} 竟然發生這種事！",
            "[討論] 關於最近很紅的 {keyword}...",
            "[心得] 使用 {keyword} 一個月的真實感受",
            "[情報] 最新 {keyword} 特價優惠資訊！"
        ]
        contents = [
            "最近看到大家一直在討論 {keyword}，我也去研究了一下。感覺這個東西蠻有意思的，可是也有一些疑慮。大家覺得呢？有八卦嗎？",
            "媒體報導指出，{keyword} 正在席捲市場，許多專家對此表示看好，但也警告可能帶來的潛在風險。各位鄉民怎麼看？",
            "真心覺得 {keyword} 很方便耶！以前都沒有想過可以這樣用，現在生活省了很多時間，大推！",
            "老實說，我個人覺得 {keyword} 被過譽了。用了幾次覺得體驗蠻普通的，而且價格偏貴，CP值不高。不推薦大家買。",
            "剛剛看到又有 {keyword} 的新消息了，聽說之後會推出升級版，不知道是真是假。有知情人士可以分享一下嗎？"
        ]
        authors = ["xiaoming", "gigisong", "wanger", "lisa123", "jacky888", "chen99"]

        results = []
        count = min(limit, random.randint(3, 8))
        for i in range(count):
            title = random.choice(templates).format(keyword=keyword)
            content = random.choice(contents).format(keyword=keyword)
            board = random.choice(boards)
            author = random.choice(authors)
            
            # Random date within last 7 days
            days_ago = random.randint(0, 7)
            hours_ago = random.randint(0, 23)
            pub_date = datetime.datetime.utcnow() - datetime.timedelta(days=days_ago, hours=hours_ago)
            
            results.append({
                "platform": "PTT",
                "keyword": keyword,
                "title": title,
                "content": content,
                "author_hash": f"mock_ptt_user_{author}",
                "url": f"https://www.ptt.cc/bbs/{board}/M.{random.randint(1000000000, 1999999999)}.A.html",
                "published_at": pub_date,
                "likes": random.randint(0, 100),
                "comments": random.randint(0, 150),
                "shares": 0
            })
        return results
