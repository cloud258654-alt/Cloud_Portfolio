from pathlib import Path


class PromptLoader:
    def __init__(self, prompt_root: Path | None = None) -> None:
        self.prompt_root = prompt_root or Path(__file__).resolve().parents[3] / "prompts"

    def load(self, name: str) -> str:
        path = self.prompt_root / name
        if not path.exists():
            return ""
        return path.read_text(encoding="utf-8")
