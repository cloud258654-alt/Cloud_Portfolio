import datetime
import random
import logging
from typing import List, Dict, Any
from app.connectors.base import BaseConnector

logger = logging.getLogger("threads_connector")

THREADS_CONTENTS = [
    "今天終於吃到{keyword}了 🤤 排隊排了40分鐘但真的好好吃，牛肉嫩到不行！",
    "{keyword}真的必吃！！台南人的早餐就是牛肉湯配肉燥飯 😋",
    "第一次吃{keyword}，這湯頭也太讚了吧，完全懂為什麼大家都在排隊",
    "被朋友推坑{keyword}，果真名不虛傳，但假日人真的太多了⋯⋯",
    "拜託不要再推{keyword}了，排隊人潮已經夠多了 😭 在地人快吃不到",
    "覺得{keyword}還好耶，可能不合我口味，湯頭偏甜不太習慣",
    "{keyword}的一個小缺點是停車超難，建議騎車去",
    "昨天去{keyword}等了快一小時，等太久差點放棄，但吃到第一口就原諒了",
    "真心不騙，{keyword}是台南最強牛肉湯，沒有之一！",
    "{keyword}排隊人潮從沒少過，但翻桌很快，其實不用等太久",
]

THREADS_AUTHORS = ["foodie_taiwan", "tainan_eats", "beef_soup_lover", "台南吃貨", "美食探險家",
                   "安平小吃貨", "吃遍台灣", "深夜食堂日記", "旅人食記", "南部美食地圖"]


class ThreadsConnector(BaseConnector):
    def __init__(self):
        super().__init__("Threads")

    def fetch_mentions(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        results = []
        random.seed(hash(keyword + "threads") % 10000)

        for i in range(min(limit, 6)):
            content = random.choice(THREADS_CONTENTS).format(keyword=keyword)
            days_ago = random.randint(0, 10)
            pub_date = datetime.datetime.utcnow() - datetime.timedelta(days=days_ago)
            post_id = random.randint(100000000, 999999999)

            results.append({
                "platform": "Threads Import",
                "keyword": keyword,
                "title": f"@{random.choice(THREADS_AUTHORS)} · {keyword}",
                "content": content,
                "author_hash": random.choice(THREADS_AUTHORS),
                "url": f"https://www.threads.net/@foodie_tw/post/{post_id}",
                "published_at": pub_date,
                "likes": random.randint(50, 500),
                "comments": random.randint(5, 60),
                "shares": random.randint(2, 30),
            })

        logger.info(f"Threads: generated {len(results)} mentions for '{keyword}'")
        return results
