import datetime
import re
import logging
import time
from typing import List, Dict, Any
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from app.connectors.base import BaseConnector

logger = logging.getLogger("dcard_connector")


def _create_driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1920,1080")
    opts.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
    opts.add_argument("--lang=zh-TW")
    opts.add_argument("--blink-settings=imagesEnabled=false")
    opts.add_experimental_option("excludeSwitches", ["enable-automation"])
    opts.add_experimental_option("useAutomationExtension", False)
    
    # Also disable images via preferences
    chrome_prefs = {"profile.managed_default_content_settings.images": 2}
    opts.experimental_options["prefs"] = chrome_prefs
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=opts)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver


class DcardConnector(BaseConnector):
    def __init__(self):
        super().__init__("Dcard")

    def _scrape_search(self, keyword: str, limit: int = 10) -> List[Dict]:
        driver = None
        results = []
        try:
            driver = _create_driver()
            url = f"https://www.dcard.tw/search?query={keyword}&forum=food"
            driver.get(url)

            # Wait for content to load dynamically
            try:
                WebDriverWait(driver, 8).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "article, [class*='Post'], [class*='post']"))
                )
            except Exception:
                time.sleep(1.5)

            # Scroll for more content
            scroll_loops = 2 if limit <= 10 else 3
            for _ in range(scroll_loops):
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1.0)

            # Extract post links and titles using BeautifulSoup
            html = driver.page_source
            soup = BeautifulSoup(html, "html.parser")
            
            articles = soup.find_all("article")
            if not articles:
                articles = soup.find_all(class_=lambda c: c and ("postentry" in c.lower() or "post_entry" in c.lower()))
            if not articles:
                articles = soup.find_all("a", href=lambda h: h and "/f/" in h)

            seen_urls = set()
            for article in articles:
                try:
                    if article.name == "a":
                        link_el = article
                    else:
                        link_el = article.find("a", href=lambda h: h and "/f/" in h)
                    
                    if not link_el:
                        continue
                        
                    href = link_el.get("href") or ""
                    if href.startswith("/"):
                        href = f"https://www.dcard.tw{href}"
                        
                    title = link_el.text.strip()
                    if not title:
                        title_el = article.find(["h2", "h3"]) or article.find(class_=lambda c: c and "title" in c.lower())
                        if title_el:
                            title = title_el.text.strip()
                            
                    if href and href not in seen_urls and keyword in (title or ""):
                        seen_urls.add(href)
                        results.append({
                            "id": href.split("/")[-1] if "/" in href else "",
                            "title": title or f"貼文 {len(seen_urls)}",
                            "url": href,
                        })
                        if len(results) >= limit:
                            break
                except Exception:
                    continue

            logger.info(f"Dcard Selenium: found {len(results)} posts for '{keyword}'")
        except Exception as e:
            logger.warning(f"Dcard Selenium error: {e}")
        finally:
            if driver:
                driver.quit()
        return results

    def fetch_mentions(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        posts = self._scrape_search(keyword, limit)

        if not posts:
            logger.info(f"Dcard: no results for '{keyword}'")
            return []

        mentions = []
        for post in posts[:limit]:
            mentions.append({
                "platform": "Dcard",
                "keyword": keyword,
                "title": post["title"],
                "content": post["title"],
                "author_hash": "dcard_user",
                "url": post["url"],
                "published_at": datetime.datetime.utcnow(),
                "likes": 0,
                "comments": 0,
                "shares": 0,
            })

        logger.info(f"Dcard: returning {len(mentions)} mentions")
        return mentions
