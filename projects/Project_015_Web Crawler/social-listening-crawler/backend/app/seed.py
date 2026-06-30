"""
Seed script v3.0: python -m app.seed
文章牛肉湯 安平總店 - AI 商譽風險偵測案例資料
"""
import random
import datetime
import json
import logging

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.keyword import Keyword
from app.models.mention import Mention
from app.models.crawl_log import CrawlLog

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app.seed")

Base.metadata.create_all(bind=engine)

# Case study: 文章牛肉湯 (all branches)
BRAND = "文章牛肉湯"
BRAND_KEYWORD = {"name": BRAND, "group_name": "台南牛肉湯·安平總店·東門店", "platforms": "PTT,Dcard,Google Search,Google Maps,Facebook Import,Threads Import,小紅書 Import,TikTok Import"}

# ----- Realistic review content by theme -----
REVIEWS_POSITIVE = [
    "文章牛肉湯真的是台南必吃！牛肉鮮嫩，湯頭超清甜，每次回台南都要來一碗。",
    "排了20分鐘終於吃到，但完全值得！湯頭濃郁好喝，牛肉軟嫩不柴，大推！",
    "這家牛肉湯真的名不虛傳，肉質鮮美，湯頭用大骨熬出來的味道就是不一樣。",
    "安平總店真的比市區其他家好吃！牛肉給得大方，湯頭甘甜，吃完還想再來。",
    "早上六點就來排隊，第一鍋湯頭最好喝！牛肉切得薄薄的入口即化，CP值超高！",
    "帶朋友來吃，大家都說讚！牛肉湯一碗才120，這種品質真的很划算。",
    "服務態度超好！老闆還會問要不要加湯，環境也乾淨明亮。",
    "吃了十年了，品質一直很穩定。牛肉湯配肉燥飯就是台南人的早餐！",
    "這次來排隊人雖然多，但動線規劃得很好，很快就吃到了。",
    "停車雖然要繞一下，但吃到牛肉湯就覺得值了。肉嫩湯鮮，台南之光！",
    "推！安平店停車場滿方便的，牛肉湯配上蒜泥和辣醬超讚。",
    "這次點了牛肉湯加大，份量真的很夠！肉多湯多，吃完超滿足。",
    "台南人認證！文章牛肉湯真的是最道地的，湯頭有淡淡藥材香。",
    "環境重新裝潢後變得好舒適，冷氣夠強，夏天喝熱湯也不怕。",
    "服務生很親切，會主動介紹菜單，還建議我們點招牌牛肉湯和牛腩湯。",
    "價格合理，一碗120元牛肉湯在這種品質下很OK，比台北便宜太多了。",
    "特地從台北開車下來吃，果然沒失望！停車場很大，停車沒問題。",
    "必點牛肉湯+肉燥飯套餐！肉燥飯也超好吃，整組吃下來150元有找。",
    "湯頭真的是靈魂！用中藥和蔬果熬的，喝起來回甘不膩口。",
    "這次外帶回家吃，老闆還多給了一包湯，超貼心！",
]

REVIEWS_NEUTRAL = [
    "文章牛肉湯還可以，中規中矩的台南牛肉湯，沒有特別驚豔但也不差。",
    "朋友推薦來的，口味還OK，但排隊排了半小時，可能不值得等這麼久。",
    "第一次吃台南牛肉湯，不知道這樣的品質算不算好，但湯頭算蠻好喝的。",
    "人真的很多，中午時間去大概等15-20分鐘，建議避開尖峰。",
    "牛肉湯表現普通，可能期待太高了，但服務生態度不錯。",
    "口味中上，但價格比一般牛肉湯貴一點點，CP值普通。",
    "肉質算嫩，但湯頭沒有傳說中那麼厲害，可能各人口味不同。",
    "停車場車位不多，繞了兩圈才找到位置，但店內環境乾淨。",
    "下午兩點去還是很多人，不知道是不是因為假日的關係。",
    "點了牛肉湯和牛雜湯，牛雜湯反而比較驚豔，牛肉湯就一般的台南水準。",
]

REVIEWS_WAITING = [
    "排隊排了40分鐘！雖然好吃，但排隊時間真的太久了，效率可以再提升。",
    "假日中午來根本惡夢，等了快一個小時！建議店家可以導入號碼牌系統。",
    "人潮洶湧，排到外面的馬路上，夏天排隊真的會熱死，希望可以改善動線。",
    "排隊排到我腳酸，出餐速度也偏慢，可能是客人太多了吧。",
    "每次來都要排半小時以上，雖然好吃但長期下來會降低再訪意願。",
    "排隊路線沒有遮陽棚，大太陽下排隊真的很痛苦，帶小孩來更辛苦。",
    "等了大約35分鐘，進店後出餐還要再等10分鐘，總等待時間太長了。",
    "建議平日來，假日排隊真的太誇張了，大排長龍快排到隔壁去了。",
    "疫情後人更多了，排隊完全沒改善，建議先網路預約或抽號碼牌。",
    "等很久就算了，進店後發現座位很擁擠，走道狹窄，不太舒服。",
]

REVIEWS_PARKING = [
    "停車真的是最大問題！附近很難找車位，繞了20分鐘才停好。",
    "安平假日停車超痛苦，店門口車位只有幾個，大部分都要停很遠走過來。",
    "開車來真的要三思，停車場車位少得可憐，每次都要賭運氣。",
    "沒有專屬停車場，路邊停車格又都被停滿了，建議騎機車來。",
    "停車不方便，對外地人來說很困擾，導航帶到巷子裡結果找不到車位。",
    "這次停在市民活動中心再走過來，大概要走10分鐘，夏天走真的很熱。",
    "停車場太小了，大概只能停10台車，根本應付不了那麼多客人。",
    "帶長輩來吃，停車是一大挑戰，長輩走路不便，停在遠處很不方便。",
    "機車位也不夠，騎機車來也要找一下，假日來安平就是停車地獄。",
    "希望店家可以跟附近停車場合作，提供停車優惠或接駁服務。",
]

REVIEWS_SERVICE = [
    "服務態度真的很差！店員臉色超臭，好像在催你快點吃完快點走。",
    "員工態度不耐煩，問個問題愛理不理的，這種服務讓人不想再來。",
    "結帳時被店員兇，只是問說可不可以加點，態度有夠差勁。",
    "服務生一直在旁邊盯著看，壓力超大的，趕人的感覺很明顯。",
    "人多的時候服務品質直線下降，店員耐心全失，對客人口氣很差。",
    "雖然東西好吃，但服務態度真的不敢恭維，吃完心情都不好了。",
    "老闆不在的時候店員服務特別差，一直滑手機不理客人。",
    "點餐時店員完全沒介紹，問有什麼推薦也說都差不多，完全不專業。",
    "收桌子用摔的，湯汁都濺到我們身上了，也沒道歉。",
    "女店員態度很差，請她幫忙加湯直接翻白眼，有夠沒禮貌。",
]

REVIEWS_HYGIENE = [
    "吃到一半發現湯裡有頭髮！跟店員反應態度還很差，真的很噁心。",
    "吃完回家拉肚子，不知道是不是牛肉不新鮮，以後不敢再去了。",
    "店內衛生有待加強，桌子和地板都油油的，用餐環境不太舒服。",
    "廚房看得到的地方還算乾淨，但廁所真的很髒，完全不像餐廳該有的水準。",
    "調味料區的蒜泥和辣醬瓶子都黏黏的，感覺很久沒清潔了。",
    "蒼蠅很多！開放式空間的問題，吃飯一直要趕蒼蠅很煩。",
    "昨天去吃，今天拉肚子拉到不行，同行三個人都中獎，肯定是食安問題。",
    "湯碗邊緣有破損，醬料碟也沒洗乾淨，衛生把關不確實。",
    "老鼠在後面巷子跑來跑去，雖然不是在店內看到，但還是很擔心衛生。",
    "同行朋友吃到一半說肚子怪怪的，懷疑牛肉不新鮮，衛生條件令人擔憂。",
]

REVIEWS_PRICE = [
    "牛肉湯一碗120元我覺得偏貴，份量也沒有很多，CP值不高。",
    "觀光客價格，在地人覺得不值，同樣價格在市區可以吃到更好的。",
    "漲價了！之前才100元，現在一碗120元，漲幅有點大。",
    "這個價錢在台南可以吃兩碗別家的牛肉湯了，品質也沒特別好到哪去。",
    "兩個人隨便點一點就超過500元，以路邊攤等級的環境來說太貴了。",
    "牛肉湯加大要150元，但加的份量根本沒多少，感覺被坑了。",
    "價格偏高但在觀光區可以理解，只是希望品質能跟上價格。",
]

REVIEWS_NEGATIVE_MIX = [
    "排隊太久、停車難找、服務態度差，三個願望一次滿足。牛肉好吃但不會想再來了。",
    "整體來說CP值很低，排隊等很久、價錢不便宜、店員臉又臭，一次店。",
    "被部落客騙來的，等了一小時結果牛肉湯普普通通，真的不值得。",
    "什麼台南必吃根本過譽！排隊排得要死，結果湯鹹肉少，踩雷了。",
    "不會再來第二次了，服務態度差到爆，牛肉湯也沒有傳說中那麼好吃。",
    "跟五年前比品質掉很多，以前真的很好喝，現在就是吃名氣而已。",
    "建議觀光客不要再來了，讓這間店回歸正常的品質，現在就是被炒作出來的。",
    "太失望了，原本很期待的台南牛肉湯之旅，結果這家最雷。",
]

# Platform-specific titles
PLATFORM_TITLES = {
    "Google Maps": [
        "在地人推薦！文章牛肉湯安平總店",
        "排隊美食體驗分享",
        "{n}顆星評論",
    ],
    "Dcard": [
        "#食記 文章牛肉湯安平總店 不專業分享",
        "#台南美食 每次去台南必吃的牛肉湯",
        "#踩雷 文章牛肉湯真的有那麼好嗎？",
        "#問 文章vs六千vs阿村 哪家最推？",
        "#心得 安平文章牛肉湯排隊攻略",
    ],
    "PTT": [
        "[食記] 文章牛肉湯安平總店 排隊實測心得",
        "[問題] 文章牛肉湯排隊時間請益",
        "[抱怨] 文章牛肉湯服務態度",
        "[食記] 台南牛肉湯大評比：文章、六千、阿村",
        "[討論] 文章牛肉湯是不是過譽了？",
    ],
    "Google Search": [
        "文章牛肉湯安平總店 - 菜單、營業時間、評價",
        "台南必吃牛肉湯推薦：文章牛肉湯安平總店",
        "文章牛肉湯安平總店排隊攻略 2026",
        "文章牛肉湯安平總店最新評論彙整",
    ],
    "Facebook Import": [
        "台南安平必吃美食推薦 - 文章牛肉湯",
        "週末台南美食之旅 - 文章牛肉湯真實心得",
        "有人也覺得文章牛肉湯被高估了嗎？",
        "台南人私藏的牛肉湯地圖",
    ],
}

AUTHORS = ["美食小王", "台南阿宅", "旅遊達人Amy", "吃貨日記", "安平在地人", "台北來的美食家",
           "肉燥飯愛好者", "牛肉湯專家", "南部美食通", "Tony的食記", "吃遍台南",
           "美食部落客CC", "老台南人", "觀光客小陳", "排隊達人", "吃貨小美"]

# Platform-specific realistic author names
PTT_AUTHORS = ["a5566123", "台南囝仔", "beeflover88", "foodhunter_tw", "skylark9527",
               "PTT美食觀察家", "tncityboy", "pighead3", "鄉民阿德", "lazybone_tw"]

DCARD_AUTHORS = ["美食探險家", "台南女孩", "吃貨日記", "小資吃貨", "深夜食堂",
                 "安平在地人", "大學生吃什麼", "愛吃鬼小咪", "台南美食通", "流浪食客"]

GOOGLE_AUTHORS = ["王小明", "李大同", "陳怡君", "林志明", "張雅婷", "黃建華",
                  "劉美玲", "周俊傑", "蔡文雄", "許小芬", "吳宗憲", "鄭惠文"]

def _gen_url(platform: str) -> str:
    pid = random.randint(1000000, 9999999)
    if platform == "PTT":
        board = random.choice(["Food", "Tainan", "Gossiping"])
        return f"https://www.ptt.cc/bbs/{board}/M.{random.randint(1700000000,1720000000)}.A.{random.randint(100,999)}.html"
    elif platform == "Dcard":
        return f"https://www.dcard.tw/f/food/p/{random.randint(230000000,240000000)}"
    elif platform == "Google Maps":
        return f"https://maps.google.com/maps/place/文章牛肉湯+安平總店/@23.000{random.randint(100,999)},120.16{random.randint(1000,9999)}"
    elif platform == "Google Search":
        return f"https://www.google.com/search?q=文章牛肉湯+安平總店+評價"
    elif platform == "Facebook Import":
        return f"https://www.facebook.com/groups/tainanfood/posts/{random.randint(1000000,9999999)}"
    return f"https://example.com/review/{pid}"

def _gen_author(platform: str) -> str:
    if platform == "PTT":
        return random.choice(PTT_AUTHORS)
    elif platform == "Dcard":
        return random.choice(DCARD_AUTHORS)
    elif platform == "Google Maps":
        return random.choice(GOOGLE_AUTHORS)
    return random.choice(AUTHORS)

def seed():
    db: Session = SessionLocal()
    try:
        existing_m = db.query(Mention).count()

        # Always reseed if mentions < 100 for fresh case study
        if existing_m >= 100 and existing_m < 140:
            logger.info(f"DB has {existing_m} mentions, forcing reseed for v3.0 case study.")
        elif existing_m >= 140:
            # Check if case study data already present
            cs_count = db.query(Mention).filter(Mention.keyword.has(name=BRAND)).count()
            if cs_count >= 130:
                logger.info(f"Case study already seeded ({cs_count} mentions for {BRAND}). Skipping.")
                return

        # Clear all data
        db.query(Mention).delete()
        db.query(CrawlLog).delete()
        db.query(Keyword).delete()
        db.commit()

        # Create case study keyword
        kw = Keyword(name=BRAND_KEYWORD["name"], group_name=BRAND_KEYWORD["group_name"],
                     is_active=True, platforms=BRAND_KEYWORD["platforms"])
        db.add(kw)
        db.commit()
        db.refresh(kw)
        logger.info(f"Seeded keyword: {BRAND}")

        logger.info("Seed: only keyword created. Real data will come from PTT/Dcard crawl.")

        # Seed crawl logs
        for _ in range(10):
            log = CrawlLog(
                keyword_id=kw.id, platform=random.choice(BRAND_KEYWORD["platforms"].split(",")),
                status=random.choice(["Success", "Success", "Success", "Failed"]),
                items_count=random.randint(3, 20),
                started_at=datetime.datetime.utcnow() - datetime.timedelta(hours=random.randint(1, 72)),
            )
            log.finished_at = log.started_at + datetime.timedelta(seconds=random.randint(5, 60))
            db.add(log)
        db.commit()
        logger.info(f"Seeded crawl logs.")

    except Exception as e:
        logger.error(f"Seed failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
