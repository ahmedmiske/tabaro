# Script para corregir definitivamente las rutas de import para archivos en pages/
$pagesPath = "C:\Users\Administrador\OneDrive\Desktop\React-Proyect\pryecto-2-ahmed\tabaro\client\src\pages"

# Obtener todos los archivos JS/JSX en páginas
$files = Get-ChildItem -Path $pagesPath -Include "*.js","*.jsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Corregir las rutas incorrectas
    $content = $content -replace "from '\./ui'", "from '../components/ui'"
    
    # Si hubo cambios, escribir el archivo
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Corregido: $($file.Name)"
    }
}

Write-Host "Corrección final de rutas completada"