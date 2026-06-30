import re

def clean_text(text: str) -> str:
    """
    Cleans raw text content fetched from scrapers.
    - Strips HTML tags
    - Normalizes extra whitespaces
    - Cleans typical crawler noise (e.g. board/site footers)
    """
    if not text:
        return ""
    
    # Strip HTML tags
    clean = re.sub(r'<[^>]+>', '', text)
    
    # Normalize whitespaces (spaces, tabs, newlines)
    clean = re.sub(r'\s+', ' ', clean).strip()
    
    # Remove control characters
    clean = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', clean)
    
    return clean
