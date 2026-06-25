# Prompt Library

This folder contains the canonical prompt operating contracts for KTS.

## Structure

- `Master_Prompt_Library.md`: Prompt architecture and governance rules.
- `prompt_manifest.json`: Registry of active prompt assets.
- `system/`: Global system prompts.
- `tasks/`: Task-specific prompts.
- `agents/`: Agent role prompts.
- `templates/`: Output templates.
- `test_cases/`: Prompt regression cases.
- `versions/`: Prompt changelog and version records.

Production prompt loading should use `prompt_manifest.json` and prompt file metadata rather than hard-coded strings.
