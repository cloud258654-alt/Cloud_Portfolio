# -*- coding: utf-8 -*-
import requests
import json
import sys

# Set stdout to UTF-8
if sys.platform.startswith("win"):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# Let's hit the locally running uvicorn server
try:
    print("Testing mentions import (JSON body)...")
    url = "http://localhost:8000/api/v1/crawler/import-csv/mentions"
    headers = {"Content-Type": "application/json"}
    payload = {"file_path": "../sample_data/mentions_sample.csv"}
    resp = requests.post(url, headers=headers, json=payload, timeout=10)
    print(f"Status Code: {resp.status_code}")
    print(f"Response: {resp.text}")
    
    print("\nTesting Google reviews import (JSON body)...")
    url = "http://localhost:8000/api/v1/crawler/import-csv/google-reviews"
    headers = {"Content-Type": "application/json"}
    payload = {"file_path": "../sample_data/google_reviews_sample.csv"}
    resp = requests.post(url, headers=headers, json=payload, timeout=10)
    print(f"Status Code: {resp.status_code}")
    print(f"Response: {resp.text}")

except Exception as e:
    print(f"Error hitting uvicorn server: {e}")
