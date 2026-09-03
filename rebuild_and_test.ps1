# PowerShell script to rebuild the app with fresh environment
Write-Host "`n🔄 Rebuilding Expo app with fresh environment...`n" -ForegroundColor Cyan

# 1. Show current environment
Write-Host "📋 Current Environment:" -ForegroundColor Yellow
Write-Host "EXPO_PUBLIC_SUPABASE_URL: $env:EXPO_PUBLIC_SUPABASE_URL"
if (Test-Path .env) {
    Write-Host "`n.env file contents:" -ForegroundColor Yellow
    Get-Content .env | Where-Object { $_ -match '^EXPO_PUBLIC' }
}

# 2. Clear Expo cache
Write-Host "`n🧹 Clearing Expo cache..." -ForegroundColor Yellow
npx expo start --clear

Write-Host "`n✅ Done! Check the console output above.`n" -ForegroundColor Green
Write-Host "The app should now use the correct Supabase URL from .env" -ForegroundColor Green
Write-Host "`nIf you still see '/rest/v1/rest/v1/' errors:" -ForegroundColor Yellow
Write-Host "1. Stop the dev server (Ctrl+C)" -ForegroundColor White
Write-Host "2. Clear your browser cache or use incognito mode" -ForegroundColor White
Write-Host "3. Run: npx expo start --clear again" -ForegroundColor White
