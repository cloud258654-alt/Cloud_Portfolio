"""
BMI = 體重(kg) /  (身高 * 身高)
讓用戶輸入體重&身高，計算BMI 值，至小數第二位
格式:

BMI =  ###.# / (#.## x #.##) = ####.##
wkg = float(input("體重(Kg) : "))
hm2 = float(input("身高(M) : "))
BMI = wkg / (hm2 * hm2)
print(f"BMI = {wkg:4.1f} / ({hm2:3.2f} x {hm2:3.2f}) = {BMI:6.2f}")
"""


"""
承上題，男性標準值: 22 ~28，女性標準值 18~25
請依據BMI 輸出，過輕、適中、偏重
格式:
BMI =  ###.# / (#.## x #.##) = ####.## (狀態)

方法一
# 取得資料
wkg = float(input("體重(Kg) : "))
hm2 = float(input("身高(M) : "))
ged = input("性別(M:男生/F:女生) :")
# 處理資料
BMI = wkg / (hm2 * hm2)
# 輸出結果
if  ged == "M":
    if   BMI < 22:
        print(f"BMI = {wkg:4.1f} / ({hm2:3.2f} x {hm2:3.2f}) = {BMI:6.2f}(過輕)")
    elif BMI > 28:   
        print(f"BMI = {wkg:4.1f} / ({hm2:3.2f} x {hm2:3.2f}) = {BMI:6.2f}(偏重)")
    else:
        print(f"BMI = {wkg:4.1f} / ({hm2:3.2f} x {hm2:3.2f}) = {BMI:6.2f}(適中)")
else:
    if   BMI < 18:
        print(f"BMI = {wkg:4.1f} / ({hm2:3.2f} x {hm2:3.2f}) = {BMI:6.2f}(過輕)")
    elif BMI > 25:   
        print(f"BMI = {wkg:4.1f} / ({hm2:3.2f} x {hm2:3.2f}) = {BMI:6.2f}(偏重)")
    else:
        print(f"BMI = {wkg:4.1f} / ({hm2:3.2f} x {hm2:3.2f}) = {BMI:6.2f}(適中)")
"""

"""
方法二
# 取得資料
wkg = float(input("體重(Kg) : "))
hm2 = float(input("身高(M) : "))
ged = input("性別(M:男生/F:女生) :")
# 處理資料
BMI = wkg / (hm2 * hm2)
BMI_min = 22
BMI_max = 28
if ged != "M":
    BMI_min = 18
    BMI_max = 25
# ---
if   BMI < BMI_min:
    print(f"BMI = {wkg:4.1f} / ({hm2:3.2f} x {hm2:3.2f}) = {BMI:6.2f}(過輕)")
elif BMI > BMI_max:   
    print(f"BMI = {wkg:4.1f} / ({hm2:3.2f} x {hm2:3.2f}) = {BMI:6.2f}(偏重)")
else:
    print(f"BMI = {wkg:4.1f} / ({hm2:3.2f} x {hm2:3.2f}) = {BMI:6.2f}(適中)")
"""



"""
某停車場前15分鐘免費，第一個小時40 元，
之後每30分鐘20 元， 當日最高不超過 180 元
請輸入停車分鐘數， 計算應收費金額
格式:
停車時間  計算金額 應付金額
-------- -------- --------
12345678 12345678 12345678

方法一
tot_tm  = int(input("總分鐘數 : "))
tot_amt = 0
if tot_tm > 15:
    tot_amt = 40
# ---
if tot_tm > 60:
    tm = (tot_tm - 60) // 30
    if tot_tm % 30 > 0:
        tm = tm + 1
else:
    tm = 0
# --- 
tot_amt = tot_amt + tm * 20
if tot_amt > 180:
    pay_amt = 180
else:
    pay_amt = tot_amt
# ---
print("停車時間  計算金額 應付金額")
print("-------- -------- --------")
print(f"{tot_tm:8d} {tot_amt:8d} {pay_amt:8d}")
"""

"""
方法二
tot_tm  = int(input("總分鐘數 : "))
tot_amt = pay_amt = 0
if tot_tm > 15:
    tot_amt = (tot_tm // 30) * 20
    if tot_tm % 30 > 0:
        tot_amt = tot_amt + 20
    # ---
    if   tot_amt < 40:
        pay_amt = 40
    elif tot_amt > 180:
        pay_amt = 180
    else:
        pay_amt = tot_amt
# ---
print("停車時間  計算金額 應付金額")
print("-------- -------- --------")
print(f"{tot_tm:8d} {tot_amt:8d} {pay_amt:8d}")
"""


"""
電費計算
    用電分級       夏季       非夏季
--------------- ----------  ----------
0   ~ 120度      1.63元/度   1.63元/度
121 ~ 330度部份  2.38元/度   2.10元/度
331 ~ 500度部份  3.52元/度   2.89元/度
501 ~ 700度部份  4.80元/度   3.94元/度
701 ~1000度部份  5.66元/度   4.60元/度
1001度以上部份   6.41元/度   5.03元/度

格式:
區間        度數  單價 金額
----------- ---- ---- ----------
1234 ~ 1234 1234 1.23 12345678.9
"""
tot_val = int(input("請輸入總用電度數: "))
is_summ = input("是否為夏季電費(Y/N): ")
# --- 分配 0~120 應計價度數
if   tot_val <= 120:
    v_120 = tot_val
else:
    v_120 = 120
# --- 分配 121~330 應計價度數
tot_val = tot_val - v_120
if tot_val <= (330-120):
    v_330 = tot_val
else:
    v_330 = (330 - 120)
# --- 分配 331~500 應計價度數
tot_val = tot_val - v_330
if tot_val <= (500-330):
    v_500 = tot_val
else:
    v_500 = (500 - 330)
# --- 分配 501~700 應計價度數
tot_val = tot_val - v_500
if tot_val <= (700-500):
    v_700 = tot_val
else:
    v_700 = (700 - 500)
# --- 分配 701~1000 應計價度數
tot_val = tot_val - v_700
if tot_val <= (1000-700):
    v_1000 = tot_val
else:
    v_1000 = (1000 - 700)
# --- 分配 1001 以上應計價度數
tot_val = tot_val - v_1000
v_1001 = tot_val
# --- 處裡單價
if is_summ == "Y":
    unp_120  = 1.63
    unp_330  = 2.38
    unp_500  = 3.52
    unp_700  = 4.80
    unp_1000 = 5.66
    unp_1001 = 6.41
else:
    unp_120  = 1.63
    unp_330  = 2.10
    unp_500  = 2.89
    unp_700  = 3.94
    unp_1000 = 4.60
    unp_1001 = 5.03
# ----
tot_amt = v_120  * unp_120  + \
          v_330  * unp_330  + \
          v_500  * unp_500  + \
          v_700  * unp_700  + \
          v_1000 * unp_1000 + \
          v_1001 * unp_1001 
# ---
print("區間        度數  單價 金額")
print("----------- ---- ---- ----------")
print(f"{0   :4d} ~ {120 :4d} {v_120 :4d} {unp_120 :3.2f} {v_120  * unp_120 :9.1f}")
print(f"{121 :4d} ~ {330 :4d} {v_330 :4d} {unp_330 :3.2f} {v_330  * unp_330 :9.1f}")
print(f"{331 :4d} ~ {500 :4d} {v_500 :4d} {unp_500 :3.2f} {v_500  * unp_500 :9.1f}")
print(f"{501 :4d} ~ {700 :4d} {v_700 :4d} {unp_700 :3.2f} {v_700  * unp_700 :9.1f}")
print(f"{701 :4d} ~ {1000:4d} {v_1000:4d} {unp_1000:3.2f} {v_1000 * unp_1000:9.1f}")
print(f"{1001:4d} ~ 以上 {v_1001:4d} {unp_1001:3.2f} {v_1001 * unp_1001:9.1f}")
