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
