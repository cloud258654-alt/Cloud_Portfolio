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
    opts.add_experimental_option("excludeSwitches", ["enable-automation"])
    opts.add_experimental_option("useAutomationExtension", False)
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
            time.sleep(3)

            # Try to get post cards
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "article, [class*='Post'], [class*='post']"))
                )
            except Exception:
                pass

            # Scroll for more content
            for _ in range(3):
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1.5)

            # Extract post links and titles
            articles = driver.find_elements(By.CSS_SELECTOR, "article")
            if not articles:
                articles = driver.find_elements(By.CSS_SELECTOR, "[class*='PostEntry'], [class*='post_entry'], a[href*='/f/']")

            seen_urls = set()
            for article in articles[:limit * 2]:
                try:
                    link_el = article.find_element(By.CSS_SELECTOR, "a[href*='/f/']")
                    href = link_el.get_attribute("href") or ""
                    title = link_el.text.strip()
                    if not title:
                        try:
                            title_el = article.find_element(By.CSS_SELECTOR, "h2, h3, [class*='title']")
                            title = title_el.text.strip()
                        except Exception:
                            title = ""

                    if href and href not in seen_urls and keyword in (title or ""):
                        seen_urls.add(href)
                        results.append({
                            "id": href.split("/")[-1] if "/" in href else "",
                            "title": title or f"貼文 {len(seen_urls)}",
                            "url": href,
                        })
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
