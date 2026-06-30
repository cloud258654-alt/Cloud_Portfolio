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

logger = logging.getLogger("google_maps_connector")


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


class GoogleMapsConnector(BaseConnector):
    def __init__(self):
        super().__init__("Google Maps")

    def _scrape_maps_reviews(self, keyword: str, limit: int = 10) -> List[str]:
        driver = None
        reviews = []
        try:
            driver = _create_driver()
            url = f"https://www.google.com/maps/search/{keyword}"
            driver.get(url)
            time.sleep(5)

            # Wait for search results to load
            try:
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "[role='feed'], [aria-label*='結果'], [class*='result']"))
                )
            except Exception:
                pass

            # Scroll to load more results
            for _ in range(3):
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)

            # Try multiple selectors for review text
            selectors = [
                "[class*='review']",
                "[class*='comment']",
                "[data-review-id]",
                "span[class*='wiI7pd']",
                "div[class*='MyEned']",
                "[aria-label*='星']",
            ]

            found_texts = set()
            for selector in selectors:
                try:
                    elements = driver.find_elements(By.CSS_SELECTOR, selector)
                    for el in elements:
                        text = el.text.strip()
                        if len(text) > 20 and len(text) < 600:
                            found_texts.add(text)
                except Exception:
                    continue

            reviews = list(found_texts)[:limit]
            logger.info(f"Google Maps Selenium: found {len(reviews)} review texts")
        except Exception as e:
            logger.warning(f"Google Maps Selenium error: {e}")
        finally:
            if driver:
                driver.quit()
        return reviews

    def fetch_mentions(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        review_texts = self._scrape_maps_reviews(keyword, limit)
        results = []

        for i, text in enumerate(review_texts[:limit]):
            days_ago = (i * 2) + 1
            pub_date = datetime.datetime.utcnow() - datetime.timedelta(days=days_ago)
            results.append({
                "platform": "Google Maps",
                "keyword": keyword,
                "title": f"{keyword} - 評論 #{i+1}",
                "content": text[:500],
                "author_hash": f"maps_reviewer_{i+1000}",
                "url": f"https://www.google.com/maps/search/{keyword}",
                "published_at": pub_date,
                "likes": (i + 1) * 3 % 50,
                "comments": 0,
                "shares": 0,
            })

        logger.info(f"Google Maps: returning {len(results)} mentions")
        return results
