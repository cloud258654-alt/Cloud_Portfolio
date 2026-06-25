class OCRService:
    def extract_image_text(self, storage_path: str) -> list[dict]:
        return [
            {
                "page": 1,
                "text": "",
                "bbox": None,
                "confidence": 0.0,
                "language": None,
                "source": storage_path,
            }
        ]
