"""
輸入一個五位整數，將其轉為國字大寫輸出

cn_str = "零壹貳參肆伍陸柒捌玖"
num = input("請輸入五位整數: ")
n0 = int(num[0])
n1 = int(num[1])
n2 = int(num[2])
n3 = int(num[3])
n4 = int(num[4])
num_str = cn_str[n0] + cn_str[n1] + cn_str[n2] + \
          cn_str[n3] + cn_str[n4]
"""

"""
輸入一個電話號碼，將其數值轉為國字輸出
〇一二三四五六七八九
tel = input("電話號碼: ")
tel = tel.replace("0", "〇")
tel = tel.replace("1", "一")
tel = tel.replace("2", "二")
tel = tel.replace("3", "三")
tel = tel.replace("4", "四")
tel = tel.replace("5", "五")
tel = tel.replace("6", "六")
tel = tel.replace("7", "七")
tel = tel.replace("8", "八")
tel = tel.replace("9", "九")
print(tel)
"""

"""
輸入一個身份證號，驗證其有效性
找出資料在文字中的位置
x = "ABCDEFGHI"
print(x.index("E"))
"""
base = "ABCDEFGHJKLMNPQRSTUVXYWZIO"
id = input("ID: ").upper()
prefix = base.index(id[0]) + 10
id = str(prefix) + id[1:]
tot_num = int(id[ 0]) * 1 + \
          int(id[ 1]) * 9 + \
          int(id[ 2]) * 8 + \
          int(id[ 3]) * 7 + \
          int(id[ 4]) * 6 + \
          int(id[ 5]) * 5 + \
          int(id[ 6]) * 4 + \
          int(id[ 7]) * 3 + \
          int(id[ 8]) * 2 + \
          int(id[ 9]) * 1 + \
          int(id[10]) * 1
if tot_num % 10 > 0:
    print("無效ID")
else:
    print("有效ID")