#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
backend/app.py
--------------
A simple Flask REST API that queries 'weather.db' and returns weather observation data.
Provides endpoints for the frontend weather visualization dashboard.
"""

import os
import sqlite3
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request

load_dotenv()

app = Flask(__name__)

# Locate the weather.db file in the parent directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "weather.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.after_request
def add_cors_headers(response):
    """Enable Cross-Origin Resource Sharing (CORS) manually for frontend access."""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route("/api/windy-forecast", methods=["POST"])
def get_windy_forecast():
    """Proxy request to Windy Point Forecast API to bypass CORS."""
    api_key = os.getenv("VITE_WINDY_API_KEY")
    if not api_key:
        return jsonify({"error": "VITE_WINDY_API_KEY not found in environment"}), 400
        
    try:
        req_data = request.get_json() or {}
        lat = req_data.get("lat")
        lon = req_data.get("lon")
        if lat is None or lon is None:
            return jsonify({"error": "Missing lat or lon parameter"}), 400
            
        payload = {
            "lat": float(lat),
            "lon": float(lon),
            "model": "gfs",
            "parameters": ["temp", "wind", "rh", "pressure", "precip", "lclouds"],
            "levels": ["surface"],
            "key": api_key
        }
        
        response = requests.post("https://api.windy.com/api/point-forecast/v2", json=payload, headers={"Content-Type": "application/json"})
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/weather", methods=["GET"])
def get_weather():
    """Fetches all weather observation records from the database."""
    if not os.path.exists(DB_PATH):
        return jsonify({"error": "weather.db database file not found. Please run run.py first."}), 404
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM weather")
        rows = cursor.fetchall()
        conn.close()
        
        records = [dict(row) for row in rows]
        return jsonify({
            "status": "success",
            "count": len(records),
            "data": records
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Returns summarized stats (hottest, wettest, windiest stations)."""
    if not os.path.exists(DB_PATH):
        return jsonify({"error": "weather.db database file not found."}), 404
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Max Temperature
        cursor.execute("SELECT station_id, station_name, air_temperature, county_name, town_name FROM weather WHERE air_temperature IS NOT NULL ORDER BY air_temperature DESC LIMIT 1")
        max_temp_row = cursor.fetchone()
        
        # Max Rain
        cursor.execute("SELECT station_id, station_name, precipitation, county_name, town_name FROM weather WHERE precipitation IS NOT NULL ORDER BY precipitation DESC LIMIT 1")
        max_rain_row = cursor.fetchone()
        
        # Max Wind Gust
        cursor.execute("SELECT station_id, station_name, peak_gust_speed, county_name, town_name FROM weather WHERE peak_gust_speed IS NOT NULL ORDER BY peak_gust_speed DESC LIMIT 1")
        max_gust_row = cursor.fetchone()
        
        conn.close()
        
        return jsonify({
            "status": "success",
            "stats": {
                "max_temperature": dict(max_temp_row) if max_temp_row else None,
                "max_precipitation": dict(max_rain_row) if max_rain_row else None,
                "max_gust": dict(max_gust_row) if max_gust_row else None
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/windy-webcams", methods=["POST"])
def get_windy_webcams():
    """Proxy request to Windy Webcams API to bypass CORS."""
    api_key = os.getenv("VITE_WINDY_WEBCAMS_API_KEY")
    if not api_key:
        return jsonify({"error": "VITE_WINDY_WEBCAMS_API_KEY not found in environment"}), 400
        
    try:
        req_data = request.get_json() or {}
        lat = req_data.get("lat")
        lon = req_data.get("lon")
        if lat is None or lon is None:
            return jsonify({"error": "Missing lat or lon parameter"}), 400
            
        radius = int(float(req_data.get("radius", 50)))
        limit = int(req_data.get("limit", 3))
        
        url = f"https://api.windy.com/webcams/api/v3/webcams?nearby={lat},{lon},{radius}&limit={limit}&include=location,images"
        headers = {
            "x-windy-api-key": api_key,
            "Content-Type": "application/json"
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print(f"[*] Starting Backend REST API Server...")
    print(f"[*] Database Path: {os.path.abspath(DB_PATH)}")
    app.run(host="127.0.0.1", port=5000, debug=True)
