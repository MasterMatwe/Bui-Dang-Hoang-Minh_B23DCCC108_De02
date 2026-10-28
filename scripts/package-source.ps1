param(
    [Parameter(Mandatory = $true)][string]$FullName,
    [Parameter(Mandatory = $true)][string]$StudentId
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$projectRoot = Split-Path -Parent $PSScriptRoot
$safeName = $FullName.Trim() -replace '[\s<>:"/\\|?*]+', '_'
$safeId = $StudentId.Trim() -replace '[\s<>:"/\\|?*]+', '_'
if (-not $safeName -or -not $safeId) { throw 'FullName and StudentId are required.' }
$outputDir = Join-Path $projectRoot 'releases'
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
$outputFile = Join-Path $outputDir ($safeName + '_' + $safeId + '_De2.zip')
if (Test-Path -LiteralPath $outputFile) { throw "Archive already exists: $outputFile" }
Push-Location -LiteralPath $projectRoot
try {
    $files = & rg --files --hidden -g '!node_modules/**' -g '!.git/**' -g '!**/build/**' -g '!**/.gradle/**' -g '!**/.cxx/**' -g '!**/.kotlin/**' -g '!ios/Pods/**' -g '!releases/**' -g '!coverage/**' -g '!**/local.properties' -g '!*.log' -g '!**/.DS_Store' -g '!**/xcuserdata/**' -g '!**/.xcode.env.local' -g '!**/*.tsbuildinfo' -g '!.idea/**'
    if ($LASTEXITCODE -ne 0) { throw 'Unable to enumerate source files with rg.' }
    $archive = [IO.Compression.ZipFile]::Open($outputFile, [IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($relativePath in $files) {
            $source = Join-Path $projectRoot $relativePath
            $entry = 'FootballFieldApp/' + $relativePath.Replace('\', '/')
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $source, $entry, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    } finally { $archive.Dispose() }
    Write-Output $outputFile
} finally { Pop-Location }
