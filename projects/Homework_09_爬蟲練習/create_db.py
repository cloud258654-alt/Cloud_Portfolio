import json
import sqlite3
import os
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

DB_NAME = "movies.db"
JSON_FILE = "movies.json"

with open(JSON_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

# 掃描 posters 建立 ID -> 檔名對照
poster_map = {}
if os.path.isdir("posters"):
    for fname in os.listdir("posters"):
        try:
            fid = int(fname[:3])
            poster_map[fid] = fname
        except ValueError:
            pass

conn = sqlite3.connect(DB_NAME)
cursor = conn.cursor()

# 建立電影主表
cursor.execute("""
CREATE TABLE IF NOT EXISTS movies (
    id          INTEGER PRIMARY KEY,
    name_cn     TEXT    NOT NULL,
    name_en     TEXT,
    categories  TEXT,
    country     TEXT,
    duration    TEXT,
    release_date TEXT,
    score       REAL,
    cover_url   TEXT,
    detail_url  TEXT,
    poster_file TEXT
)
""")

# 建立類別表（正規化）
cursor.execute("""
CREATE TABLE IF NOT EXISTS categories (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT UNIQUE NOT NULL
)
""")

# 建立電影-類別關聯表（多對多）
cursor.execute("""
CREATE TABLE IF NOT EXISTS movie_category (
    movie_id    INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (movie_id, category_id),
    FOREIGN KEY (movie_id)  REFERENCES movies(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
)
""")

# 清空舊資料
cursor.execute("DELETE FROM movie_category")
cursor.execute("DELETE FROM categories")
cursor.execute("DELETE FROM movies")

# 插入資料
inserted = 0
for m in data:
    mid = int(m["id"])
    cats = m.get("categories", [])
    cats_str = "、".join(cats)

    cursor.execute("""
        INSERT OR REPLACE INTO movies (id, name_cn, name_en, categories, country,
                                       duration, release_date, score, cover_url,
                                       detail_url, poster_file)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        mid,
        m.get("name_cn", ""),
        m.get("name_en", ""),
        cats_str,
        m.get("country", ""),
        m.get("duration", ""),
        m.get("release_date", ""),
        float(m.get("score", 0)),
        m.get("cover_url", ""),
        m.get("detail_url", ""),
        poster_map.get(mid, ""),
    ))

    # 插入類別與關聯
    for cat in cats:
        cursor.execute("INSERT OR IGNORE INTO categories (name) VALUES (?)", (cat,))
        cursor.execute("SELECT id FROM categories WHERE name = ?", (cat,))
        cat_id = cursor.fetchone()[0]
        cursor.execute("INSERT OR IGNORE INTO movie_category (movie_id, category_id) VALUES (?, ?)", (mid, cat_id))

    inserted += 1

conn.commit()

# 新增 view: 電影完整資訊
cursor.execute("""
CREATE VIEW IF NOT EXISTS v_movie_full AS
SELECT
    m.id,
    m.name_cn,
    m.name_en,
    m.categories,
    m.country,
    m.duration,
    m.release_date,
    m.score,
    m.cover_url,
    m.detail_url,
    m.poster_file,
    GROUP_CONCAT(c.name, '、') AS category_list
FROM movies m
LEFT JOIN movie_category mc ON m.id = mc.movie_id
LEFT JOIN categories c ON mc.category_id = c.id
GROUP BY m.id
""")

conn.commit()

# 顯示統計
cursor.execute("SELECT COUNT(*) FROM movies")
total = cursor.fetchone()[0]
cursor.execute("SELECT COUNT(*) FROM categories")
cat_count = cursor.fetchone()[0]
cursor.execute("SELECT AVG(score), MIN(score), MAX(score) FROM movies")
avg_s, min_s, max_s = cursor.fetchone()

print(f">>> SQLite 資料庫已建立: {DB_NAME}")
print(f"    電影: {total} 筆")
print(f"    類別: {cat_count} 種")
print(f"    評分: {min_s} ~ {max_s} (平均 {avg_s:.2f})")

# 顯示前 5 筆驗證
print(f"\n前 5 筆資料驗證:")
cursor.execute("SELECT id, name_cn, score, poster_file FROM movies LIMIT 5")
for row in cursor.fetchall():
    print(f"    {row[0]:>3}  {row[1]:<16}  {row[2]:>4}分  {row[3] or '-'}")

conn.close()
