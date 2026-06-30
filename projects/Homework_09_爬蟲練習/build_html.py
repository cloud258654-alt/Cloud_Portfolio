import json
import os

with open("movies.json", "r", encoding="utf-8") as f:
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

html = template.replace("{{DATA}}", json.dumps(movies, ensure_ascii=False))

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print(f">>> index.html 已產生，內嵌 {len(movies)} 筆電影資料")
print(f">>> 其中 {len(poster_map)} 筆有本地海報")
