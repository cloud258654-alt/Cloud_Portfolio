# Data Flow

This document details the flow of data within the **AI Reputation Risk Detection Platform** from data ingestion to user presentation.

## Keyword Crawling and Processing Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Admin User
    participant Web as Dashboard UI
    participant API as FastAPI Backend
    participant CS as Crawler Service
    participant Conn as Platform Connector
    participant AI as AI Sentiment Service
    participant DB as SQLite Database
    participant Alert as Alert Service

    User->>Web: Click "Trigger Crawl"
    Web->>API: POST /api/v1/crawler/run
    API-->>Web: Return 200 OK (Queued)
    
    rect rgb(240, 248, 255)
        note right of API: Asynchronous Background Execution
        API->>CS: crawl_all_keywords()
        loop For Each Active Keyword
            loop For Each Platform (PTT, Dcard, Google Search)
                CS->>Conn: fetch_mentions(keyword)
                Conn-->>CS: Return Raw Mentions List
                
                loop For Each Mention
                    CS->>AI: analyze_sentiment(content)
                    AI-->>CS: Return Sentiment & Score
                    CS->>DB: Save Mention Record
                    CS->>Alert: check_and_send_alerts(mention)
                    alt Sentiment is Negative
                        Alert->>Alert: Log Alert / Print Console Message
                    end
                end
            end
        end
    end
```

## CSV Offline File Importer Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Admin User
    participant Web as Dashboard UI
    participant API as FastAPI Backend
    participant Importer as CSV Importer
    participant CS as Crawler Service
    participant DB as SQLite Database

    User->>Web: Upload/Import CSV Path
    Web->>API: POST /api/v1/crawler/import-csv/mentions?file_path=...
    API->>Importer: import_mentions(file_path)
    Importer-->>API: Return parsed items list
    API->>CS: import_external_csv(parsed_items)
    loop For Each Item
        CS->>DB: Check duplicates & Save Mention
    end
    CS-->>API: Return imported count
    API-->>Web: Return 200 OK with import count
```
