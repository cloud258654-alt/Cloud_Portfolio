# API Specification

All APIs are prefixed with `/api/v1`.

---

## 1. Keywords Endpoints

### `GET /keywords`
- **Description**: List all configured keywords.
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 1,
      "text": "台積電",
      "active": true,
      "platforms": "PTT,Dcard,Google Search",
      "created_at": "2026-06-30T00:00:00.000000",
      "updated_at": "2026-06-30T00:00:00.000000"
    }
  ]
  ```

### `POST /keywords`
- **Description**: Add a new monitoring keyword.
- **Request Body**:
  ```json
  {
    "text": "ChatGPT",
    "active": true,
    "platforms": "PTT,Dcard,Google Search"
  }
  ```
- **Response `201 Created`**: Returns the created keyword object.

### `PUT /keywords/{keyword_id}`
- **Description**: Update an existing keyword configuration.
- **Request Body**:
  ```json
  {
    "active": false
  }
  ```
- **Response `200 OK`**: Returns updated keyword object.

### `DELETE /keywords/{keyword_id}`
- **Description**: Remove a keyword and its related mentions.
- **Response `204 No Content`**

---

## 2. Mentions Endpoints

### `GET /mentions`
- **Description**: Retrieve collected mentions with sorting and filters.
- **Query Parameters**:
  - `keyword_id` (int, optional)
  - `platform` (str, optional)
  - `sentiment` (str, optional: Positive/Neutral/Negative)
  - `limit` (int, default 100)
  - `skip` (int, default 0)
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 12,
      "keyword_id": 1,
      "platform": "PTT",
      "title": "[問卦] 大家對 台積電 有什麼看法？",
      "content": "最近看到大家一直在討論 台積電...",
      "url": "https://www.ptt.cc/bbs/Gossiping/M.123456789.html",
      "author": "xiaoming",
      "published_at": "2026-06-29T18:30:00",
      "sentiment": "Neutral",
      "sentiment_score": 0.1,
      "raw_data": "{}",
      "created_at": "2026-06-30T00:05:00"
    }
  ]
  ```

---

## 3. Crawler Engine Endpoints

### `POST /crawler/run`
- **Description**: Trigger crawlers in the background for all active keywords.
- **Response `200 OK`**:
  ```json
  {
    "message": "Crawling triggered in background for all active keywords."
  }
  ```

### `POST /crawler/run/{keyword_id}`
- **Description**: Run crawlers for a specific keyword.
- **Response `200 OK`**:
  ```json
  {
    "message": "Crawling triggered in background for keyword '台積電'..."
  }
  ```

### `GET /crawler/logs`
- **Description**: View recent crawling history log.
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 45,
      "keyword_id": 1,
      "platform": "PTT",
      "status": "Success",
      "items_count": 5,
      "error_message": null,
      "started_at": "2026-06-30T00:01:00",
      "finished_at": "2026-06-30T00:01:02"
    }
  ]
  ```

### `POST /crawler/import-csv/mentions`
- **Description**: Import mentions from local CSV.
- **Query Params**: `file_path` (e.g. `../sample_data/mentions_sample.csv`)

### `POST /crawler/import-csv/google-reviews`
- **Description**: Import reviews from Google Map reviews CSV.
- **Query Params**: `file_path` (e.g. `../sample_data/google_reviews_sample.csv`)

---

## 4. Dashboard Stats Endpoints

### `GET /dashboard/summary`
- **Description**: Returns quick stats and chart data.
- **Response `200 OK`**:
  ```json
  {
    "total_keywords": 4,
    "total_mentions": 142,
    "platform_breakdown": {
      "PTT": 68,
      "Dcard": 44,
      "Google Search": 30
    },
    "sentiment_breakdown": {
      "Positive": 50,
      "Neutral": 62,
      "Negative": 30
    },
    "keyword_breakdown": {
      "台積電": 80,
      "ChatGPT": 62
    },
    "trend": [
      { "date": "2026-06-24", "count": 12 },
      { "date": "2026-06-25", "count": 15 },
      { "date": "2026-06-26", "count": 22 },
      { "date": "2026-06-27", "count": 18 },
      { "date": "2026-06-28", "count": 25 },
      { "date": "2026-06-29", "count": 30 },
      { "date": "2026-06-30", "count": 20 }
    ]
  }
  ```
