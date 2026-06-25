from app.services.ocr_service import OCRService


def test_ocr_service_returns_page_payload():
    result = OCRService().extract_image_text("documents/general/image.png")

    assert result[0]["page"] == 1
    assert "confidence" in result[0]
