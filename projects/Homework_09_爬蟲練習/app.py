import streamlit as st
import json
import os
import base64
import re
from collections import Counter

# 固定路徑為本檔案所在目錄
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

st.set_page_config(
    page_title="電影資料庫 | Movie DB",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── 載入資料 ──
@st.cache_data
def load_data():
    with open(os.path.join(BASE_DIR, "movies.json"), "r", encoding="utf-8") as f:
        data = json.load(f)

    poster_map = {}
    poster_dir = os.path.join(BASE_DIR, "posters")
    if os.path.isdir(poster_dir):
        for fname in os.listdir(poster_dir):
            try:
                fid = int(fname[:3])
                poster_map[fid] = fname
            except ValueError:
                pass

    movies = []
    for m in data:
        mid = int(m["id"])
        cats = m.get("categories", [])
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
    return movies


def get_poster_path(m):
    if m["poster_file"]:
        path = os.path.join(BASE_DIR, "posters", m["poster_file"])
        if os.path.isfile(path):
            return path
    return None


movies = load_data()

# ── CSS 美化 ──
st.markdown("""
<style>
    .stApp { background: linear-gradient(180deg, #fffdf7 0%, #ffe8f0 50%, #e8f4ff 100%); }
    h1 { color: #ff6b9d !important; font-weight: 900 !important; }
    .movie-card { background: #fff; border: 3px solid #333; border-radius: 20px; padding: 12px;
                  box-shadow: 5px 5px 0 #333; transition: all .2s; cursor: pointer; margin-bottom: 10px; }
    .movie-card:hover { transform: translateY(-3px); box-shadow: 7px 7px 0 #ff6b9d; }
    .movie-title { font-weight: 700; color: #333; }
    .movie-en { font-size: .8rem; color: #999; }
    .score-badge { background: #ff6b9d; color: #fff; padding: 4px 12px; border-radius: 12px;
                   font-weight: 700; font-size: 1.2rem; display: inline-block; }
    .cat-tag { background: #ffe0e8; color: #ff6b9d; border: 2px solid #ff6b9d; padding: 2px 8px;
               border-radius: 10px; font-size: .7rem; font-weight: 600; margin: 2px; display: inline-block; }
    .stat-box { background: #fff; border: 3px solid #333; border-radius: 20px; padding: 16px;
                text-align: center; box-shadow: 4px 4px 0 #333; }
    .stat-num { font-size: 2rem; font-weight: 800; color: #ff6b9d; }
    .stat-label { font-size: .8rem; color: #888; font-weight: 600; }
    .chat-msg { padding: 12px 16px; border-radius: 16px; margin: 6px 0; }
    .chat-user { background: #fff0d5; border: 2px solid #333; text-align: right; }
    .chat-bot { background: #fff; border: 2px solid #ffd93d; }
</style>
""", unsafe_allow_html=True)

# ── 標題 ──
# ── 彩色標題 ──
colors = ["#ff6b9d","#ff8e6b","#ffd93d","#4ade80","#4dc9f6","#c44dff","#ff6b9d","#ff8e6b","#ffd93d","#4ade80","#4dc9f6","#c44dff"]
title_text = "Movie Database"
colored = "".join(f"<span style='color:{colors[i%len(colors)]}'>{c}</span>" for i, c in enumerate(title_text))
sub_text = "Scrape Center SSR1 — 100 部經典電影"
colored_sub = "".join(f"<span style='color:{colors[(i+3)%len(colors)]}'>{c}</span>" for i, c in enumerate(sub_text))

st.markdown(f"""
<div style='text-align:center;padding:20px 0'>
  <div style='font-size:4rem;font-weight:900;letter-spacing:6px;line-height:1.2;
              -webkit-text-stroke:3px #333;text-stroke:3px #333;
              text-shadow:5px 5px 0 rgba(0,0,0,.1)'>{colored}</div>
  <div style='font-size:1.2rem;font-weight:700;letter-spacing:2px;margin-top:8px;
              -webkit-text-stroke:1px #666;text-stroke:1px #666'>{colored_sub}</div>
</div>
""", unsafe_allow_html=True)

# ── 統計列 ──
scores = [m["score"] for m in movies]
all_cats = set()
all_countries = set()
for m in movies:
    for c in m["categories"].split("、"):
        if c:
            all_cats.add(c)
    for c in m["country"].split("、"):
        if c.strip():
            all_countries.add(c.strip())

c1, c2, c3, c4 = st.columns(4)
with c1:
    st.markdown(f"<div class='stat-box'><div class='stat-num'>{len(movies)}</div><div class='stat-label'>總電影數</div></div>", unsafe_allow_html=True)
with c2:
    st.markdown(f"<div class='stat-box'><div class='stat-num'>{sum(scores)/len(scores):.1f}</div><div class='stat-label'>平均評分</div></div>", unsafe_allow_html=True)
with c3:
    st.markdown(f"<div class='stat-box'><div class='stat-num'>{len(all_cats)}</div><div class='stat-label'>類別數</div></div>", unsafe_allow_html=True)
with c4:
    st.markdown(f"<div class='stat-box'><div class='stat-num'>{len(all_countries)}</div><div class='stat-label'>國家/地區</div></div>", unsafe_allow_html=True)

st.markdown("---")

# ── Tab 切換 ──
tab1, tab2, tab3, tab4 = st.tabs(["🎞️ 電影列表", "📊 數據分析", "💬 AI 聊天", "📋 原始資料"])

# ── Tab 1: 電影列表 ──
with tab1:
    col1, col2, col3, col4 = st.columns([2, 1, 1, 1])
    with col1:
        search = st.text_input("🔍 搜尋", placeholder="輸入電影名稱...", key="search")
    with col2:
        cat_filter = st.selectbox("類別", ["全部"] + sorted(all_cats), key="cat_filter")
    with col3:
        country_filter = st.selectbox("國家", ["全部"] + sorted(all_countries), key="country_filter")
    with col4:
        sort_by = st.selectbox("排序", ["預設", "評分高→低", "評分低→高", "名稱A→Z"], key="sort_by")

    filtered = movies.copy()
    if search:
        s = search.lower()
        filtered = [m for m in filtered if s in m["name_cn"].lower() or s in m["name_en"].lower()]
    if cat_filter != "全部":
        filtered = [m for m in filtered if cat_filter in m["categories"]]
    if country_filter != "全部":
        filtered = [m for m in filtered if country_filter in m["country"]]

    if sort_by == "評分高→低":
        filtered.sort(key=lambda x: -x["score"])
    elif sort_by == "評分低→高":
        filtered.sort(key=lambda x: x["score"])
    elif sort_by == "名稱A→Z":
        filtered.sort(key=lambda x: x["name_en"])
    else:
        filtered.sort(key=lambda x: x["id"])

    st.caption(f"顯示 {len(filtered)} / {len(movies)} 部電影")

    # 卡片網格（海報 + 資訊合併為單一點擊區塊）
    cols = st.columns(5)
    for i, m in enumerate(filtered[:50]):
        with cols[i % 5]:
            poster = get_poster_path(m)
            if poster:
                with open(poster, "rb") as pf:
                    img_b64 = base64.b64encode(pf.read()).decode()
                    img_src = f"data:image/jpeg;base64,{img_b64}"
            else:
                img_src = m["cover_url"]

            cats_html = " ".join(
                f"<span class='cat-tag'>{c}</span>"
                for c in m["categories"].split("、") if c
            )
            st.markdown(f"""
            <div class='movie-card' onclick="window.open('{m.get("detail_url","#")}','_blank')">
                <img src="{img_src}" style="width:100%;aspect-ratio:2/3;object-fit:cover;border-radius:16px 16px 0 0;display:block;cursor:pointer" alt="{m['name_cn']}">
                <div style="padding:12px;cursor:pointer">
                    <div class='movie-title'>{m['name_cn']}</div>
                    <div class='movie-en'>{m['name_en']}</div>
                    <div>{cats_html}</div>
                    <div style='font-size:.75rem;color:#aaa;margin:6px 0'>{m['duration']} | {m.get('release_date') or '-'}</div>
                    <div style='display:flex;justify-content:space-between;align-items:center;margin-top:6px'>
                        <span class='score-badge'>{m['score']}</span>
                        <span style='font-size:.7rem;color:#aaa'>{m['country']}</span>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)

    if len(filtered) > 50:
        st.info(f"僅顯示前 50 筆（共 {len(filtered)} 筆），請縮小搜尋範圍")

# ── Tab 2: 數據分析 ──
with tab2:
    col_a, col_b = st.columns(2)

    with col_a:
        st.subheader("🏆 評分分布")
        score_buckets = {"9.5": 0, "9.0-9.4": 0, "8.5-8.9": 0}
        for s in scores:
            if s >= 9.5: score_buckets["9.5"] += 1
            elif s >= 9.0: score_buckets["9.0-9.4"] += 1
            else: score_buckets["8.5-8.9"] += 1
        st.bar_chart(score_buckets, horizontal=True)

        st.subheader("📂 類別分布")
        cat_counts = Counter()
        for m in movies:
            for c in m["categories"].split("、"):
                if c: cat_counts[c] += 1
        st.bar_chart(dict(cat_counts.most_common(10)), horizontal=True)

    with col_b:
        st.subheader("🌍 國家分布 Top 10")
        ctry_counts = Counter()
        for m in movies:
            for c in m["country"].split("、"):
                c = c.strip()
                if c: ctry_counts[c] += 1
        st.bar_chart(dict(ctry_counts.most_common(10)), horizontal=True)

        st.subheader("📅 年代分布")
        from collections import defaultdict
        decades = defaultdict(int)
        for m in movies:
            import re
            match = re.search(r"(\d{4})", m.get("release_date", ""))
            if match:
                y = int(match.group(1))
                decades[f"{(y//10)*10}s"] += 1
        st.bar_chart(dict(sorted(decades.items())), horizontal=True)

    st.subheader("⭐ 評分 Top 10")
    top10 = sorted(movies, key=lambda x: -x["score"])[:10]
    for i, m in enumerate(top10, 1):
        st.markdown(f"{i}. **{m['name_cn']}** ({m['name_en']}) — <span style='color:#ff6b9d;font-weight:700'>{m['score']}</span> | {m['country']}", unsafe_allow_html=True)

# ── Tab 3: AI 聊天 ──
with tab3:
    st.subheader("💬 電影小幫手")

    # 初始化聊天歷史
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []

    # API Key 輸入
    api_key = st.text_input("Gemini API Key（可選）", type="password",
                            value=st.session_state.get("gemini_key", ""),
                            placeholder="貼上 Key 即可啟用 LLM...",
                            help="到 https://aistudio.google.com/apikey 免費申請")
    if api_key:
        st.session_state["gemini_key"] = api_key

    # 快捷鍵
    quicks = ["🏆 評分最高", "🎨 動畫電影", "🗾 日本電影", "📊 統計", "⏱ 片長最長"]
    qcols = st.columns(len(quicks))
    for j, q in enumerate(quicks):
        with qcols[j]:
            if st.button(q, width="stretch", key=f"q_{j}"):
                st.session_state.chat_history.append({"role": "user", "content": q})
                st.session_state.chat_history.append({"role": "bot", "content": process_keyword(q)})

    # 輸入框
    user_input = st.chat_input("輸入關鍵字或問題...")
    if user_input:
        st.session_state.chat_history.append({"role": "user", "content": user_input})

        # 如果有 API Key 則用 Gemini
        key = st.session_state.get("gemini_key", "")
        if key:
            with st.spinner("Gemini 思考中..."):
                reply = call_gemini(user_input, key)
        else:
            reply = process_keyword(user_input)

        st.session_state.chat_history.append({"role": "bot", "content": reply})

    # 顯示歷史
    for msg in st.session_state.chat_history:
        if msg["role"] == "user":
            with st.chat_message("user"):
                st.markdown(f"<div class='chat-msg chat-user'>{msg['content']}</div>", unsafe_allow_html=True)
        else:
            with st.chat_message("assistant", avatar="🤖"):
                st.markdown(msg["content"])


def process_keyword(q):
    """關鍵字機器人（無需 API）"""
    q = q.lower().replace("電影", "").strip()
    result = ""

    if "最高" in q or "top" in q:
        top5 = sorted(movies, key=lambda x: -x["score"])[:5]
        result = "🏆 評分 Top 5:\n" + "\n".join(f"  {m['score']} — {m['name_cn']} ({m['name_en']})" for m in top5)
    elif "動畫" in q or "anime" in q:
        lst = [m for m in movies if "動畫" in m["categories"] or "动画" in m["categories"]]
        lst.sort(key=lambda x: -x["score"])
        result = f"🎨 動畫電影共 {len(lst)} 部:\n" + "\n".join(f"  {m['score']} — {m['name_cn']}" for m in lst[:10])
    elif "日本" in q or "japan" in q:
        lst = [m for m in movies if "日本" in m["country"]]
        lst.sort(key=lambda x: -x["score"])
        result = f"🗾 日本電影共 {len(lst)} 部:\n" + "\n".join(f"  {m['score']} — {m['name_cn']}" for m in lst[:10])
    elif "韓國" in q or "korea" in q:
        lst = [m for m in movies if "韓" in m["country"]]
        lst.sort(key=lambda x: -x["score"])
        result = f"🇰🇷 韓國電影共 {len(lst)} 部:\n" + "\n".join(f"  {m['score']} — {m['name_cn']}" for m in lst[:10])
    elif "美國" in q or "america" in q:
        lst = [m for m in movies if "美" in m["country"]]
        lst.sort(key=lambda x: -x["score"])
        result = f"🇺🇸 美國電影共 {len(lst)} 部:\n" + "\n".join(f"  {m['score']} — {m['name_cn']}" for m in lst[:10])
    elif "最長" in q or "longest" in q:
        lst = sorted(movies, key=lambda x: -int(x["duration"].replace("分鐘","").replace("分","").strip() or 0))[:5]
        result = "⏱ 片長最長:\n" + "\n".join(f"  {m['duration']} — {m['name_cn']}" for m in lst)
    elif "統計" in q or "stats" in q:
        result = f"📊 統計:\n  總數: {len(movies)}\n  平均分: {sum(scores)/len(scores):.1f}\n  最高: {max(scores)}\n  最低: {min(scores)}"
    else:
        matches = [m for m in movies if q in m["name_cn"].lower() or q in m["name_en"].lower()]
        if matches:
            if len(matches) == 1:
                m = matches[0]
                result = f"🎬 {m['name_cn']} ({m['name_en']})\n  評分: {m['score']} | {m['duration']}\n  國家: {m['country']}\n  類別: {m['categories']}"
            else:
                result = f"🔍 找到 {len(matches)} 部:\n" + "\n".join(f"  {m['score']} — {m['name_cn']}" for m in matches[:8])
        else:
            result = "😅 找不到，請換關鍵字～"

    return result


def call_gemini(q, api_key):
    """呼叫 Gemini API"""
    from google import genai
    client = genai.Client(api_key=api_key)

    context = f"電影資料庫（{len(movies)}部），評分{min(scores)}-{max(scores)}，平均{sum(scores)/len(scores):.1f}。"
    prompt = f"你是電影資料庫助手。{context}\n用繁體中文簡潔回答：{q}"

    try:
        resp = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        return resp.text
    except Exception as e:
        return f"❌ Gemini 呼叫失敗: {str(e)[:100]}"


# ── Tab 4: 原始資料 ──
with tab4:
    st.subheader("📋 原始 JSON 資料")
    st.dataframe(
        [{k: v for k, v in m.items() if k != "cover_url"} for m in movies],
        width="stretch",
        hide_index=True,
        column_order=["id", "name_cn", "name_en", "categories", "country", "duration", "release_date", "score"],
    )
    st.download_button(
        "📥 下載 CSV",
        data="id,name_cn,name_en,categories,country,duration,release_date,score\n" +
             "\n".join(f"{m['id']},{m['name_cn']},{m['name_en']},{m['categories']},{m['country']},{m['duration']},{m['release_date']},{m['score']}" for m in movies),
        file_name="movies.csv",
        mime="text/csv",
    )

# ── 聊天機器人浮動按鈕 ──
st.markdown("""
<div class="robot-wrap" id="stRobot" onclick="document.querySelectorAll('.stTabs button')[2]?.click()">
  <div class="robot" id="robotBody">
    <div class="robot-mode normal-mode">
      <div class="r-ant"><div class="r-ant-ball"></div></div>
      <div class="r-head">
        <div class="r-eye l"><div class="pupil"></div></div>
        <div class="r-eye r"><div class="pupil"></div></div>
        <div class="r-mouth"></div>
        <div class="r-blush lb"></div><div class="r-blush rb"></div>
      </div>
      <div class="r-body"><div class="r-heart">♥</div></div>
      <div class="r-arm la"></div><div class="r-arm ra"></div>
      <div class="r-leg ll"></div><div class="r-leg rl"></div>
    </div>
  </div>
  <div class="r-shadow"></div>
</div>
<style>
.robot-wrap{position:fixed;bottom:20px;right:20px;cursor:pointer;z-index:999999;width:120px;height:175px;animation:rf 3s ease-in-out infinite}
.robot-wrap:hover{transform:scale(1.1)}
@keyframes rf{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.robot{position:relative;width:110px;height:170px;margin:0 auto}
.r-shadow{width:75px;height:12px;background:rgba(0,0,0,.06);border-radius:50%;margin:0 auto}
.r-ant{position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:4px;height:20px;background:#333;border-radius:2px}
.r-ant-ball{position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:14px;height:14px;background:#ff6b9d;border:2px solid #333;border-radius:60% 40% 50% 50%;animation:ag 1.5s ease-in-out infinite}
@keyframes ag{0%,100%{background:#ff6b9d}50%{background:#ffd93d}}
.r-head{position:absolute;top:0;left:50%;transform:translateX(-50%);width:68px;height:58px;background:#fff;border:3px solid #333;border-radius:45% 55% 50% 50% / 50% 45% 55% 50%}
.r-eye{position:absolute;top:16px;width:18px;height:20px;background:#fff;border:2px solid #333;border-radius:60% 40% 55% 45% / 50% 55% 45% 50%}
.r-eye.l{left:10px}.r-eye.r{right:10px}
.pupil{position:absolute;top:6px;left:5px;width:6px;height:7px;background:#333;border-radius:50%}
.r-mouth{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);width:14px;height:5px;background:#333;border-radius:0 0 8px 8px}
.r-blush{position:absolute;top:26px;width:10px;height:6px;background:rgba(255,107,157,.35);border-radius:50%}
.r-blush.lb{left:4px}.r-blush.rb{right:4px}
.r-body{position:absolute;top:60px;left:50%;transform:translateX(-50%);width:62px;height:52px;background:#fff;border:3px solid #333;border-radius:40% 60% 50% 50% / 45% 40% 60% 55%}
.r-heart{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:22px;color:#ff6b9d;animation:hb 1.2s ease-in-out infinite;text-shadow:1px 1px 0 #333}
@keyframes hb{0%,100%{transform:translate(-50%,-50%) scale(1)}15%{transform:translate(-50%,-50%) scale(1.2)}30%{transform:translate(-50%,-50%) scale(1)}}
.r-arm{position:absolute;top:68px;width:8px;height:36px;background:#fff;border:2px solid #333;border-radius:4px;transform-origin:top center}
.r-arm.la{left:0;border-radius:4px 6px 6px 12px;transform:rotate(15deg)}
.r-arm.ra{right:0;border-radius:6px 4px 12px 6px;transform:rotate(-15deg)}
.r-leg{position:absolute;top:112px;width:10px;height:30px;background:#fff;border:2px solid #333;border-radius:4px 4px 8px 8px}
.r-leg.ll{left:20px;transform:rotate(3deg)}.r-leg.rl{right:20px;transform:rotate(-3deg)}
</style>
<script>
(function(){
  const el = document.getElementById('stRobot');
  if (el) {
    el.onclick = function() {
      const tabs = document.querySelectorAll('.stTabs [role="tab"]');
      if (tabs[2]) tabs[2].click();
    };
  }
})();
</script>
""", unsafe_allow_html=True)
