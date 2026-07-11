$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'

Write-Host 'Starting backend API...' -ForegroundColor Green
Start-Process -FilePath 'python' -ArgumentList '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000' -WorkingDirectory $backend

Write-Host 'Starting frontend dev server...' -ForegroundColor Green
Start-Process -FilePath 'npm' -ArgumentList 'run', 'dev', '--', '--host', '127.0.0.1' -WorkingDirectory $frontend
