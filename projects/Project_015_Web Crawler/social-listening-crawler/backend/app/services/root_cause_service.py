from typing import Dict, List, Tuple, Optional

CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "餐點品質": ["好吃", "不好吃", "肉質", "牛肉", "湯頭", "太鹹", "太淡", "美味", "難吃", "口感", "新鮮", "嫩", "柴", "腥", "調味", "滷", "熬", "原味"],
    "排隊等待": ["排隊", "等很久", "等待", "人很多", "出餐慢", "排超久", "排了", "大排長龍", "等超久", "等太久", "等到", "排到", "人潮", "排隊人潮"],
    "服務態度": ["態度", "服務", "店員", "不耐煩", "親切", "冷漠", "口氣", "臉臭", "熱情", "招呼", "愛理不理", "兇", "態度差", "服務生"],
    "停車便利": ["停車", "車位", "不好停", "交通", "停車場", "路邊", "難停", "機車", "汽車", "停車位", "停車格"],
    "價格": ["價格", "太貴", "CP值", "划算", "便宜", "貴", "價位", "小貴", "物超所值", "不便宜", "合理", "偏貴"],
    "環境整潔": ["環境", "乾淨", "髒", "座位", "擁擠", "舒適", "整潔", "衛生", "蒼蠅", "蚊子", "冷氣", "空調", "裝潢", "空間"],
    "衛生疑慮": ["衛生", "拉肚子", "食安", "不乾淨", "肚子痛", "腸胃", "噁心", "髒亂", "油膩", "黏黏", "蟑螂", "老鼠"],
    "份量": ["份量", "大碗", "小碗", "吃不飽", "太少", "很多", "量少", "量多", "夠吃", "吃不夠"],
    "再次回訪": ["再訪", "二訪", "回來", "再來", "不會再來", "回訪", "再吃", "回購", "老客戶", "常客"],
    "推薦意願": ["推薦", "不推", "推", "大推", "必吃", "必訪", "值得", "不值得", "踩雷", "雷", "地雷"],
    "其他": [],
}


class RootCauseService:
    @staticmethod
    def analyze(title: str, content: str) -> Dict:
        text = (title or "") + " " + (content or "")

        matched_categories: List[Tuple[str, int]] = []
        for category, keywords in CATEGORY_KEYWORDS.items():
            if category == "其他":
                continue
            count = sum(1 for kw in keywords if kw in text)
            if count > 0:
                matched_categories.append((category, count))

        matched_categories.sort(key=lambda x: x[1], reverse=True)

        if not matched_categories:
            return {
                "root_cause_category": "其他",
                "root_cause_tags": [],
                "risk_reason": "無明顯商譽風險",
                "suggested_action": "持續監控該品牌社群聲量即可。",
            }

        primary_category = matched_categories[0][0]
        tags = [cat for cat, _ in matched_categories[:3]]

        risk_reason_parts = []
        for cat, cnt in matched_categories[:3]:
            risk_reason_parts.append(f"{cat}疑慮")

        suggested_actions = {
            "餐點品質": "建議品管團隊檢視食材品質與烹調流程，並在社群回覆中說明改善措施。",
            "排隊等待": "建議優化排隊動線或導入號碼牌系統，並在社群公告尖峰時段與等待時間資訊。",
            "服務態度": "建議加強員工服務訓練，並由主管親自回覆負評表達歉意與改善承諾。",
            "停車便利": "建議在社群公告附近停車場資訊，並評估提供停車優惠方案。",
            "價格": "建議檢視定價策略，並在社群說明食材成本與品質定位。",
            "環境整潔": "建議加強清潔頻率，並由店長巡檢確認環境狀況。",
            "衛生疑慮": "⚠ 高度警訊！建議立即通報衛生主管，全面檢查廚房與用餐環境衛生，並發布官方聲明。",
            "份量": "建議檢視份量標準化，並在菜單標示清楚份量資訊。",
            "再次回訪": "若為負面評價，建議透過客服或社群回覆關懷，了解不滿意原因並提出補償方案。",
            "推薦意願": "若為負面評價，建議主動聯繫顧客了解問題，並邀請再次體驗以挽回信任。",
        }

        action = suggested_actions.get(primary_category, "建議關注該類別相關評論，並適時回應。")

        return {
            "root_cause_category": primary_category,
            "root_cause_tags": tags,
            "risk_reason": "、".join(risk_reason_parts) if risk_reason_parts else "無明顯商譽風險",
            "suggested_action": action,
        }
