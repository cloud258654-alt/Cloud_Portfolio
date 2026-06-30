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
    def analyze_content(
        text: str,
        keyword: str,
        likes: int = 0,
        comments: int = 0,
        shares: int = 0,
        is_resolved: bool = False,
        recent_count: int = 0,
        platform: str = ""
    ) -> Dict[str, Any]:
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

        # ----------------- REPUTATION RISK MODEL (0-100) -----------------
        # Factor 1: Negative/Neutral Sentiment (max 25)
        sentiment_score = 0
        if sentiment == "Negative":
            sentiment_score = 25
        elif sentiment == "Neutral":
            sentiment_score = 10

        # Factor 2: Crisis Keywords (max 30)
        # 詐騙, 出事, 爆炸, 毒, 倒閉, 訴訟, 違法, 雷, 踩雷, 客訴, 退費, 消保會, 爆料 etc.
        crisis_words = [
            "詐騙", "出事", "爆炸", "毒", "倒閉", "訴訟", "違法", "雷", "踩雷",
            "客訴", "退費", "消保會", "爆料", "致癌", "召回", "中毒", "停業", "崩潰"
        ]
        matched_keywords = [w for w in crisis_words if w in text_lower]
        keyword_score = 30 if len(matched_keywords) > 0 else 0

        # Factor 3: Engagement (max 15)
        engagement_score = min(15, (likes + comments * 2 + shares * 3) // 5)

        # Factor 4: Platform Sensitivity (max 10)
        p_lower = platform.lower() if platform else ""
        if any(p in p_lower for p in ["facebook", "fb", "threads", "小紅書", "dcard", "tiktok", "import"]):
            platform_score = 10
        elif "ptt" in p_lower:
            platform_score = 8
        elif any(p in p_lower for p in ["google", "map", "search"]):
            platform_score = 5
        else:
            platform_score = 5

        # Factor 5: Unresolved Status (max 10)
        status_score = 0 if is_resolved else 10

        # Factor 6: Repeat Keyword Frequency (max 10)
        if recent_count >= 5:
            frequency_score = 10
        elif recent_count >= 2:
            frequency_score = 5
        else:
            frequency_score = 0

        risk_score = sentiment_score + keyword_score + engagement_score + platform_score + status_score + frequency_score
        risk_score = max(0, min(100, risk_score))

        # Map to Risk Level (Low/Medium/High)
        if risk_score >= 70:
            risk_level = "High"
        elif risk_score >= 30:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Map to Recommended Priority (P0-P3)
        # P0: risk_score >= 90 or matching urgent legal / scam / consumer protection words
        critical_words = ["詐騙", "違法", "消保會", "爆料", "致癌", "中毒"]
        has_critical = any(w in matched_keywords for w in critical_words)
        
        if risk_score >= 90 or has_critical:
            recommended_priority = "P0"
        elif risk_score >= 70:
            recommended_priority = "P1"
        elif risk_score >= 30:
            recommended_priority = "P2"
        else:
            recommended_priority = "P3"

        # Construct Risk Reasons description
        reasons = []
        if sentiment_score > 0:
            reasons.append(f"{sentiment}情緒語氣")
        if keyword_score > 0:
            reasons.append(f"命中危機詞({', '.join(matched_keywords[:4])})")
        if engagement_score > 5:
            reasons.append("社群傳播熱度高")
        if platform_score == 10:
            reasons.append(f"高擴散平台({platform or 'Import'})")
        if status_score > 0:
            reasons.append("事件尚未處置")
        if frequency_score > 0:
            reasons.append("近期出現頻率升溫")
        
        risk_reason = "、".join(reasons) if reasons else "無明顯商譽風險"

        purchase_intent = any(w in text_lower for w in AIService.PURCHASE_INTENT_WORDS)

        if sentiment == "Positive":
            ai_summary = f"文章對「{keyword}」表達正面評價，整體品質與服務令人滿意。"
        elif sentiment == "Negative":
            ai_summary = f"文章對「{keyword}」表達批評，命中危機因素。成因：{risk_reason}。"
        else:
            ai_summary = f"文章中性討論「{keyword}」，用戶進行資訊詢問與交流。"

        if recommended_priority == "P0":
            ai_suggestion = f"⚠ 關鍵品牌商譽危機！命中關鍵字且風險指數極高 ({risk_score}分)。公關團隊應立即召集緊急會議並於 1 小時內發表官方澄清聲明。"
        elif recommended_priority == "P1":
            ai_suggestion = f"🚨 高商譽風險警訊 ({risk_score}分)。建議品牌公關主管於 2 小時內審查並擬定回應策略。"
        elif recommended_priority == "P2":
            ai_suggestion = f"💬 中商譽風險事件 ({risk_score}分)。建議客服專員主動回覆，協助澄清疑慮並解決客訴。"
        else:
            ai_suggestion = f"✅ 低風險訊號 ({risk_score}分)。持續監控該品牌/關鍵字的風險訊號即可。"

        return {
            "sentiment": sentiment,
            "sentiment_score": score,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "risk_reason": risk_reason,
            "crisis_keywords_matched": ",".join(matched_keywords) if matched_keywords else "",
            "recommended_priority": recommended_priority,
            "purchase_intent": purchase_intent,
            "ai_summary": ai_summary,
            "ai_suggestion": ai_suggestion,
            "status": "new" if not is_resolved else "resolved",
        }

    @staticmethod
    def extract_keyphrases(text: str) -> list:
        words = ["產品", "價格", "服務", "客服", "體驗", "品質", "功能", "行銷", "品牌", "口碑"]
        random.shuffle(words)
        return words[:random.randint(1, 3)]
