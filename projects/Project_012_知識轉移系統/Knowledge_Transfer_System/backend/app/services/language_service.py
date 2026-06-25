class LanguageService:
    @staticmethod
    def detect(text: str) -> str:
        if any("\u4e00" <= char <= "\u9fff" for char in text):
            return "zh-TW"
        if any("\u3040" <= char <= "\u30ff" for char in text):
            return "ja"
        return "en"
