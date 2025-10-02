# Script para iniciar el servidor de desarrollo React
Set-Location "C:\Users\Administrador\OneDrive\Desktop\React-Proyect\pryecto-2-ahmed\tabaro\client"
Write-Host "Iniciando servidor de desarrollo en:" (Get-Location)
Write-Host "Verificando package.json..." (Test-Path "package.json")

if (Test-Path "package.json") {
    Write-Host "Package.json encontrado, iniciando servidor..."
    npm start
} else {
    Write-Host "ERROR: No se encuentra package.json en el directorio actual"
    Get-Location
    Get-ChildItem
}