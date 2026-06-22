"""
讓用戶輸入一段5個字的內容，
將其中大/小寫互換，不是英文則不變
orgStr = input("輸入五個字: ")
newStr = (orgStr[0] if orgStr[0].upper() == orgStr[0].lower() else \
          orgStr[0].lower() if orgStr[0] == orgStr[0].upper() else orgStr[0].upper()) + \
         (orgStr[1] if orgStr[1].upper() == orgStr[1].lower() else \
          orgStr[1].lower() if orgStr[1] == orgStr[1].upper() else orgStr[1].upper()) + \
         (orgStr[2] if orgStr[2].upper() == orgStr[2].lower() else \
          orgStr[2].lower() if orgStr[2] == orgStr[2].upper() else orgStr[2].upper()) + \
         (orgStr[3] if orgStr[3].upper() == orgStr[3].lower() else \
          orgStr[3].lower() if orgStr[3] == orgStr[3].upper() else orgStr[3].upper()) + \
         (orgStr[4] if orgStr[4].upper() == orgStr[4].lower() else \
          orgStr[4].lower() if orgStr[4] == orgStr[4].upper() else orgStr[4].upper())
"""

"""
讓用戶輸入一段英文字，輸出每個字母第一次出現的位置和共出現幾次
範例: ABCAA
輸出:
C Ndx Tot 
- --- ---
X 123 123
A   0   3
B   1   1
C   2   1
"""
orgStr = input("請輸入一段文字: ")
print("C Ndx Tot")
print("- --- ---")
for ndx in range(len(orgStr)):
    c = orgStr[ndx]
    if orgStr.index(c) != ndx:
        continue
    # ---
    cnt = orgStr.count(c)
    # ---
    print(f"{c} {ndx:3d} {cnt:3d}")