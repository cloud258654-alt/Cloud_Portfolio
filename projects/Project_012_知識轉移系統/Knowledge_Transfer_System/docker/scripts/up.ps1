Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$dockerDir = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $dockerDir
try {
    docker compose --env-file ../.env -f docker-compose.yml up -d @args
}
finally {
    Pop-Location
}
