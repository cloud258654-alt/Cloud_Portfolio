"""
讓用戶輸入一個整數秒，計算?天?時?分?秒
輸出格式: XXXXXX 秒 =  X天X時X分X秒

# --- 取得資料
tot_secs = input("請輸入秒數 : ")
# --- 資料轉型
tot_secs = int(tot_secs)
# --- 取不足分的秒數
rem_secs = tot_secs % 60
# --- 計算總分鐘數
tot_mins = int((tot_secs - rem_secs) / 60)
# --- 取不足時的分數
rem_mins = tot_mins % 60
# --- 計算總小時數
tot_hours = int((tot_mins - rem_mins) / 60)
# --- 取不足日的時數
rem_hours = tot_hours % 24
# --- 計算總日數
tot_days = int((tot_hours - rem_hours) / 24)
# --- 結果輸出
print(tot_secs, "秒 =", tot_days, "天", rem_hours, "時", 
      rem_mins, "分", rem_secs, "秒")
"""

"""
台幣幣值有 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 1
讓用戶輸入一個金額，計算每一種幣值所需數量
輸出必須對齊如下
2000 元, XXXX 張 = XXXXXXX 元
"""
# 取得資料 + 資料轉型
tot_amt = int(input("輸入金額 : "))
# 計算 2000 需求量
cur_2000 = tot_amt // 2000
# 計算 1000 需求量
tot_amt  = tot_amt % 2000
cur_1000 = tot_amt // 1000
# 計算 500 需求量
tot_amt  = tot_amt % 1000
cur_500  = tot_amt // 500
# 計算 200 需求量
tot_amt  = tot_amt % 500
cur_200  = tot_amt // 200
# 計算 100 需求量
tot_amt  = tot_amt % 200
cur_100  = tot_amt // 100
# 計算 50 需求量
tot_amt  = tot_amt % 100
cur_50  = tot_amt // 50
# 計算 20 需求量
tot_amt  = tot_amt % 50
cur_20  = tot_amt // 20
# 計算 10 需求量
tot_amt  = tot_amt % 20
cur_10  = tot_amt // 10
# 計算 5 需求量
tot_amt  = tot_amt % 10
cur_5  = tot_amt // 5
# 計算 1 需求量
tot_amt  = tot_amt % 5
# ---- 彙總
qty = cur_2000 + cur_1000 + cur_500 + cur_200 + cur_100 + cur_50 + cur_20 + cur_10 + cur_5 + tot_amt
amt = 2000 * cur_2000 + \
      1000 * cur_1000 + \
       500 * cur_500  + \
       200 * cur_200  + \
       100 * cur_100  + \
        50 * cur_50   + \
        20 * cur_20   + \
        10 * cur_10   + \
         5 * cur_5    +  tot_amt
# 輸出
print(f"{2000:4d} 元, {cur_2000:4d} 張 = {2000*cur_2000:7d} 元")
print(f"{1000:4d} 元, {cur_1000:4d} 張 = {1000*cur_1000:7d} 元")
print(f"{ 500:4d} 元, {cur_500 :4d} 張 = { 500*cur_500 :7d} 元")
print(f"{ 200:4d} 元, {cur_200 :4d} 張 = { 200*cur_200 :7d} 元")
print(f"{ 100:4d} 元, {cur_100 :4d} 張 = { 100*cur_100 :7d} 元")
print(f"{  50:4d} 元, {cur_50  :4d} 張 = {  50*cur_50  :7d} 元")
print(f"{  20:4d} 元, {cur_20  :4d} 張 = {  20*cur_20  :7d} 元")
print(f"{  10:4d} 元, {cur_10  :4d} 張 = {  10*cur_10  :7d} 元")
print(f"{   5:4d} 元, {cur_5   :4d} 張 = {   5*cur_5   :7d} 元")
print(f"{   1:4d} 元, {tot_amt :4d} 張 = {   1*tot_amt :7d} 元")
print("-------  -------   ----------")
print(f" 合計   {qty:4d} 項   {amt:7d} 元")


"""
課後練習
請將上述輸出後端加入總和資料，格式如下
------- --------  ----------
合計     XXXX 張 = XXXXXXX 元
"""