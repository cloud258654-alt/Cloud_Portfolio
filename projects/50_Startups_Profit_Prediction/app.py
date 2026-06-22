"""
Redirect shim — Streamlit Cloud 設定的入口點為:
  projects/50_Startups_Profit_Prediction/app.py

但真正的程式與資料放在:
  projects/Homework_06_50_Startups_Profit_Prediction/

此檔案會動態切換工作目錄，讓 Path(__file__).parent 等路徑在
原始 app.py 中仍能正確指向 data/ 和 assets/。
"""
import sys
import os
from pathlib import Path

# 找到真正程式所在目錄（相對於本檔案往上一層，再進入正確資料夾）
REAL_DIR = Path(__file__).parent.parent / "Homework_06_50_Startups_Profit_Prediction"

# 將真正目錄插入 sys.path 最前面，讓 import 能正確解析
sys.path.insert(0, str(REAL_DIR))

# 切換工作目錄，讓原始 app.py 中以相對路徑讀取的檔案（data/、assets/）能正常找到
os.chdir(str(REAL_DIR))

# 動態載入並執行原始 app.py
import runpy
runpy.run_path(str(REAL_DIR / "app.py"), run_name="__main__")
