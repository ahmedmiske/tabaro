# Script para migrar imports de react-bootstrap a nuestro sistema UI
$clientPath = "C:\Users\Administrador\OneDrive\Desktop\React-Proyect\pryecto-2-ahmed\tabaro\client\src"

# Obtener todos los archivos JS/JSX
$files = Get-ChildItem -Path $clientPath -Recurse -Include "*.js","*.jsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Reemplazar imports básicos de react-bootstrap
    $content = $content -replace "import \{ ([^}]+) \} from 'react-bootstrap';", "import { `$1 } from './ui';"
    $content = $content -replace "import \{ ([^}]+) \} from 'react-bootstrap';", "import { `$1 } from '../ui';"
    
    # Para archivos en pages/, ajustar la ruta
    if ($file.DirectoryName -like "*\pages\*") {
        $content = $content -replace "import \{ ([^}]+) \} from '\./ui';", "import { `$1 } from '../components/ui';"
    }
    
    # Si hubo cambios, escribir el archivo
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Actualizado: $($file.Name)"
    }
}

Write-Host "Migración completada"