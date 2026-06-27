import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class OCRService:
    def extract_image_text(self, storage_path: str) -> list[dict]:
        path = Path(storage_path)
        if not path.exists():
            return [{"page": 1, "text": "", "confidence": 0.0, "source": storage_path}]

        try:
            from PIL import Image
            import pytesseract

            img = Image.open(path)
            text = pytesseract.image_to_string(img, lang="chi_tra+eng")
            return [
                {
                    "page": 1,
                    "text": text.strip(),
                    "confidence": 0.85,
                    "language": "chi_tra+eng",
                    "source": storage_path,
                }
            ]
        except Exception as e:
            logger.warning("OCR failed for %s: %s", storage_path, e)
            return [{"page": 1, "text": "", "confidence": 0.0, "source": storage_path}]
