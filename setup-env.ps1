# PharmaPay Ledger - Environment Setup Script for Windows
# This script creates the .env.local file with your Supabase credentials

Write-Host "PharmaPay Ledger - Environment Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local already exists
if (Test-Path ".env.local") {
    Write-Host "WARNING: .env.local file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit
    }
}

# Create .env.local file
$envContent = @"
VITE_SUPABASE_URL=https://atgazgkilvuznodbubxs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Z2F6Z2tpbHZ1em5vZGJ1YnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkzMDgsImV4cCI6MjA3NzAzNTMwOH0.EKyKcxAuY3pu17nF5Tqg5tBEznp0pI0hkDwFuQ_a7Cs
"@

Set-Content -Path ".env.local" -Value $envContent

Write-Host "[SUCCESS] .env.local file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "   Supabase URL: https://atgazgkilvuznodbubxs.supabase.co" -ForegroundColor White
Write-Host "   API Key: eyJhbGci...Q_a7Cs (configured)" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Run the database setup script in Supabase SQL Editor" -ForegroundColor White
Write-Host "      File: supabase/setup-database.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Install dependencies:" -ForegroundColor White
Write-Host "      npm install" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Start the development server:" -ForegroundColor White
Write-Host "      npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   4. Open your browser at:" -ForegroundColor White
Write-Host "      http://localhost:8080" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   - DATABASE_SETUP.md" -ForegroundColor White
Write-Host "   - DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "Setup complete! Happy coding!" -ForegroundColor Green
