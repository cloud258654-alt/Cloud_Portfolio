from pathlib import Path


class BaseParser:
    name = "base_parser"

    def parse(self, storage_path: str, fallback_title: str) -> str:
        return f"{fallback_title}\nSource path: {storage_path}"


class PDFParser(BaseParser):
    name = "pdf_parser"

    def parse(self, storage_path: str, fallback_title: str) -> str:
        return f"{fallback_title}\nPDF content pending binary extraction. Source path: {storage_path}"


class WordParser(BaseParser):
    name = "word_parser"

    def parse(self, storage_path: str, fallback_title: str) -> str:
        return f"{fallback_title}\nWord document content pending binary extraction. Source path: {storage_path}"


class ExcelParser(BaseParser):
    name = "excel_parser"

    def parse(self, storage_path: str, fallback_title: str) -> str:
        return f"{fallback_title}\nSpreadsheet content pending binary extraction. Source path: {storage_path}"


class PowerPointParser(BaseParser):
    name = "powerpoint_parser"

    def parse(self, storage_path: str, fallback_title: str) -> str:
        return f"{fallback_title}\nPresentation content pending binary extraction. Source path: {storage_path}"


class MarkdownParser(BaseParser):
    name = "markdown_parser"


class TextParser(BaseParser):
    name = "text_parser"


class CSVParser(BaseParser):
    name = "csv_parser"


class DocumentParser:
    text_extensions = {"txt", "md", "csv"}
    office_extensions = {"docx", "pptx", "xlsx"}
    pdf_extensions = {"pdf"}
    strategies = {
        "pdf": PDFParser(),
        "docx": WordParser(),
        "xlsx": ExcelParser(),
        "pptx": PowerPointParser(),
        "md": MarkdownParser(),
        "txt": TextParser(),
        "csv": CSVParser(),
    }

    def parse(self, *, storage_path: str, file_type: str | None, fallback_title: str) -> dict:
        extension = (file_type or Path(storage_path).suffix.lstrip(".")).lower()
        parser = self.strategies.get(extension, BaseParser())
        text = parser.parse(storage_path, fallback_title)

        return {
            "text": text,
            "pages": [{"page": 1, "text": text}],
            "parser": parser.name,
        }
