import datetime
import random
import logging
from typing import List, Dict, Any
from app.connectors.base import BaseConnector

logger = logging.getLogger("tiktok_connector")

TIKTOK_CONTENTS = [
    "#台南美食 #牛肉湯 {keyword} 真的名不虛傳！排隊人潮超多但真的值得 🔥",
    "來台南一定要吃{keyword}！這湯頭直接封神了啦 🍜 #美食推薦",
    "吃了{keyword}之後回不去了，台北的牛肉湯都是什麼東西 😂 #台南必吃",
    "{keyword}排隊排了快一小時，但吃到第一口就覺得一切都值得了 #排隊美食",
    "真心不騙，{keyword}是台南前三名的牛肉湯！肉嫩湯鮮 #美食探店",
    "帶爸媽來吃{keyword}，他們說這是年輕時的味道，好感動 🥹 #台南老店",
    "今天踩雷了⋯{keyword}沒有想像中好吃，可能我口味不合吧 #美食日記",
    "台南牛肉湯大評比：{keyword} vs 六千 vs 阿村，個人覺得{keyword}湯頭最強！",
    "{keyword}早上去人比較少！給大家一個小祕密：早上六點第一鍋最好喝",
    "連續三天都吃{keyword}，朋友說我瘋了，但真的好好吃 🤤 #牛肉湯控",
]

TIKTOK_AUTHORS = ["tainanfoodie", "beefsoupking", "台南小吃貨", "美食探店日記",
                   "吃貨阿德", "南部人帶你吃", "旅人美食地圖", "深夜吃貨"]


class TikTokConnector(BaseConnector):
    def __init__(self):
        super().__init__("TikTok")

    def fetch_mentions(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        fallback_templates = [
            {
                "title": f"@{random.choice(TIKTOK_AUTHORS)} · {keyword} 美食探店",
                "content": c,
                "author_hash": random.choice(TIKTOK_AUTHORS),
                "url_template": "https://www.tiktok.com/@foodie_tw/video/{post_id}"
            }
            for c in TIKTOK_CONTENTS
        ]
        results = self.load_from_cache("TikTok", keyword, limit, fallback_templates)
        logger.info(f"TikTok: loaded {len(results)} mentions for '{keyword}'")
        return results
