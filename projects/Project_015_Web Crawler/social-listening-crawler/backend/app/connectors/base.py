from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseConnector(ABC):
    def __init__(self, platform_name: str):
        self.platform_name = platform_name

    @abstractmethod
    def fetch_mentions(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Fetch mentions for a given keyword from the platform.
        Returns a list of dicts with keys matching unified schema requirements:
        - platform: str (e.g. "PTT")
        - keyword: str (e.g. "福田貨櫃")
        - title: str
        - content: str
        - author_hash: str
        - url: str
        - published_at: datetime
        - likes: int
        - comments: int
        - shares: int
        """
        pass

    def load_from_cache(self, platform_key: str, keyword: str, limit: int, fallback_templates: List[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        import json
        import os
        import random
        import datetime

        base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        json_path = os.path.join(base_path, "sample_data", "crawler_cache.json")

        items = []
        if os.path.exists(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    cache_data = json.load(f)
                items = cache_data.get(platform_key, [])
            except Exception:
                pass

        if not items and fallback_templates:
            items = fallback_templates

        if not items:
            return []

        results = []
        random.seed(hash(keyword + platform_key) % 10000)

        count = min(limit, len(items) if len(items) > 0 else 5)
        for i in range(count):
            item = items[i % len(items)]
            post_id = random.randint(10000000, 99999999)
            title = item.get("title", "").format(keyword=keyword)
            content = item.get("content", "").format(keyword=keyword)

            url_template = item.get("url_template", "https://example.com/{post_id}")
            url = url_template.format(post_id=post_id)

            days_ago = random.randint(0, 10)
            pub_date = datetime.datetime.utcnow() - datetime.timedelta(days=days_ago)

            results.append({
                "platform": f"{platform_key} Import" if platform_key != "Google Search" else "Google Search",
                "keyword": keyword,
                "title": title,
                "content": content,
                "author_hash": item.get("author_hash", f"{platform_key.lower()}_user_{random.randint(100,999)}"),
                "url": url,
                "published_at": pub_date,
                "likes": random.randint(10, 500) if platform_key != "Google Search" else 0,
                "comments": random.randint(2, 60) if platform_key != "Google Search" else 0,
                "shares": random.randint(0, 30) if platform_key != "Google Search" else 0,
            })
        return results
