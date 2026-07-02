# TODO：CWA Weather Data Visualization Design

## 1. Project Goal

Build a weather visualization dashboard using CWA weather data.

Main purpose:

- Use CWA as official weather data source
- Store cleaned weather data in Supabase
- Visualize temperature forecast and observation data
- Build Windy-style weather map experience
- Support future AI weather prediction

---

## 2. Architecture

```text
CWA OpenData
    ↓
Data Fetcher / ETL
    ↓
Data Cleaning
    ↓
Supabase Database
    ↓
Backend API
    ↓
Frontend Dashboard
    ↓
Map + Charts + AI Summary