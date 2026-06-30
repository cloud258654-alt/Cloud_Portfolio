import sqlite3
import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv()
# 同時也讀取 123.env（若存在）
if os.path.exists("123.env"):
    load_dotenv("123.env", override=True)

app = FastAPI(title="電影資料庫 API", version="1.0")

DB = "movies.db"
POSTER_DIR = "posters"

# Gemini API Key（放在 .env 檔案中）
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# 掛載海報靜態目錄
if os.path.isdir(POSTER_DIR):
    app.mount("/posters", StaticFiles(directory=POSTER_DIR), name="posters")


def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def build_index():
    """將 JSON 資料注入 HTML 模板"""
    with open("movies.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    poster_map = {}
    if os.path.isdir(POSTER_DIR):
        for fname in os.listdir(POSTER_DIR):
            try:
                fid = int(fname[:3])
                poster_map[fid] = fname
            except ValueError:
                pass

    movies = []
    for m in data:
        mid = int(m["id"])
        cats = m.get("categories", "")
        if isinstance(cats, list):
            cats = "、".join(cats)
        movies.append({
            "id": mid,
            "name_cn": m["name_cn"],
            "name_en": m["name_en"],
            "categories": cats,
            "country": m["country"],
            "duration": m["duration"],
            "release_date": m["release_date"],
            "score": float(m["score"]),
            "cover_url": m["cover_url"],
            "detail_url": m["detail_url"],
            "poster_file": poster_map.get(mid, ""),
        })

    with open("template.html", "r", encoding="utf-8") as f:
        template = f.read()
    return template.replace("{{DATA}}", json.dumps(movies, ensure_ascii=False))


@app.get("/", response_class=HTMLResponse)
def root():
    return build_index()


@app.get("/movies")
def list_movies(
    q: str = Query(None, description="搜尋關鍵字（比對中英文片名）"),
    category: str = Query(None, description="篩選類別"),
    country: str = Query(None, description="篩選國家"),
    sort: str = Query("id", description="排序欄位: id / score / name_cn / release_date"),
    order: str = Query("asc", description="asc / desc"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    conn = get_db()
    allowed_sort = {"id", "score", "name_cn", "release_date"}
    if sort not in allowed_sort:
        sort = "id"
    o = "DESC" if order.lower() == "desc" else "ASC"

    where = []
    params = []

    if q:
        where.append("(name_cn LIKE ? OR name_en LIKE ?)")
        params.extend([f"%{q}%", f"%{q}%"])
    if category:
        where.append("categories LIKE ?")
        params.append(f"%{category}%")
    if country:
        where.append("country LIKE ?")
        params.append(f"%{country}%")

    where_clause = ("WHERE " + " AND ".join(where)) if where else ""

    # 總數
    count_sql = f"SELECT COUNT(*) FROM movies {where_clause}"
    total = conn.execute(count_sql, params).fetchone()[0]

    # 分頁
    offset = (page - 1) * size
    data_sql = f"SELECT * FROM movies {where_clause} ORDER BY {sort} {o} LIMIT ? OFFSET ?"
    rows = conn.execute(data_sql, params + [size, offset]).fetchall()

    conn.close()
    return {
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size if total else 0,
        "data": [dict(r) for r in rows],
    }


@app.get("/movies/{movie_id}")
def get_movie(movie_id: int):
    conn = get_db()
    row = conn.execute("SELECT * FROM movies WHERE id = ?", (movie_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="找不到此電影")
    return dict(row)


@app.get("/categories")
def list_categories():
    conn = get_db()
    rows = conn.execute(
        "SELECT c.name, COUNT(mc.movie_id) AS cnt "
        "FROM categories c "
        "LEFT JOIN movie_category mc ON c.id = mc.category_id "
        "GROUP BY c.id "
        "ORDER BY cnt DESC"
    ).fetchall()
    conn.close()
    return [{"name": r["name"], "count": r["cnt"]} for r in rows]


@app.get("/stats")
def stats():
    conn = get_db()
    row = conn.execute(
        "SELECT COUNT(*) AS total, AVG(score) AS avg_score, "
        "MIN(score) AS min_score, MAX(score) AS max_score FROM movies"
    ).fetchone()
    top = conn.execute(
        "SELECT id, name_cn, name_en, score, poster_file FROM movies ORDER BY score DESC LIMIT 5"
    ).fetchall()
    conn.close()
    return {
        "total": row["total"],
        "avg_score": round(row["avg_score"], 2),
        "min_score": row["min_score"],
        "max_score": row["max_score"],
        "top5": [dict(r) for r in top],
    }


class ChatRequest(BaseModel):
    message: str
    api_key: str = ""


@app.post("/chat")
def chat(req: ChatRequest):
    """使用 Gemini 回答電影問題（支援用戶自帶 API Key）"""
    key = req.api_key or GEMINI_API_KEY
    if not key:
        raise HTTPException(status_code=503, detail="尚未設定 GEMINI_API_KEY")

    from google import genai

    client = genai.Client(api_key=key)

    with open("movies.json", "r", encoding="utf-8") as f:
        movies = json.load(f)

    # 只傳送相關電影摘要，減少 token 消耗
    total = len(movies)
    scores = [float(m["score"]) for m in movies]
    cats_count = {}
    country_count = {}
    top5 = sorted(movies, key=lambda m: float(m["score"]), reverse=True)[:5]
    top5_str = "\n".join(
        f"{m['id']}.{m['name_cn']}({m['name_en']}) {m['score']}分"
        for m in top5
    )
    for m in movies:
        c = m.get("categories", [])
        clist = c if isinstance(c, list) else c.split("、")
        for cat in clist:
            cats_count[cat] = cats_count.get(cat, 0) + 1
        for p in m["country"].split("、"):
            p = p.strip()
            if p:
                country_count[p] = country_count.get(p, 0) + 1

    # 傳送給 Gemini 的精簡摘要
    context = f"""電影資料庫摘要（共 {total} 部）：

評分: 最高 {max(scores)} / 最低 {min(scores)} / 平均 {sum(scores)/len(scores):.1f}

TOP 5:
{top5_str}

類別 TOP 10: {", ".join(f"{k}({v})" for k,v in sorted(cats_count.items(), key=lambda x:-x[1])[:10])}

國家 TOP 10: {", ".join(f"{k}({v})" for k,v in sorted(country_count.items(), key=lambda x:-x[1])[:10])}

完整電影清單請參考頁面上的卡片網格。"""

    prompt = f"""你是電影資料庫助手。以下是你知道的電影資料。用繁體中文簡潔回答，50字以內。

{context}

問題：{req.message}"""

    try:
        resp = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        return {"reply": resp.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("\n  電影資料庫 API 啟動中...")
    print("  網頁介面:     http://localhost:5173/")
    print("  Swagger 文件: http://localhost:5173/docs")
    uvicorn.run(app, host="0.0.0.0", port=5173)
