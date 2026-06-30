import requests
import re

url = "https://www.google.com/search"
params = {"q": "Python", "hl": "zh-TW"}
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

try:
    resp = requests.get(url, params=params, headers=headers, timeout=10)
    print("Status code:", resp.status_code)
    print("Response length:", len(resp.text))
    # Check if we got blocked / captcha
    if "captcha" in resp.text.lower() or "blocked" in resp.text.lower():
        print("Detected Captcha/Block!")
    else:
        print("Seems successful! Searching for search result items in HTML...")
        # A simple regex search for Google Search result links/titles
        # Google search results usually have class "egMi0 kCrYT" (mobile/simple layout) or h3 inside "yuRUbf" (desktop layout)
        print("Title search using regex:")
        titles = re.findall(r'<h3[^>]*>(.*?)</h3>', resp.text)
        print(f"Found {len(titles)} titles:")
        for t in titles[:5]:
            # strip tags
            t_clean = re.sub(r'<[^>]+>', '', t)
            print("  -", t_clean)
except Exception as e:
    print("Error:", e)
