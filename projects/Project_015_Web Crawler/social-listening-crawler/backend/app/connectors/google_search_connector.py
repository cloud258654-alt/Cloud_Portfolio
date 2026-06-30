import datetime
import random
import logging
import requests
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from app.connectors.base import BaseConnector
from app.config import settings

logger = logging.getLogger("google_search_connector")

class GoogleSearchConnector(BaseConnector):
    def __init__(self):
        super().__init__("Google Search")

    def _fetch_from_api(self, keyword: str, limit: int) -> List[Dict[str, Any]]:
        api_key = getattr(settings, "GOOGLE_API_KEY", "")
        cse_id = getattr(settings, "GOOGLE_CSE_ID", "")
        if not api_key or not cse_id:
            logger.info("Google Search API: GOOGLE_API_KEY or GOOGLE_CSE_ID not set. Skipping API call.")
            return []

        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "key": api_key,
            "cx": cse_id,
            "q": keyword,
            "num": min(limit, 10)
        }
        try:
            logger.info(f"Google Search API: querying for '{keyword}'...")
            resp = requests.get(url, params=params, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                items = data.get("items", [])
                results = []
                for item in items:
                    title = item.get("title", "")
                    snippet = item.get("snippet", "")
                    link = item.get("link", "")
                    display_link = item.get("displayLink", "google.com")
                    
                    results.append({
                        "platform": "Google Search",
                        "keyword": keyword,
                        "title": title,
                        "content": snippet or title,
                        "author_hash": f"google_search_{display_link.split('.')[0]}",
                        "url": link,
                        "published_at": datetime.datetime.utcnow(),
                        "likes": 0,
                        "comments": 0,
                        "shares": 0
                    })
                logger.info(f"Google Search API: found {len(results)} results for '{keyword}'")
                return results
            else:
                logger.warning(f"Google Search API returned status code {resp.status_code}: {resp.text}")
                return []
        except Exception as e:
            logger.warning(f"Google Search API request failed: {e}")
            return []

    def _crawl_html(self, keyword: str, limit: int) -> List[Dict[str, Any]]:
        url = "https://www.google.com/search"
        params = {"q": keyword, "hl": "zh-TW"}
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        try:
            logger.info(f"Google Search HTML Crawl: requesting '{keyword}'...")
            resp = requests.get(url, params=params, headers=headers, timeout=10)
            if resp.status_code != 200:
                logger.warning(f"Google Search HTML: HTTP {resp.status_code}")
                return []
                
            if "captcha" in resp.text.lower() or "blocked" in resp.text.lower():
                logger.warning("Google Search HTML: Blocked by Captcha/Anti-scraping")
                return []
                
            soup = BeautifulSoup(resp.text, "html.parser")
            results = []
            
            blocks = soup.find_all(class_="g")
            for block in blocks[:limit * 2]:
                link_el = block.find("a", href=True)
                title_el = block.find("h3")
                desc_el = block.find(class_=lambda c: c and ("vwic3b" in c.lower() or "y5vodb" in c.lower() or "st" in c.lower()))
                
                if link_el and title_el:
                    href = link_el["href"]
                    if href.startswith("/url?q="):
                        href = href.split("/url?q=")[1].split("&")[0]
                        
                    if not href.startswith("http"):
                        continue
                        
                    title = title_el.text.strip()
                    desc = desc_el.text.strip() if desc_el else title
                    
                    results.append({
                        "platform": "Google Search",
                        "keyword": keyword,
                        "title": title,
                        "content": desc or title,
                        "author_hash": f"google_html_{href.split('//')[1].split('/')[0] if '//' in href else 'search'}",
                        "url": href,
                        "published_at": datetime.datetime.utcnow(),
                        "likes": 0,
                        "comments": 0,
                        "shares": 0
                    })
                    if len(results) >= limit:
                        break
                        
            # Fallback simple link parser
            if not results:
                h3_tags = soup.find_all("h3")
                for h3 in h3_tags[:limit * 2]:
                    a_tag = h3.find_parent("a", href=True) or h3.find("a", href=True)
                    if not a_tag:
                        curr = h3
                        for _ in range(3):
                            if curr.name == "a" and curr.get("href"):
                                a_tag = curr
                                break
                            curr = curr.parent
                            if not curr:
                                break
                    if a_tag:
                        href = a_tag["href"]
                        if href.startswith("/url?q="):
                            href = href.split("/url?q=")[1].split("&")[0]
                        if not href.startswith("http"):
                            continue
                        title = h3.text.strip()
                        results.append({
                            "platform": "Google Search",
                            "keyword": keyword,
                            "title": title,
                            "content": title,
                            "author_hash": "google_html_fallback",
                            "url": href,
                            "published_at": datetime.datetime.utcnow(),
                            "likes": 0,
                            "comments": 0,
                            "shares": 0
                        })
                        if len(results) >= limit:
                            break
                            
            logger.info(f"Google Search HTML Crawl: extracted {len(results)} results using BeautifulSoup")
            return results
        except Exception as e:
            logger.warning(f"Google Search HTML Crawl error: {e}")
            return []

    def fetch_mentions(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        # 1. Try Google Search API
        results = self._fetch_from_api(keyword, limit)
        if results:
            return results

        # 2. Try HTML Crawl with BeautifulSoup
        results = self._crawl_html(keyword, limit)
        if results:
            return results

        # 3. Fallback to Local JSON Cache
        logger.info(f"Google Search: falling back to JSON cache for '{keyword}'")
        fallback_templates = [
            {"title": "深入探討 {keyword}：原理、應用與未來挑戰", "content": "雖然 {keyword} 帶來了極大的便利，但在資料安全、隱私保護以及合規性上依然存在諸多挑戰，需要業界共同制定標準。"}
        ]
        return self.load_from_cache("Google Search", keyword, limit, fallback_templates)
