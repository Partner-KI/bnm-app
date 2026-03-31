# ============================================================
# BNM Push-Notification Deploy-Script
# Führt alles aus: Edge Function + Datenbank-Webhooks
# ============================================================

$PROJECT_REF = "cufuikcxliwbmyhwlmga"
$SCRIPT_DIR  = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BNM Push-Notification Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Du brauchst einen Supabase Personal Access Token." -ForegroundColor Yellow
Write-Host "Öffne jetzt: https://supabase.com/dashboard/account/tokens" -ForegroundColor Yellow
Write-Host ""
Start-Process "https://supabase.com/dashboard/account/tokens"
Write-Host "Gib deinen Access Token ein (Eingabe wird nicht angezeigt):" -ForegroundColor White
$SecureToken = Read-Host -AsSecureString
$TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureToken)
)

if (-not $TOKEN -or $TOKEN.Length -lt 10) {
    Write-Host "❌ Kein gültiger Token eingegeben. Abbruch." -ForegroundColor Red
    exit 1
}

# ---- SCHRITT 1: Edge Function deployen ----
Write-Host ""
Write-Host "▶ Schritt 1/2: Edge Function 'send-push' deployen..." -ForegroundColor Cyan

$env:SUPABASE_ACCESS_TOKEN = $TOKEN

Push-Location $SCRIPT_DIR
$deployResult = npx supabase functions deploy send-push --project-ref $PROJECT_REF 2>&1
Pop-Location

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Edge Function Deploy fehlgeschlagen:" -ForegroundColor Red
    Write-Host $deployResult
    exit 1
}
Write-Host "✅ Edge Function erfolgreich deployed!" -ForegroundColor Green

# ---- SCHRITT 2: Datenbank-Webhooks (Trigger) anlegen ----
Write-Host ""
Write-Host "▶ Schritt 2/2: Datenbank-Webhooks (Trigger) anlegen..." -ForegroundColor Cyan

$SQL = Get-Content -Path "$SCRIPT_DIR\supabase\setup-webhooks.sql" -Raw
$SQL = $SQL -replace '"', '\"'   # JSON-Escaping

$body = @{ query = $SQL } | ConvertTo-Json -Compress

try {
    $response = Invoke-RestMethod `
        -Method POST `
        -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" `
        -Headers @{
            Authorization  = "Bearer $TOKEN"
            "Content-Type" = "application/json"
        } `
        -Body $body `
        -ErrorAction Stop

    Write-Host "✅ Datenbank-Webhooks (Trigger) erfolgreich angelegt!" -ForegroundColor Green
    Write-Host ""
    Write-Host $response | ConvertTo-Json -Depth 5
}
catch {
    Write-Host "❌ Fehler beim Anlegen der Webhooks:" -ForegroundColor Red
    Write-Host $_.Exception.Message

    # Fallback: SQL-Datei anzeigen und Dashboard öffnen
    Write-Host ""
    Write-Host "Fallback: Führe das SQL manuell im Supabase Dashboard aus." -ForegroundColor Yellow
    Write-Host "Öffne: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new" -ForegroundColor Yellow
    Start-Process "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
    Write-Host ""
    Write-Host "SQL-Inhalt (kopieren & einfügen):" -ForegroundColor White
    Write-Host "------------------------------------"
    Get-Content -Path "$SCRIPT_DIR\supabase\setup-webhooks.sql"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Alles erledigt!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Push-Notifications sind jetzt aktiv:" -ForegroundColor White
Write-Host "  🔔 Chat-Nachrichten → send-push Edge Function" -ForegroundColor White
Write-Host "  🔔 Admin-Nachrichten → send-push Edge Function" -ForegroundColor White
Write-Host ""
Write-Host "Test: Schick eine Nachricht → der Empfänger bekommt Push, auch wenn App geschlossen." -ForegroundColor Yellow
Write-Host ""

# Cleanup token from env
$env:SUPABASE_ACCESS_TOKEN = ""

[console]::beep(900,300)
