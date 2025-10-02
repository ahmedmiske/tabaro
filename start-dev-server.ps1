# React Development Server Starter
# This script starts the React development server in the correct directory

Write-Host "🚀 Starting React Development Server..." -ForegroundColor Green
Write-Host "📁 Navigating to client directory..." -ForegroundColor Yellow

# Navigate to the correct directory
Set-Location "C:\Users\Administrador\OneDrive\Desktop\React-Proyect\pryecto-2-ahmed\tabaro\client"

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found! Please check the directory path." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found package.json" -ForegroundColor Green

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "🎯 Starting the development server..." -ForegroundColor Cyan
Write-Host "🌐 The app will open at: http://localhost:3000" -ForegroundColor Magenta

# Start the React development server
npm start

Write-Host "👋 Server stopped." -ForegroundColor Yellow