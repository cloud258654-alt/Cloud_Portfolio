#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fetch_raw.py
------------
Fetches raw weather JSON data from the CWA API using Authorization headers
and saves it locally to 'weather_raw.json'.
"""

import sys
import os
import urllib.request
import json
import ssl

def load_dotenv(filepath=".env"):
    """Loads environment variables from a .env file if it exists."""
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    os.environ[key] = val

def fetch_and_save_raw(url, output_json="weather_raw.json"):
    # Load env and retrieve token
    load_dotenv()
    token = os.getenv("CWA_API_TOKEN")
    
    if not token:
        print("[!] Error: CWA_API_TOKEN not found in environment or .env file.")
        print("[*] Please write your token in the '.env' file, e.g.:")
        print("    CWA_API_TOKEN=your_token_here")
        sys.exit(1)
        
    print(f"[*] Fetching raw JSON from: {url.split('?')[0]}")
    
    # Configure SSL
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    headers = {
        'User-Agent': 'Mozilla/5.0',
        'Authorization': token
    }
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            status_code = response.getcode()
            if status_code != 200:
                raise Exception(f"HTTP response status code: {status_code}")
            
            raw_data = json.loads(response.read().decode('utf-8'))
            
            # Save raw data to file
            with open(output_json, "w", encoding="utf-8") as f:
                json.dump(raw_data, f, ensure_ascii=False, indent=2)
                
            print(f"[+] Raw JSON data successfully saved to: {output_json}")
            return True
    except Exception as e:
        print(f"[!] Error fetching raw data: {e}")
        sys.exit(1)

def main():
    # REST API endpoints
    DEFAULT_URL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?format=JSON"
    ALT_URL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?format=JSON"
    
    url = DEFAULT_URL
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        if arg == "alt":
            url = ALT_URL
        elif arg.startswith("http"):
            url = sys.argv[1]
        else:
            print("[!] Unknown argument. Use 'alt' or a valid CWA REST URL.")
            sys.exit(1)
            
    fetch_and_save_raw(url)

if __name__ == "__main__":
    main()
