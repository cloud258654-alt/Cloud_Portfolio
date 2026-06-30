import sqlite3
import tkinter as tk
from tkinter import ttk, messagebox, filedialog

rootWin = tk.Tk()
# --- 繪製主視窗
win_w = 1024
win_h = 768
scr_w   = rootWin.winfo_screenwidth()
scr_h   = rootWin.winfo_screenheight()
win_x   = (scr_w - win_w) // 2
win_y   = (scr_h - win_h) // 2
# ---
rootWin.title("SQLite Manager")
rootWin.geometry(f"{win_w}x{win_h}+{win_x}+{win_y}")
# rootWin.resizable(width=False, height=False)
# --- 產生toolBar
toolPanel = tk.Frame(rootWin, relief="raised", bd=2)
toolPanel.pack(side="top", fill="x", padx=3, pady=3)
# --- 產生檔案選擇鈕
selBtn = tk.Button(toolPanel, text="選檔案", font=("Arial", 14))
selBtn.pack(side="left", fill="y", ipadx=5, pady=3)
# --- 產生檔案標籤
dbLabel = tk.Label(toolPanel, text="", font=("Arial", 14), relief="solid", 
                   bd=1, anchor="w", bg="#FFFFFF")
dbLabel.pack(side="left", fill="both", expand=True, padx=5, pady=3)
# --- 產生連線按鈕
conBtn = tk.Button(toolPanel, text="連接", font=("Arial", 14))
conBtn.pack(side="left", fill="y", ipadx=5, pady=3)
# --- 產生SQL 編輯Panel
sqlPanel = tk.LabelFrame(rootWin, text="SQL 指令", font=("Arial", 14))
sqlPanel.pack(side="top", fill="x", padx=3, pady=3, ipady=3)
# --- 產生SQL指令編輯Editor
sqlEditor = tk.Text(sqlPanel, font=("Arial", 14), height=10)
sqlEditor.pack(side="top", fill="both", padx=3)
# --- 產生執行按鈕
runBtn = tk.Button(sqlPanel, text="執行", font=("Arial", 14))
runBtn.pack(side="top", pady=3, ipadx=10)
# --- 顯示視窗
rootWin.mainloop()