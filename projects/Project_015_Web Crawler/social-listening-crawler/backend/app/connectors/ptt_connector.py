import datetime
import re
import logging
from typing import List, Dict, Any
import requests
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
        urls = re.findall(r'href="(/bbs/\w+/M\.\d+\.A\.\w+\.html)"', html)
        seen = set()
        unique = []
        for u in urls:
            if u not in seen:
                seen.add(u)
                unique.append(u)
        return unique

    def _parse_article(self, html: str) -> Dict[str, Any]:
        result = {"author": "", "title": "", "content": "", "published_at": None, "push_count": 0}

        author_m = re.search(r'<span class="article-meta-value">([^<]+)</span>', html)
        if author_m:
            result["author"] = author_m.group(1).strip()

        # Extract metadata lines: author, board, title, time
        meta_matches = re.findall(r'<span class="article-meta-value">([^<]+)</span>', html)
        if len(meta_matches) >= 4:
            result["title"] = meta_matches[2].strip()
            time_str = meta_matches[3].strip()
            try:
                result["published_at"] = datetime.datetime.strptime(time_str, "%a %b %d %H:%M:%S %Y")
            except ValueError:
                pass

        # Extract content between -- and ※
        content_m = re.search(r'(?:<div id="main-content"[^>]*>)(.*?)(?:--\s*\n?※)', html, re.DOTALL)
        if content_m:
            raw = content_m.group(1)
            raw = re.sub(r'<span[^>]*>[^<]*</span>', '', raw)
            raw = re.sub(r'<[^>]+>', '', raw)
            raw = re.sub(r'\n{3,}', '\n\n', raw)
            result["content"] = raw.strip()[:2000]
        else:
            result["content"] = result["title"]

        # Push count
        pushes = re.findall(r'<span class="(?:push|boo|neutral) [^"]*">', html)
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
