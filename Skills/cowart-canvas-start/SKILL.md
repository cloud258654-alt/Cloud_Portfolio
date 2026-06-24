---
name: cowart-canvas-start
description: Start or open the local Cowart infinite canvas for the active Codex project. Use when the user asks to run Cowart, open Cowart, start the Cowart canvas, work in a Cowart canvas, or get the localhost URL for the current project's Cowart workspace.
---

# Cowart Canvas Start

Use this skill to start Cowart for the current Codex workspace and give the user the working local URL.

## Workflow

1. Resolve the active project directory from the current working directory unless the user provides a different path.

2. Start Cowart with the bundled script:

```powershell
powershell -ExecutionPolicy Bypass -File "<this-skill>/scripts/start-cowart-canvas.ps1" -ProjectDir "<project-dir>"
```

The script locates the installed Cowart plugin under `$env:CODEX_HOME\plugins\cache\personal\cowart` or `%USERPROFILE%\.codex\plugins\cache\personal\cowart`, chooses the newest installed version, sets `COWART_PROJECT_DIR`, `COWART_CANVAS_DIR`, and `COWART_PORT`, then runs `npm run dev -- --host 127.0.0.1 --port <port>`.

3. Keep the command session running. Read the Vite output and use the actual `Local:` URL. The requested port is usually `http://127.0.0.1:43217/`, but Vite may choose `43218` or another port if the default is busy.

4. If the in-app browser bridge is available, open the actual local URL and make the browser visible. Do not reload an existing Cowart tab if it is already on the same URL. If browser control is unavailable, report the URL directly.

5. Do not inspect or edit canvas files just to start Cowart. Only inspect Cowart state when the user asks to validate, insert images, or troubleshoot.

## Troubleshooting

- If PowerShell blocks script execution, rerun with `-ExecutionPolicy Bypass`.
- If dependencies are missing and the script runs `npm install`, request network escalation when needed.
- If Vite says the requested port is in use, trust the `Local:` URL it prints.
- If no Cowart plugin is found, tell the user Cowart is not installed in the Codex plugin cache.
