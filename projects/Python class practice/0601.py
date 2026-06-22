# na = input("請輸入姓名 : ")
# print("Hello, ", na)

# 匯入需要的功能
import tkinter as tk 
# 產生一個視窗
topwin = tk.Tk()
# 設定視窗的標題
topwin.title("Python AI IN 2026")
# 設定視窗的大小和位置
topwin.geometry("600x300+50+50")
# --- 按鈕點擊後執行的功能
def onClick():
    # 取出用戶輸入的資料，並去掉前後的空白
    na = editor01.get().strip()
    # ---
    if na:
        label02["text"] =  "Hello, " + na + " nice to meet you!"
    else:
        label02["text"] = "您尚未輸入姓名"
# ---
# 建立一個上方的容器
panel01 = tk.Frame(topwin, height=10, relief=tk.RAISED, bd=2)
panel01.pack(side="top", fill="x")
# 建立欄位標題
label01 = tk.Label(panel01, text="姓名 : ", font=("Arial", 20), anchor="e", width=10)
label01.pack(side="left")
# 建立欄位編輯器
editor01 = tk.Entry(panel01, font=("Arial", 20))
editor01.pack(side="left", fill="x", padx=3, expand=True)
# 建立顯示結果的標籤
label02 = tk.Label(topwin, text="請先輸入您的大名", font=("Arial", 20), anchor="center")
label02.pack(side="top", fill="both", padx=3, pady=3, expand=True)
# 建立功能按鈕
button01 = tk.Button(topwin, text="Click", font=("Arial", 20), command=onClick)
button01.pack(side="bottom", ipadx=10, ipady=5)

# 顯示視窗
topwin.mainloop()