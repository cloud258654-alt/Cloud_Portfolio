import csv
import datetime
import io
import os
import logging
from typing import List, Dict, Any, Union

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("csv_importer")


def _parse_date(val: str):
    if not val:
        return datetime.datetime.utcnow()
    try:
        return datetime.datetime.fromisoformat(val.strip())
    except (ValueError, TypeError):
        logger.warning(f"Unparseable date '{val}', using utcnow()")
        return datetime.datetime.utcnow()


def _map_rating(rating_val: str):
    try:
        r = float(rating_val)
        if r >= 5: return "Positive", 1.0
        elif r >= 4: return "Positive", 0.8
        elif r >= 3: return "Neutral", 0.0
        elif r >= 2: return "Negative", -0.5
        else: return "Negative", -0.9
    except (ValueError, TypeError):
        return "Neutral", 0.0


def _compute_sentiment_score(sentiment: str) -> float:
    if sentiment == "Positive": return 0.7
    elif sentiment == "Negative": return -0.7
    return 0.0


def _open_csv(source: Union[str, bytes, io.StringIO]) -> csv.DictReader:
    if isinstance(source, str):
        if not os.path.exists(source):
            raise FileNotFoundError(f"File not found: {source}")
        try:
            f = open(source, mode='r', encoding='utf-8-sig')
            # Read snippet to test decoding compatibility
            f.read(100)
            f.seek(0)
            return csv.DictReader(f), f
        except UnicodeDecodeError:
            try:
                f = open(source, mode='r', encoding='cp950')
                f.read(100)
                f.seek(0)
                return csv.DictReader(f), f
            except UnicodeDecodeError:
                f = open(source, mode='r', encoding='utf-8', errors='ignore')
                return csv.DictReader(f), f
    elif isinstance(source, bytes):
        try:
            text = source.decode('utf-8-sig')
        except UnicodeDecodeError:
            try:
                text = source.decode('cp950')
            except UnicodeDecodeError:
                text = source.decode('utf-8', errors='ignore')
        f = io.StringIO(text)
        return csv.DictReader(f), f
    else:
        return csv.DictReader(source), source


def _parse_stream(source: Union[str, bytes]) -> List[Dict[str, Any]]:
    reader, handle = _open_csv(source)
    try:
        results = []
        if reader.fieldnames:
            required = {"platform", "keyword", "content"}
            missing = required - set(reader.fieldnames)
            if missing:
                logger.warning(f"CSV missing columns: {missing}")

        for row in reader:
            pub_date = _parse_date(row.get("published_at", ""))
            sentiment = row.get("sentiment", "").strip() or "Neutral"
            results.append({
                "platform": row.get("platform", "Unknown"),
                "keyword": row.get("keyword", ""),
                "title": row.get("title", ""),
                "content": row.get("content", ""),
                "author_hash": f"csv_user_{row.get('author', 'Unknown')}",
                "url": row.get("url", ""),
                "published_at": pub_date,
                "likes": 0, "comments": 0, "shares": 0,
                "sentiment": sentiment,
                "sentiment_score": _compute_sentiment_score(sentiment),
            })
        return results
    finally:
        if hasattr(handle, 'close'):
            handle.close()


def _parse_reviews_stream(source: Union[str, bytes]) -> List[Dict[str, Any]]:
    reader, handle = _open_csv(source)
    try:
        results = []
        if reader.fieldnames:
            required = {"store_name", "rating", "review_text"}
            missing = required - set(reader.fieldnames)
            if missing:
                logger.warning(f"CSV missing columns: {missing}")

        for row in reader:
            pub_date = _parse_date(row.get("published_at", ""))
            rating = row.get("rating", "3")
            sentiment, score = _map_rating(rating)
            results.append({
                "platform": "Google Maps",
                "keyword": row.get("store_name", ""),
                "title": f"{row.get('store_name', '')} ({rating} Stars)",
                "content": row.get("review_text", ""),
                "author_hash": f"map_user_{row.get('author', 'Local Guide')}",
                "url": "https://maps.google.com",
                "published_at": pub_date,
                "likes": 0, "comments": 0, "shares": 0,
                "sentiment": sentiment,
                "sentiment_score": score,
            })
        return results
    finally:
        if hasattr(handle, 'close'):
            handle.close()


class CSVImporter:

    @staticmethod
    def import_mentions(source: Union[str, bytes]) -> List[Dict[str, Any]]:
        return _parse_stream(source)

    @staticmethod
    def import_google_reviews(source: Union[str, bytes]) -> List[Dict[str, Any]]:
        return _parse_reviews_stream(source)
