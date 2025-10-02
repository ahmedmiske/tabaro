# Script para corregir las rutas de importación de los archivos de páginas
$pagesPath = "C:\Users\Administrador\OneDrive\Desktop\React-Proyect\pryecto-2-ahmed\tabaro\client\src\pages"

# Obtener todos los archivos JS/JSX en páginas
$files = Get-ChildItem -Path $pagesPath -Include "*.js","*.jsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Corregir las rutas de import para archivos en pages/
    $content = $content -replace "import \{ ([^}]+) \} from '\./ui';", "import { `$1 } from '../components/ui';"
    
    # Si hubo cambios, escribir el archivo
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Corregido: $($file.Name)"
    }
}

Write-Host "Corrección de rutas completada"