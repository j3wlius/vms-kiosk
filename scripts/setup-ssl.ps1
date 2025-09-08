# SSL Setup Script for Kiosk App
# This script downloads mkcert and sets up local HTTPS certificates

Write-Host "Setting up SSL certificates for local development..." -ForegroundColor Green

# Check if mkcert already exists
if (Test-Path "mkcert.exe") {
    Write-Host "mkcert.exe already exists, skipping download..." -ForegroundColor Yellow
} else {
    Write-Host "Downloading mkcert..." -ForegroundColor Blue
    try {
        Invoke-WebRequest -Uri "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe" -OutFile "mkcert.exe"
        Write-Host "mkcert downloaded successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download mkcert: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Install the local CA
Write-Host "Installing local CA..." -ForegroundColor Blue
try {
    & ".\mkcert.exe" -install
    Write-Host "Local CA installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to install local CA: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if certificates already exist
if ((Test-Path "localhost+2.pem") -and (Test-Path "localhost+2-key.pem")) {
    Write-Host "SSL certificates already exist, skipping generation..." -ForegroundColor Yellow
} else {
    Write-Host "Generating SSL certificates..." -ForegroundColor Blue
    try {
        & ".\mkcert.exe" localhost 127.0.0.1 ::1
        Write-Host "SSL certificates generated successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Failed to generate certificates: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host "SSL setup completed successfully!" -ForegroundColor Green
Write-Host "You can now run 'pnpm dev' to start the HTTPS development server." -ForegroundColor Cyan
Write-Host "The app will be available at: https://localhost:5173" -ForegroundColor Cyan

