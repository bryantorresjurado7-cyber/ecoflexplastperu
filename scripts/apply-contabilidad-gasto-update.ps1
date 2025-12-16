<#
PowerShell helper to apply the contabilidad_gasto migration.

Requirements:
- `psql` must be installed and available in PATH OR
- supabase CLI installed and you have logged in via `supabase login`.

Usage (recommended):
1. Set connection string as environment variable `SUPABASE_DB_URL` (ej: from Supabase Project > Settings > Database > Connection string):
   $Env:SUPABASE_DB_URL = 'postgresql://postgres:...@db.XXXXX.supabase.co:5432/postgres'

2a. If you have `psql` installed, run:
   psql $Env:SUPABASE_DB_URL -f "supabase/migrations/20251215_add_currency_to_contabilidad_gasto.sql"

2b. Or, using supabase CLI (you must be logged in):
   supabase db remote set $Env:SUPABASE_DB_URL
   # then push (this will attempt to sync migrations managed by the CLI):
   supabase db push

This script only prints the recommended commands — run them in your shell with appropriate credentials.
#>

Write-Host "=== Apply contabilidad_gasto migration helper ==="

if (-not $Env:SUPABASE_DB_URL) {
    Write-Host "Environment variable SUPABASE_DB_URL is not set. Set it with your connection string from Supabase." -ForegroundColor Yellow
    Write-Host "Example (PowerShell):`n$Env:SUPABASE_DB_URL = 'postgresql://postgres:...@db.XXXXX.supabase.co:5432/postgres'`n"
}

Write-Host "If you have psql installed, run:" -ForegroundColor Cyan
Write-Host "psql $Env:SUPABASE_DB_URL -f \"supabase/migrations/20251215_add_currency_to_contabilidad_gasto.sql\"" -ForegroundColor Green

Write-Host "Or use supabase CLI (ensure you ran 'supabase login' first):" -ForegroundColor Cyan
Write-Host "supabase db remote set $Env:SUPABASE_DB_URL" -ForegroundColor Green
Write-Host "supabase db push" -ForegroundColor Green

Write-Host "Note: If running in Windows without psql, install Postgres client tools or use the Supabase SQL Editor as alternative." -ForegroundColor Yellow
