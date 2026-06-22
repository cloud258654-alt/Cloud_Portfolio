import streamlit as st
import streamlit.components.v1 as components

# 設定 Streamlit 頁面為寬螢幕模式與標題
st.set_page_config(
    page_title="十大機器學習方法：互動式視覺化資訊圖表",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 隱藏 Streamlit 預設的選單與頁尾以提供乾淨的滿版體驗
hide_menu_style = """
        <style>
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        .block-container {
            padding-top: 0rem;
            padding-bottom: 0rem;
            padding-left: 0rem;
            padding-right: 0rem;
        }
        iframe {
            display: block;
            border-style: none;
        }
        </style>
        """
st.markdown(hide_menu_style, unsafe_allow_html=True)

# 讀取原本的 HTML 檔案內容
try:
    with open("code_artifact.html", "r", encoding="utf-8") as f:
        html_code = f.read()
    
    # 使用 Streamlit HTML 元件嵌入，設定高度為 1600px 以完整容納網頁
    components.html(html_code, height=1600, scrolling=True)
except FileNotFoundError:
    st.error("找不到 code_artifact.html 檔案，請確認檔案與 streamlit_app.py 放於同一個資料夾。")
