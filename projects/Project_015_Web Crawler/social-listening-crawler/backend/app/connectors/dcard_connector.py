import datetime
import random
from typing import List, Dict, Any
from app.connectors.base import BaseConnector

class DcardConnector(BaseConnector):
    def __init__(self):
        super().__init__("Dcard")

    def fetch_mentions(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        forums = ["trending", "talk", "makeup", "tech", "money"]
        templates = [
            "有人也有關注 {keyword} 嗎？",
            "關於 {keyword}，大家的心得分享",
            "求救！有人買過 {keyword} 嗎？",
            "被推坑的 {keyword} 開箱實測！",
            "【閒聊】對 {keyword} 的一些看法與疑惑"
        ]
        contents = [
            "最近一直在 Dcard 看到有人推 {keyword}，自己也忍不住入手了。實測下來真的蠻不錯的，質地很好，用起來很舒服！分享給大家。",
            "大家最近有聽過 {keyword} 嗎？感覺討論度超高耶，可是身邊好像沒什麼人在用，想問問真實的評價，謝謝大家！",
            "真的快被 {keyword} 氣死... 買回來不到三天就壞了，客服態度又很敷衍。有人有類似經驗嗎？求解決辦法！",
            "考完試終於有時間整理關於 {keyword} 的心得了。整體來說優點是大於缺點的，特別是它的設計非常貼心。以下是我的詳細分析...",
            "看到好多人在討論 {keyword}，我覺得這根本是行銷手法吧？實際去店裡看覺得質感普通，真的有值這個價錢嗎？"
        ]
        
        results = []
        count = min(limit, random.randint(3, 8))
        for i in range(count):
            title = random.choice(templates).format(keyword=keyword)
            content = random.choice(contents).format(keyword=keyword)
            forum = random.choice(forums)
            author = "匿名" if random.random() > 0.3 else f"國立台灣大學_{random.randint(100,999)}"
            
            days_ago = random.randint(0, 7)
            hours_ago = random.randint(0, 23)
            pub_date = datetime.datetime.utcnow() - datetime.timedelta(days=days_ago, hours=hours_ago)
            
            likes_val = random.randint(5, 500)
            comments_val = random.randint(2, 80)
            results.append({
                "platform": "Dcard",
                "keyword": keyword,
                "title": title,
                "content": content,
                "author_hash": f"mock_dcard_user_{hash(author)}",
                "url": f"https://www.dcard.tw/f/{forum}/p/{random.randint(200000000, 299999999)}",
                "published_at": pub_date,
                "likes": likes_val,
                "comments": comments_val,
                "shares": 0
            })
        return results
