#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fetch_and_convert.py
--------------------
Reads the raw weather JSON from 'weather_raw.json', cleans and flattens the records,
saves them to 'weather.csv', and converts/loads the CSV data into 'weather.db' (SQLite).
"""

import os
import sys
import json
import csv
import sqlite3

def get_nested(d, *keys):
    """Safely retrieves a value from a nested dictionary."""
    for key in keys:
        if isinstance(d, dict):
            d = d.get(key)
        else:
            return None
    return d

def safe_float(val):
    """Converts a value to float, treating CWA missing value codes as None."""
    if val is None:
        return None
    val_str = str(val).strip()
    missing_codes = {
        "", "-99", "-99.0", "-999", "-999.0", "-9999", "-9999.0",
        "-9991", "-9992", "-9995", "-9996", "-9997", "-9998", "None"
    }
    if val_str in missing_codes:
        return None
    try:
        return float(val_str)
    except ValueError:
        return None

def safe_str(val):
    """Clean string values, treating CWA missing value codes as None."""
    if val is None:
        return None
    val_str = str(val).strip()
    missing_codes = {
        "", "-99", "-99.0", "-999", "-999.0", "-9999", "-9999.0",
        "-9991", "-9992", "-9995", "-9996", "-9997", "-9998", "None"
    }
    if val_str in missing_codes:
        return None
    return val_str

def parse_weather_data(json_data):
    """Parses CWA raw JSON station records into a flat dictionary list."""
    print("[*] Parsing cached raw weather data...")
    try:
        if 'records' in json_data and 'Station' in json_data['records']:
            stations = json_data['records']['Station']
        elif 'cwaopendata' in json_data and 'dataset' in json_data['cwaopendata'] and 'Station' in json_data['cwaopendata']['dataset']:
            stations = json_data['cwaopendata']['dataset']['Station']
        else:
            raise KeyError("Station data structure not found in JSON response")
    except Exception as e:
        print(f"[!] Invalid JSON structure: {e}")
        sys.exit(1)
        
    parsed_records = []
    
    for s in stations:
        geo_info = s.get("GeoInfo", {})
        coords = geo_info.get("Coordinates", [])
        
        lat_wgs84, lon_wgs84 = None, None
        lat_twd67, lon_twd67 = None, None
        
        for c in coords:
            name = c.get("CoordinateName")
            lat = safe_float(c.get("StationLatitude"))
            lon = safe_float(c.get("StationLongitude"))
            if name == "WGS84":
                lat_wgs84, lon_wgs84 = lat, lon
            elif name == "TWD67":
                lat_twd67, lon_twd67 = lat, lon
                
        we = s.get("WeatherElement", {})
        
        record = {
            "station_id": safe_str(s.get("StationId")),
            "station_name": safe_str(s.get("StationName")),
            "obs_time": safe_str(get_nested(s, "ObsTime", "DateTime")),
            
            "latitude_wgs84": lat_wgs84,
            "longitude_wgs84": lon_wgs84,
            "latitude_twd67": lat_twd67,
            "longitude_twd67": lon_twd67,
            "altitude": safe_float(geo_info.get("StationAltitude")),
            
            "county_name": safe_str(geo_info.get("CountyName")),
            "town_name": safe_str(geo_info.get("TownName")),
            "county_code": safe_str(geo_info.get("CountyCode")),
            "town_code": safe_str(geo_info.get("TownCode")),
            
            "weather": safe_str(we.get("Weather")),
            "visibility_description": safe_str(we.get("VisibilityDescription")),
            "sunshine_duration": safe_float(we.get("SunshineDuration")),
            "precipitation": safe_float(get_nested(we, "Now", "Precipitation")),
            
            "wind_direction": safe_float(we.get("WindDirection")),
            "wind_speed": safe_float(we.get("WindSpeed")),
            "air_temperature": safe_float(we.get("AirTemperature")),
            "relative_humidity": safe_float(we.get("RelativeHumidity")),
            "air_pressure": safe_float(we.get("AirPressure")),
            "uv_index": safe_float(we.get("UVIndex")),
            
            "max_10min_wind_speed": safe_float(get_nested(we, "Max10MinAverage", "WindSpeed")),
            "max_10min_wind_direction": safe_float(get_nested(we, "Max10MinAverage", "Occurred_at", "WindDirection")),
            "max_10min_wind_time": safe_str(get_nested(we, "Max10MinAverage", "Occurred_at", "DateTime")),
            
            "peak_gust_speed": safe_float(get_nested(we, "GustInfo", "PeakGustSpeed")),
            "peak_gust_wind_direction": safe_float(get_nested(we, "GustInfo", "Occurred_at", "WindDirection")),
            "peak_gust_time": safe_str(get_nested(we, "GustInfo", "Occurred_at", "DateTime")),
            
            "daily_high_temperature": safe_float(get_nested(we, "DailyExtreme", "DailyHigh", "TemperatureInfo", "AirTemperature")),
            "daily_high_temperature_time": safe_str(get_nested(we, "DailyExtreme", "DailyHigh", "TemperatureInfo", "Occurred_at", "DateTime")),
            "daily_low_temperature": safe_float(get_nested(we, "DailyExtreme", "DailyLow", "TemperatureInfo", "AirTemperature")),
            "daily_low_temperature_time": safe_str(get_nested(we, "DailyExtreme", "DailyLow", "TemperatureInfo", "Occurred_at", "DateTime"))
        }
        
        parsed_records.append(record)
        
    return parsed_records

def save_to_csv(records, filename):
    """Saves records to a CSV file using UTF-8 BOM encoding."""
    print(f"[*] Saving parsed records to CSV: {filename}...")
    if not records:
        print("[!] No records to save.")
        return
        
    headers = list(records[0].keys())
    try:
        with open(filename, mode='w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(records)
        print(f"[+] CSV file saved successfully. ({len(records)} records)")
    except Exception as e:
        print(f"[!] Error writing CSV: {e}")
        sys.exit(1)

def convert_csv_to_sqlite(csv_filename, db_filename, table_name="weather"):
    """Reads a CSV file and loads the data into a SQLite database."""
    print(f"[*] Loading CSV '{csv_filename}' into SQLite database '{db_filename}' (table: '{table_name}')...")
    
    if not os.path.exists(csv_filename):
        print(f"[!] CSV file {csv_filename} not found.")
        sys.exit(1)
        
    try:
        with open(csv_filename, mode='r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            headers = next(reader)
            rows = list(reader)
            
        conn = sqlite3.connect(db_filename)
        cursor = conn.cursor()
        
        # Drop table if exists to ensure fresh write
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        
        # Define table columns types
        columns_def = []
        for header in headers:
            if header == 'station_id':
                columns_def.append(f"{header} TEXT PRIMARY KEY")
            elif header in [
                'latitude_wgs84', 'longitude_wgs84', 'latitude_twd67', 'longitude_twd67',
                'altitude', 'sunshine_duration', 'precipitation', 'wind_direction', 'wind_speed',
                'air_temperature', 'relative_humidity', 'air_pressure', 'uv_index',
                'max_10min_wind_speed', 'max_10min_wind_direction', 'peak_gust_speed',
                'peak_gust_wind_direction', 'daily_high_temperature', 'daily_low_temperature'
            ]:
                columns_def.append(f"{header} REAL")
            else:
                columns_def.append(f"{header} TEXT")
                
        create_query = f"CREATE TABLE {table_name} ({', '.join(columns_def)})"
        cursor.execute(create_query)
        
        # Ingest data
        cleaned_rows = [[val if val != "" else None for val in r] for r in rows]
        placeholders = ", ".join(["?"] * len(headers))
        insert_query = f"INSERT INTO {table_name} ({', '.join(headers)}) VALUES ({placeholders})"
        
        cursor.executemany(insert_query, cleaned_rows)
        conn.commit()
        
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"[+] Loaded {count} rows into SQLite table '{table_name}'.")
        conn.close()
        
    except Exception as e:
        print(f"[!] SQLite Ingestion Error: {e}")
        sys.exit(1)

def convert_raw_json(input_json="weather_raw.json", output_csv="weather.csv", db_filename="weather.db"):
    if not os.path.exists(input_json):
        print(f"[!] Raw JSON file '{input_json}' not found. Run fetch_raw.py first.")
        sys.exit(1)
        
    with open(input_json, "r", encoding="utf-8") as f:
        json_data = json.load(f)
        
    records = parse_weather_data(json_data)
    save_to_csv(records, output_csv)
    convert_csv_to_sqlite(output_csv, db_filename)

def main():
    convert_raw_json()

if __name__ == "__main__":
    main()
