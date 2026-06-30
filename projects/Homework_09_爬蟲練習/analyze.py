import json
import re
import sys
import io
import sqlite3
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# ============================================================
# 載入資料
# ============================================================
with open("movies.json", "r", encoding="utf-8") as f:
    movies = json.load(f)

scores = [float(m["score"]) for m in movies]
countries_all = [m["country"] for m in movies]
durations_str = [m["duration"] for m in movies]
release_dates = [m["release_date"] for m in movies]
all_cats = []
for m in movies:
    all_cats.extend(m.get("categories", []))

# ============================================================
# 1. 評分分析
# ============================================================
print("=" * 60)
print("【1】評分分析")
print("=" * 60)
print(f"  總電影數: {len(scores)}")
print(f"  最高分: {max(scores)}")
print(f"  最低分: {min(scores)}")
print(f"  平均分: {sum(scores)/len(scores):.2f}")
print(f"  中位數: {sorted(scores)[len(scores)//2]}")

buckets = {"9.5": 0, "9.0~9.4": 0, "8.5~8.9": 0}
for s in scores:
    if s >= 9.5:     buckets["9.5"] += 1
    elif s >= 9.0:   buckets["9.0~9.4"] += 1
    else:            buckets["8.5~8.9"] += 1
print(f"  分數分布:")
for k, v in buckets.items():
    bar = "█" * v
    print(f"    {k:<8}  {v:>3} 部  {bar}")

# ============================================================
# 2. 國家分析
# ============================================================
print("\n" + "=" * 60)
print("【2】國家 / 地區分析")
print("=" * 60)

# 拆分複合國家（如 "美國、英國"）
country_parts = []
for c in countries_all:
    for p in c.split("、"):
        p = p.strip()
        if p:
            country_parts.append(p)
country_counter = Counter(country_parts)
print(f"  參與國家/地區數: {len(country_counter)}")
print(f"  前 10 名:")
for c, n in country_counter.most_common(10):
    print(f"    {c:<12} {n:>3} 部")

# 單一國家 vs 合拍
solo = sum(1 for c in countries_all if "、" not in c)
multi = len(countries_all) - solo
print(f"\n  單一國家出品: {solo} 部")
print(f"  跨國合拍:     {multi} 部")

# ============================================================
# 3. 類別分析
# ============================================================
print("\n" + "=" * 60)
print("【3】類別分析")
print("=" * 60)
cat_counter = Counter(all_cats)
print(f"  類別總數: {len(cat_counter)}")
print(f"  類別分布:")
for c, n in cat_counter.most_common():
    bar = "█" * (n // 2)
    print(f"    {c:<8}  {n:>3} 部  {bar}")

# 每部電影平均類別數
avg_cats = sum(len(m.get("categories", [])) for m in movies) / len(movies)
print(f"\n  每部電影平均類別數: {avg_cats:.1f}")

# 最常見的類別組合 Top 5
combo_counter = Counter()
for m in movies:
    combo = " + ".join(sorted(m.get("categories", [])))
    combo_counter[combo] += 1
print(f"  熱門類別組合 Top 5:")
for combo, n in combo_counter.most_common(5):
    print(f"    {combo:<30} {n:>2} 部")

# ============================================================
# 4. 片長分析
# ============================================================
print("\n" + "=" * 60)
print("【4】片長分析")
print("=" * 60)
durations_min = []
for d in durations_str:
    m = re.search(r"(\d+)", d)
    if m:
        durations_min.append(int(m.group(1)))

if durations_min:
    print(f"  最短: {min(durations_min)} 分鐘")
    print(f"  最長: {max(durations_min)} 分鐘")
    print(f"  平均: {sum(durations_min)/len(durations_min):.0f} 分鐘")
    print(f"  中位數: {sorted(durations_min)[len(durations_min)//2]} 分鐘")

    short = sum(1 for d in durations_min if d < 90)
    mid = sum(1 for d in durations_min if 90 <= d <= 150)
    long = sum(1 for d in durations_min if d > 150)
    print(f"  短片 (<90min):   {short} 部")
    print(f"  中片 (90~150min): {mid} 部")
    print(f"  長片 (>150min):   {long} 部")

    # 最長的 5 部
    top5_long = sorted(
        zip(movies, durations_min),
        key=lambda x: -x[1]
    )[:5]
    print(f"\n  片長 Top 5:")
    for m, d in top5_long:
        print(f"    {d:>3}min  {m['name_cn']} ({m['name_en']})")

# ============================================================
# 5. 年代分析
# ============================================================
print("\n" + "=" * 60)
print("【5】發行年代分析")
print("=" * 60)
years = []
for rd in release_dates:
    m = re.search(r"(\d{4})", rd)
    if m:
        years.append(int(m.group(1)))

if years:
    print(f"  最早: {min(years)} 年")
    print(f"  最晚: {max(years)} 年")
    print(f"  時間跨度: {max(years) - min(years)} 年")

    decade_counter = Counter()
    for y in years:
        decade = (y // 10) * 10
        decade_counter[f"{decade}s"] += 1
    print(f"\n  年代分布:")
    for d in sorted(decade_counter.keys()):
        n = decade_counter[d]
        bar = "█" * (n // 2)
        print(f"    {d:<6}  {n:>3} 部  {bar}")

    pre_2000 = sum(1 for y in years if y < 2000)
    post_2000 = sum(1 for y in years if y >= 2000)
    print(f"\n  2000 年以前: {pre_2000} 部")
    print(f"  2000 年以後: {post_2000} 部")

# ============================================================
# 6. 綜合排行榜
# ============================================================
print("\n" + "=" * 60)
print("【6】綜合排行榜")
print("=" * 60)

# 類別最多的電影
max_cat = max(movies, key=lambda m: len(m.get("categories", [])))
print(f"  類別最多: {max_cat['name_cn']} ({len(max_cat['categories'])} 個 — {', '.join(max_cat['categories'])})")

# 最多國家合拍
max_country = max(movies, key=lambda m: len(m["country"].split("、")))
print(f"  最多國合拍: {max_country['name_cn']} ({max_country['country']})")

# 各年份最高分
year_best = {}
for m, y in zip(movies, years):
    s = float(m["score"])
    if y not in year_best or s > year_best[y][0]:
        year_best[y] = (s, m)
print(f"\n  各年代最高分代表:")
for y in sorted(year_best.keys()):
    s, m = year_best[y]
    print(f"    {y}: {m['name_cn']} ({s}分)")

print()
