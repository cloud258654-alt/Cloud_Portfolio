import random
from typing import Dict, Any

class AIService:
    NEGATIVES = [
        "氣死", "爛", "差", "生氣", "抱怨", "過譽", "壞了", "敷衍", "失望", "難用",
        "垃圾", "詐騙", "出事", "爆炸", "毒", "倒閉", "訴訟", "違法", "很爛", "超爛",
        "退貨", "退款", "客訴", "瑕疵", "雷", "踩雷", "後悔", "被騙", "騙人", "糟糕",
        "不值", "太貴", "坑", "地雷", "反推", "不推", "爛透了", "瞎", "傻眼", "無言",
        "爛死", "廢", "崩潰", "品質差", "爛貨", "假貨", "劣質", "敷衍了事",
    ]

    POSITIVES = [
        "推薦", "推坑", "大推", "好用", "方便", "棒", "讚", "質感", "劃算", "實用",
        "滿意", "穩定", "創新", "超讚", "喜歡", "愛", "回購", "必買", "激推",
        "超推", "值得", "入手", "驚艷", "厲害", "專業", "用心", "周到", "佛心",
        "划算", "CP值", "CP高", "物超所值", "五星", "好評", "狂推", "讚爆",
        "神", "很強", "高品質", "舒適", "安心", "信賴", "可靠", "快速", "有效率",
    ]

    HIGH_RISK_WORDS = [
        "詐騙", "出事", "爆炸", "毒", "倒閉", "訴訟", "違法", "氣死", "爛死",
        "假貨", "劣質", "致癌", "召回", "中毒", "停業", "崩潰", "死人", "死亡",
    ]

    PURCHASE_INTENT_WORDS = [
        "想買", "求推薦", "考慮入手", "推坑", "多少錢", "價格是多少", "在哪買",
        "開箱實測", "入手", "買了", "購入", "下單", "預購", "訂購", "比價",
        "哪裡買", "求連結", "折扣", "優惠", "特價", "團購", "心得分享", "好物推薦",
    ]

    @staticmethod
    def analyze_content(text: str, keyword: str) -> Dict[str, Any]:
        text_lower = text.lower()

        neg_count = sum(1 for w in AIService.NEGATIVES if w in text_lower)
        pos_count = sum(1 for w in AIService.POSITIVES if w in text_lower)

        if neg_count > pos_count:
            score = round(-0.5 - (random.random() * 0.4), 2)
            sentiment = "Negative"
        elif pos_count > neg_count:
            score = round(0.5 + (random.random() * 0.4), 2)
            sentiment = "Positive"
        else:
            score = round(-0.2 + (random.random() * 0.4), 2)
            sentiment = "Neutral"

        # Negative priority: if both positive and negative words present, negative takes priority
        if neg_count > 0 and pos_count > 0:
            sentiment = "Negative"
            score = round(-0.3 - (random.random() * 0.3), 2)

        risk_level = "Low"
        if sentiment == "Negative":
            if any(w in text_lower for w in AIService.HIGH_RISK_WORDS):
                risk_level = "High"
            else:
                risk_level = "Medium"

        purchase_intent = any(w in text_lower for w in AIService.PURCHASE_INTENT_WORDS)

        if sentiment == "Positive":
            ai_summary = f"文章對「{keyword}」表達正面評價，提到品質、服務、使用體驗令人滿意。"
        elif sentiment == "Negative":
            ai_summary = f"文章對「{keyword}」表達不滿或批評，涵蓋品質、客服、價格等方面疑慮。"
        else:
            ai_summary = f"文章中性討論「{keyword}」，用戶尋求資訊或進行客觀交流。"

        if risk_level == "High":
            ai_suggestion = f"⚠ 高風險警訊！「{keyword}」相關負面輿情涉及嚴重品質或公共安全議題。公關團隊應立即評估並在 2 小時內制定回應策略。"
        elif risk_level == "Medium":
            ai_suggestion = f"「{keyword}」出現負面討論，建議客服團隊主動追蹤，防止輿情擴大。"
        elif sentiment == "Positive" and purchase_intent:
            ai_suggestion = f"正面品牌聲量且具購買意圖！建議行銷部門投放相關優惠資訊以加速轉化。"
        elif sentiment == "Positive":
            ai_suggestion = f"正面品牌聲量。社群小編可適度互動，提升品牌忠誠度與曝光。"
        else:
            ai_suggestion = f"中立輿情。建議將「{keyword}」納入週報追蹤，無需立即介入。"

        return {
            "sentiment": sentiment,
            "sentiment_score": score,
            "risk_level": risk_level,
            "purchase_intent": purchase_intent,
            "ai_summary": ai_summary,
            "ai_suggestion": ai_suggestion,
            "status": "Processed",
        }

    @staticmethod
    def extract_keyphrases(text: str) -> list:
        words = ["產品", "價格", "服務", "客服", "體驗", "品質", "功能", "行銷", "品牌", "口碑"]
        random.shuffle(words)
        return words[:random.randint(1, 3)]
