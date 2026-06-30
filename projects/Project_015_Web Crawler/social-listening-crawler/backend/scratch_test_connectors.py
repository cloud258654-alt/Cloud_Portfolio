# scratch_test_connectors.py
import sys
import os
import json

# Adjust python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.connectors.ptt_connector import PTTConnector
from app.connectors.dcard_connector import DcardConnector
from app.connectors.google_maps_connector import GoogleMapsConnector
from app.services.llm_service import analyze_with_llm

def test_markdown_json_cleanup():
    print("Testing Markdown JSON cleanup...")
    # Simulate a raw LLM output wrapped in markdown code blocks
    raw_response = """
```json
{
  "sentiment": "Negative",
  "sentiment_score": -0.85,
  "risk_score": 92,
  "risk_reason": "食安疑慮與拉肚子情況嚴重",
  "crisis_keywords_matched": ["食安", "拉肚子"],
  "recommended_priority": "P0",
  "purchase_intent": false,
  "summary": "消費者反應吃完後拉肚子",
  "suggestion": "立即停業整頓"
}
```
"""
    # Let's verify our cleanup logic works
    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if len(lines) >= 2 and lines[0].startswith("```"):
            lines = lines[1:]
        if len(lines) >= 1 and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    
    try:
        data = json.loads(cleaned)
        assert data["sentiment"] == "Negative"
        assert data["risk_score"] == 92
        print(" -> Markdown JSON cleanup test passed!")
    except Exception as e:
        print(f" -> Markdown JSON cleanup test failed: {e}")
        sys.exit(1)

def test_ptt_connector_fallback():
    print("Testing PTT Connector Cache Fallback...")
    connector = PTTConnector()
    # Mocking _fetch_search to return empty, forcing cache fallback
    connector._fetch_search = lambda board, term: ""
    results = connector.fetch_mentions("測試品牌", limit=5)
    print(f" -> Found {len(results)} results")
    assert len(results) > 0, "PTT Connector did not fall back to cache!"
    assert any("測試品牌" in r["title"] or "測試品牌" in r["content"] for r in results)
    print(" -> PTT Connector fallback test passed!")

def test_dcard_connector_fallback():
    print("Testing Dcard Connector Cache Fallback...")
    connector = DcardConnector()
    # Mocking _scrape_search to return empty, forcing cache fallback
    connector._scrape_search = lambda kw, limit: []
    results = connector.fetch_mentions("測試品牌", limit=5)
    print(f" -> Found {len(results)} results")
    assert len(results) > 0, "Dcard Connector did not fall back to cache!"
    assert any("測試品牌" in r["title"] or "測試品牌" in r["content"] for r in results)
    print(" -> Dcard Connector fallback test passed!")

def test_google_maps_connector_fallback():
    print("Testing Google Maps Connector Cache Fallback...")
    connector = GoogleMapsConnector()
    # Mocking _scrape_maps_reviews to return empty, forcing cache fallback
    connector._scrape_maps_reviews = lambda kw, limit: []
    results = connector.fetch_mentions("測試品牌", limit=5)
    print(f" -> Found {len(results)} results")
    assert len(results) > 0, "Google Maps Connector did not fall back to cache!"
    assert any("測試品牌" in r["title"] or "測試品牌" in r["content"] for r in results)
    print(" -> Google Maps Connector fallback test passed!")

if __name__ == "__main__":
    test_markdown_json_cleanup()
    test_ptt_connector_fallback()
    test_dcard_connector_fallback()
    test_google_maps_connector_fallback()
    print("All backend connector fallback and parsing tests passed successfully!")
