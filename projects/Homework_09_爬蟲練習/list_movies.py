import json
import sys
import io
import os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

with open("movies.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# 掃描 posters 資料夾建立 ID -> 檔名對照
poster_map = {}
if os.path.isdir("posters"):
    for fname in os.listdir("posters"):
        # 檔名格式: 001_電影名稱.jpg
        try:
            fid = int(fname[:3])
            poster_map[fid] = fname
        except ValueError:
            pass

print(f"{'ID':>3}  {'電影名稱':<16} {'英文名':<28} {'類別':<18} {'國家':<16} {'片長':<7} {'上映日期':<15} {'分':>3}  {'海報檔名'}")
print("-" * 160)

for m in data:
    mid = int(m["id"])
    cats = "、".join(m["categories"])
    poster = poster_map.get(mid, "-")
    name_en = m['name_en'][:27] + "…" if len(m['name_en']) > 28 else m['name_en']
    print(f"{m['id']:>3}  {m['name_cn']:<16} {name_en:<28} {cats:<18} {m['country']:<16} {m['duration']:<7} {m['release_date']:<15} {m['score']:>3}  {poster}")

