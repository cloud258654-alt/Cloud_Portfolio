param(
  [Parameter(Mandatory = $false)]
  [string]$ProjectDir = (Get-Location).Path,

  [Parameter(Mandatory = $false)]
  [int]$Port = 43217
)

$ErrorActionPreference = 'Stop'

$resolvedProject = (Resolve-Path -LiteralPath $ProjectDir).Path
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
$cowartRoot = Join-Path $codexHome 'plugins\cache\personal\cowart'

if (-not (Test-Path -LiteralPath $cowartRoot)) {
  throw "Cowart plugin cache was not found: $cowartRoot"
}

$versionDir = Get-ChildItem -LiteralPath $cowartRoot -Directory |
  Sort-Object Name |
  Select-Object -Last 1

if (-not $versionDir) {
  throw "No Cowart plugin versions were found under: $cowartRoot"
}

$viteBin = Join-Path $versionDir.FullName 'node_modules\.bin\vite.cmd'
if (-not (Test-Path -LiteralPath $viteBin)) {
  Write-Host "Cowart dependencies are missing; running npm install..."
  Push-Location -LiteralPath $versionDir.FullName
  try {
    cmd /c npm install
    if ($LASTEXITCODE -ne 0) {
      throw "npm install failed with exit code $LASTEXITCODE"
    }
  } finally {
    Pop-Location
  }
}

$env:COWART_PROJECT_DIR = $resolvedProject
$env:COWART_CANVAS_DIR = Join-Path $resolvedProject 'canvas'
$env:COWART_PORT = [string]$Port

Write-Host "Cowart plugin: $($versionDir.FullName)"
Write-Host "Cowart project: $env:COWART_PROJECT_DIR"
Write-Host "Cowart canvas data: $env:COWART_CANVAS_DIR\pages\<page-id>\cowart-canvas.json"
Write-Host "Cowart requested URL: http://127.0.0.1:$Port/"

Push-Location -LiteralPath $versionDir.FullName
try {
  cmd /c npm run dev -- --host 127.0.0.1 --port $Port
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
