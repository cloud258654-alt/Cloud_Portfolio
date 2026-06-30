class clz1:
    var1 = "NCHU"

    def __init__(self):
        print("Step 1")

    def cust1(self):
        print("Step X")
    
    def __del__(self):
        print("Step last")

"""
# --- 實例化
obj1 = clz1()
# --- 取用物件的功能
obj1.cust1()
# --- 取用物件的變數
print(obj1.var1)
"""

# 類別的三大特性
class clz_g2(clz1):
    var2 = 2026

    def cust2(self):
        print("Add Step N")

class clz_g3(clz_g2):
    def cust2(self):
        self.cust1()
        print("Add Step N-1")
        return super().cust2()

# obj3 = clz_g3()
# obj3.cust2()

from datetime import datetime
class proto:
    tm_interval = 0
    tm_price    = 0
    tm_from     = None
    tm_end      = None

    def __init__(self, interval:int , price: int):
        self.tm_interval    = interval
        self.tm_price       = price
        # print(self.tm_interval, "/", self.tm_price)

    def set_time_from(self, tm_from:str, fm="%Y/%m/%d %H:%M:%S"):
        self.tm_from = self.STOD(tm_from, fm)
        # print(self.tm_from)

    def set_time_end(self, tm_end: str, fm="%Y/%m/%d %H:%M:%S"):
        self.tm_end = self.STOD(tm_end, fm)
        # print(self.tm_end)

    def STOD(self, tm_str: str, fm="%Y/%m/%d %H:%M:%S"):
        return datetime.strptime(tm_str, fm)

    def get_time_diff_secs(self, tm_from:str|datetime, tm_end:str|datetime, fm="%Y/%m/%d %H:%M:%S"):
        self.set_time_from = self.STOD(tm_from, fm) if isinstance(tm_from, str) else tm_from
        self.set_time_end  = self.STOD(tm_end , fm) if isinstance(tm_end , str) else tm_end
        # ---
        if self.tm_from > self.tm_end:
            self.tm_from, self.tm_end = self.tm_end, self.tm_from
        # ---
        return int((self.tm_end - self.tm_from).seconds)

    def get_payment(self):
        tot_time = int(self.get_time_diff_secs(self.tm_from, self.tm_end) // 60)
        # ---
        tot_bill = (tot_time // self.tm_interval)
        print(tot_time, "/", tot_bill, "/", )
        if tot_time % self.tm_interval > 0:
            tot_bill = tot_bill + 1
        # ---
        return tot_bill * self.tm_price
"""
obj1 = proto(30, 10)
obj1.set_time_from("2026/06/29 10:41:00")
obj1.set_time_end("2026/06/29 11:45:00")
print(obj1.get_payment())
"""


class Parking_With_Max(proto):
    max_price = None

    def set_max_price(self, price: int):
        self.max_price = price
    
    def get_payment(self):
        if self.max_price == None:
            return super().get_payment()
        else:
            return min(super().get_payment(), self.max_price)

"""
obj2 = Parking_With_Max(30, 20)
obj2.set_time_from("2026/06/29 08:00:00")
obj2.set_time_end("2026/06/29 12:00:00")
obj2.set_max_price(100)
print(obj2.get_payment())
"""

class Parking_With_Free(Parking_With_Max):
    tm_free = 0
    tm_min  = 0

    def set_free_and_min(self, fr:int, mi:int):
        self.tm_free    = fr * 60
        self.tm_min     = mi * 60

    def get_time_diff_secs(self, tm_from, tm_end, fm="%Y/%m/%d %H:%M:%S"):
        tot_secs = super().get_time_diff_secs(tm_from, tm_end, fm)
        # ---
        if   tot_secs < self.tm_free:
            return 0
        elif tot_secs < self.tm_min:
            return self.tm_min
        else:
            return tot_secs
