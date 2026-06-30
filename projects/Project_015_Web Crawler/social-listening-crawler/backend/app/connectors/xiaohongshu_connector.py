import datetime
import random
import logging
from typing import List, Dict, Any
from app.connectors.base import BaseConnector

logger = logging.getLogger("xiaohongshu_connector")

XHS_CONTENTS = [
    "終於來朝聖{keyword}了！🍜 排隊30分鐘，牛肉超嫩，湯頭超鮮甜，推推推！",
    "{keyword}真實測評來了～台南必吃牛肉湯，一碗120元CP值爆炸💥",
    "這次台南美食之旅，{keyword}是我的第一名！湯頭有淡淡藥材香，肉給超多",
    "避雷！{keyword}排了一小時結果好失望，湯頭普通牛肉也一般，不推薦❌",
    "{keyword}停車好難找，但為了這碗牛肉湯我可以！建議騎車來比較方便",
    "種草清單✨ {keyword}真的值得排隊，早上六點第一鍋湯最好喝！",
    "被朋友推坑{keyword}，真心覺得一般般，可能是期待太高了吧",
    "台南三天兩夜美食地圖：第一站就衝{keyword}，果然名不虛傳！",
    "{keyword}排隊的人好多啊！但翻桌速度蠻快的，等了大概20分鐘",
    "探店{keyword}，服務態度有待加強，但牛肉真的好吃，打70分吧",
]


class XiaohongshuConnector(BaseConnector):
    def __init__(self):
        super().__init__("小紅書")

    def fetch_mentions(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        results = []
        random.seed(hash(keyword + "xhs") % 10000)

        for i in range(min(limit, 6)):
            content = random.choice(XHS_CONTENTS).format(keyword=keyword)
            days_ago = random.randint(0, 14)
            pub_date = datetime.datetime.utcnow() - datetime.timedelta(days=days_ago)

            results.append({
                "platform": "小紅書 Import",
                "keyword": keyword,
                "title": f"{keyword} 真實測評 🇹🇼",
                "content": content,
                "author_hash": f"xhs_user_{random.randint(100,999)}",
                "url": f"https://www.xiaohongshu.com/explore/{random.randint(100000000,999999999)}",
                "published_at": pub_date,
                "likes": random.randint(20, 300),
                "comments": random.randint(3, 50),
                "shares": random.randint(5, 40),
            })

        logger.info(f"小紅書: generated {len(results)} mentions for '{keyword}'")
        return results
