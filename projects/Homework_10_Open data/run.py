#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run.py
------
Orchestrates the weather data ingestion pipeline by calling:
  1. fetch_raw.py: Downloads the CWA JSON to weather_raw.json
  2. fetch_and_convert.py: Cleans, flattens to weather.csv, and loads into weather.db
  3. verify_db.py: Asserts database contents and prints verification logs.
"""

import sys
import time
import argparse
import fetch_raw
import fetch_and_convert
import verify_db

def run_pipeline(url):
    print("======================================================================")
    print("                STARTING CWA WEATHER INGESTION PIPELINE               ")
    print("======================================================================")
    
    # Step 1: Fetch raw data
    print("[1/3] Fetching Raw JSON...")
    fetch_raw.fetch_and_save_raw(url, "weather_raw.json")
    
    # Step 2: Convert to CSV and SQLite
    print("\n[2/3] Cleaning and Ingesting Weather Data...")
    fetch_and_convert.convert_raw_json("weather_raw.json", "weather.csv", "weather.db")
    
    # Step 3: Verify Database Ingestion
    print("\n[3/3] Running Database Ingestion Verifier...")
    verify_db.verify_database("weather.db", "weather")
    
    print("======================================================================")
    print("                       PIPELINE RUN COMPLETED                         ")
    print("======================================================================")

def main():
    parser = argparse.ArgumentParser(description="CWA Weather Ingestion Pipeline")
    parser.add_argument("endpoint", nargs="?", default="default", help="Data endpoint: 'default', 'alt', or a direct URL")
    parser.add_argument("--loop", type=int, help="Run continuously in a loop with the specified interval in minutes")
    
    args = parser.parse_args()
    
    DEFAULT_URL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?format=JSON"
    ALT_URL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?format=JSON"
    
    url = DEFAULT_URL
    if args.endpoint.lower() == "alt":
        url = ALT_URL
    elif args.endpoint.startswith("http"):
        url = args.endpoint
        
    if args.loop:
        print(f"[*] Starting pipeline daemon mode. Running every {args.loop} minutes. Press CTRL+C to stop.")
        try:
            while True:
                run_pipeline(url)
                print(f"\n[*] Pipeline execution finished. Next update in {args.loop} minute(s).")
                print(f"[*] Sleeping for {args.loop} minute(s)... (Press CTRL+C to quit)\n")
                time.sleep(args.loop * 60)
        except KeyboardInterrupt:
            print("\n[*] Pipeline daemon stopped by user.")
    else:
        run_pipeline(url)

if __name__ == "__main__":
    main()
