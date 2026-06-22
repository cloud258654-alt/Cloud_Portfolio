"""
讓用戶輸入一串英文字
讓輸入的內容中，將每一個英文字母向右移3個字母，例如A->D, g->j, z->c 
import random
base    = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
random.seed(10)
# 利用亂數函式打亂基礎編碼表
base    = random.sample(base, len(base))
print(base)
offset  = -3
orgStr  = input("輸入一段英文(大寫): ")
newStr  = ""
for c in orgStr:
    if c not in base:
        newStr = newStr + c
    else:
        # --- 取得原來位置
        ndx = base.index(c)
        # --- 計算新位置
        ndx = ndx + offset
        # --- 檢查是否超過，超過則循環
        if ndx >= len(base):
            ndx = ndx - len(base)
        # ---
        newStr = newStr + base[ndx]
print("原內容: ", orgStr)
print("新內容: ", newStr)
"""


"""
座位編排
依照下列用戶姓名,讓用戶輸入每排座位人數(2~7)，依照輸入每排座位人數將座位表排出
輸出格式(假設3人一排):
   Name       Name       Name
---------- ---------- ---------- 
1234567890 1234567890 1234567890 
users = ("Aaric", "Abbot", "Ace", "Ackerley", "Adam", "Adney", 
         "Bab", "Bamboo", "Ben", "Bunny", "Betty", "Baha", 
         "Cindy", "Candy", "Cathy", "Cakra", "Carin", "Caroline",
         "Deny", "Dacy", "Danna", "Debbi", "Devon", "Diza","Dob")

num = int(input("請輸入每排人數(2~7): "))
# 先處裡表頭顯示
title1 = "   Name    " * num
title2 = "---------- " * num
print(title1) 
print(title2)
# 處理座位的編排
for i in range(len(users)):
    if i > 0 and i % num == 0:
        print()
    # ---
    print(f"{users[i]:10s} ", end="")
"""


"""
讓用戶輸入一個整數，直到輸入的整數為3的倍數

方法一
num = 1
while num % 3 > 0:
    num = int(input("輸入一個整數: "))
"""

"""
方法二
while True:
    num = int(input("輸入一個整數: "))
    if num % 3 == 0:
        break
"""


"""
讓用戶輸入一個整數，如果該整數不是質數則要求繼續輸入
"""
while True:
    num = int(input("輸入一個整數: "))
    # --- 不處理 2 以下的數值
    if num < 2:
        continue
    # --- 求第一個因數
    fac = None
    for i in range(2, int(num ** 0.5) + 1):
        if num % i == 0:
            fac = i
            break
    # --- 沒有任何因數
    if fac == None:
        break
