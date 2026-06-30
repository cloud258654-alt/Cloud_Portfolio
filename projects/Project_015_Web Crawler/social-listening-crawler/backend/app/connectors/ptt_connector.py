import datetime
import re
import logging
from typing import List, Dict, Any
import requests
from bs4 import BeautifulSoup
from app.connectors.base import BaseConnector

logger = logging.getLogger("ptt_connector")

PTT_SEARCH_URL = "https://www.ptt.cc/bbs/{board}/search"
PTT_BOARDS = ["Food", "Tainan", "Gossiping"]


class PTTConnector(BaseConnector):
    def __init__(self):
        super().__init__("PTT")
        self.session = requests.Session()
        self.session.cookies.set("over18", "1")

    def _fetch_search(self, board: str, keyword: str) -> str:
        params = {"q": keyword}
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        try:
            resp = self.session.get(
                PTT_SEARCH_URL.format(board=board), params=params,
                headers=headers, timeout=10
            )
            resp.encoding = "utf-8"
            return resp.text
        except Exception as e:
            logger.warning(f"PTT search {board}/{keyword}: {e}")
            return ""

    def _fetch_article(self, url: str) -> str:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        try:
            resp = self.session.get(url, headers=headers, timeout=10)
            resp.encoding = "utf-8"
            return resp.text
        except Exception as e:
            logger.warning(f"PTT article {url}: {e}")
            return ""

    def _parse_search_results(self, html: str) -> List[str]:
        if not html:
            return []
        soup = BeautifulSoup(html, "html.parser")
        urls = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if href.startswith("/bbs/") and href.endswith(".html"):
                urls.append(href)
        seen = set()
        unique = []
        for u in urls:
            if u not in seen:
                seen.add(u)
                unique.append(u)
        return unique

    def _parse_article(self, html: str) -> Dict[str, Any]:
        result = {"author": "", "title": "", "content": "", "published_at": None, "push_count": 0}
        if not html:
            return result
        soup = BeautifulSoup(html, "html.parser")

        # Extract metadata
        meta_values = [el.text.strip() for el in soup.find_all(class_="article-meta-value")]
        if len(meta_values) >= 4:
            result["author"] = meta_values[0]
            result["title"] = meta_values[2]
            time_str = meta_values[3]
            try:
                result["published_at"] = datetime.datetime.strptime(time_str, "%a %b %d %H:%M:%S %Y")
            except ValueError:
                pass
        else:
            meta_lines = soup.find_all(class_="article-metaline")
            for line in meta_lines:
                label = line.find(class_="article-meta-tag")
                val = line.find(class_="article-meta-value")
                if label and val:
                    tag_text = label.text.strip()
                    val_text = val.text.strip()
                    if "作者" in tag_text:
                        result["author"] = val_text
                    elif "標題" in tag_text:
                        result["title"] = val_text
                    elif "時間" in tag_text:
                        try:
                            result["published_at"] = datetime.datetime.strptime(val_text, "%a %b %d %H:%M:%S %Y")
                        except ValueError:
                            pass

        # Main content
        main_content = soup.find(id="main-content")
        if main_content:
            import copy
            content_copy = copy.copy(main_content)
            for el in content_copy.find_all(class_=["article-metaline", "article-metalines", "push"]):
                el.decompose()
            
            text = content_copy.text
            if "--" in text:
                text = text.split("--")[0]
            result["content"] = text.strip()[:2000]
        else:
            result["content"] = result["title"]

        # Push count
        pushes = soup.find_all(class_="push")
        result["push_count"] = len(pushes)

        return result

    def fetch_mentions(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        results = []
        article_urls = []

        # Try shorter keywords if full keyword fails
        search_terms = [keyword]
        if len(keyword) > 6:
            search_terms.append(keyword[:6])
        if len(keyword) > 4:
            search_terms.append(keyword[:4])

        for board in PTT_BOARDS:
            if len(article_urls) >= limit * 2:
                break
            for term in search_terms:
                if len(article_urls) >= limit * 2:
                    break
                html = self._fetch_search(board, term)
                if not html:
                    continue
                urls = self._parse_search_results(html)
                full_urls = [f"https://www.ptt.cc{u}" for u in urls if u not in article_urls]
                article_urls.extend(full_urls)
                logger.info(f"PTT {board} '{term}': found {len(urls)} results")

        article_urls = article_urls[:limit]
        logger.info(f"PTT: fetching {len(article_urls)} articles for '{keyword}'")

        for url in article_urls:
            try:
                html = self._fetch_article(url)
                if not html:
                    continue
                parsed = self._parse_article(html)

                title = parsed["title"] or keyword
                content = parsed["content"] or title

                results.append({
                    "platform": "PTT",
                    "keyword": keyword,
                    "title": title,
                    "content": content,
                    "author_hash": parsed["author"] or "ptt_user",
                    "url": url,
                    "published_at": parsed["published_at"] or datetime.datetime.utcnow(),
                    "likes": max(0, parsed["push_count"] or 0),
                    "comments": max(0, parsed["push_count"] or 0),
                    "shares": 0,
                })
            except Exception as e:
                logger.warning(f"PTT parse error {url}: {e}")
                continue

        if not results:
            logger.info(f"PTT: no results for '{keyword}', returning empty")
        return results
