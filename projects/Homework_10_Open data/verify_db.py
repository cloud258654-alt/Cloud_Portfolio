#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify_db.py
------------
Queries 'weather.db' to verify data integrity and displays a sample of records.
"""

import os
import sqlite3

def verify_database(db_filename="weather.db", table_name="weather"):
    print(f"[*] Verifying data in SQLite database '{db_filename}'...")
    if not os.path.exists(db_filename):
        print(f"[!] Database file '{db_filename}' not found.")
        return
        
    try:
        conn = sqlite3.connect(db_filename)
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
        if not cursor.fetchone():
            print(f"[!] Table '{table_name}' does not exist in the database.")
            conn.close()
            return
            
        # Row counts
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        total = cursor.fetchone()[0]
        
        cursor.execute(f"SELECT COUNT(*) FROM {table_name} WHERE air_temperature IS NOT NULL")
        with_temp = cursor.fetchone()[0]
        
        cursor.execute(f"SELECT COUNT(*) FROM {table_name} WHERE precipitation IS NOT NULL")
        with_precip = cursor.fetchone()[0]
        
        print(f"    - Total station records: {total}")
        print(f"    - Records with valid Temperature: {with_temp}")
        print(f"    - Records with valid Precipitation: {with_precip}")
        
        # Print sample records
        cursor.execute(f"SELECT station_id, station_name, obs_time, air_temperature, precipitation, county_name, town_name FROM {table_name} LIMIT 3")
        rows = cursor.fetchall()
        
        print("\n[*] Sample Records (First 3):")
        print("-" * 110)
        print(f"{'Station ID':<12} | {'Name':<15} | {'Observation Time':<25} | {'Temp (°C)':<10} | {'Rain (mm)':<10} | {'County':<15} | {'Town':<15}")
        print("-" * 110)
        for r in rows:
            sid, name, time, temp, precip, county, town = r
            sid_str = str(sid) if sid is not None else "N/A"
            name_str = str(name) if name is not None else "N/A"
            time_str = str(time) if time is not None else "N/A"
            temp_str = f"{temp:.1f}" if temp is not None else "N/A"
            precip_str = f"{precip:.1f}" if precip is not None else "N/A"
            county_str = str(county) if county is not None else "N/A"
            town_str = str(town) if town is not None else "N/A"
            print(f"{sid_str:<12} | {name_str:<15} | {time_str:<25} | {temp_str:<10} | {precip_str:<10} | {county_str:<15} | {town_str:<15}")
        print("-" * 110)
        
        conn.close()
    except Exception as e:
        print(f"[!] Database verification error: {e}")

def main():
    verify_database()

if __name__ == "__main__":
    main()
