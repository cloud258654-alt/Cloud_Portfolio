"""
1~100 的猜數字遊戲

import random
min_num = 1
max_num = 100
ans_num = random.randint(1, 100)
gus_num = 0
while ans_num != gus_num:
    gus_num = int(input(f"請輸入{min_num}~{max_num}的數值: "))
    # ---
    if   gus_num < min_num or gus_num > max_num:
        print("輸入數值超出範圍!")
    elif gus_num < ans_num:
        min_num = gus_num
    elif gus_num > ans_num:
        max_num = gus_num
else:
    print("正確答案是 :", gus_num)
"""

"""
讓用戶輸入一個整數，將其數值反向輸出
例:12345 => 54321

num     = int(input("輸入一整數: "))
new_num = 0
while num > 0:
    new_num = new_num * 10 + num % 10
    num     = num // 10
else:
    print(new_num)
"""

"""
讓用戶輸入一個整數 N，列出 1 + 2 + 3 + ....X >= N

num  = int(input("輸入整數值: "))
fstr = ""
tot  = 0
n    = 0
while True:
    n   = n + 1
    tot = tot + n
    # ---
    if n == 1:
        fstr = str(n)
    else:
        fstr = fstr + f" + {n}"
    # ---
    if tot >= num:
        break
# ---
print(fstr + f" >= {num}")
"""


"""
輸入一個整數值n ， 找出第n 個質數

num = int(input("輸入一個整數: "))
n   = 1
while num > 0:
    n = n + 1
    # --- 檢查n 是否為質數
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            break
    else:
        num = num - 1
else:
    print(n)
"""

"""
讓用戶重複輸入任意數量的整數，如用戶輸入空白則表示停止輸入
列出該數列，及最大、最小和平均值

方法一
min_num = None
max_num = None
sum_num = 0
num_lst = []
while True:
    inp_str = input("輸入整數(空白結束) : ")
    if inp_str.strip() == "":
        break
    else:
        num_lst.append(int(inp_str))
# --- 處理最大、最小和平均值
for n in num_lst:
    if min_num == None or n < min_num:
        min_num = n
    # ---
    if max_num == None or n > max_num:
        max_num = n
    # ---
    sum_num = sum_num + n
# ---
print("數列 :", num_lst)
print(f"最小: {min_num}，最大: {max_num}，平均: {sum_num / len(num_lst)}")
"""

"""
方法二
min_num = None
max_num = None
sum_num = 0
num_lst = []
while True:
    inp_str = input("輸入整數(空白結束) : ")
    if inp_str.strip() == "":
        break
    else:
        num_lst.append(int(inp_str))
    # ---
    if min_num == None or num_lst[-1] < min_num:
        min_num = num_lst[-1]
    # ---
    if max_num == None or num_lst[-1] > max_num:
        max_num = num_lst[-1]
    # ---
    sum_num = sum_num + num_lst[-1]
# ---
print("數列 :", num_lst)
print(f"最小: {min_num}，最大: {max_num}，平均: {sum_num / len(num_lst)}")
"""

"""
用亂數隨機產生10 個介於1~100 的整數值，將其中奇數排前，偶數排後，奇/偶數不分大小
import random
ls = random.choices(range(1, 101), k=10)
ls_odd = []
ls_eve = []
for n in ls:
    if n % 2 == 0:
        ls_eve.append(n)
    else:
        ls_odd.append(n)
# ---
ls_odd.extend(ls_eve)
print(ls)
print(ls_odd)
"""

"""
用亂數隨機產生10 個介於1~100 的整數值，挑出其中的質數
"""
import random
ls = random.choices(range(1, 101), k=10)
