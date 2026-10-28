param([switch]$ActiveArchOnly)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\android-env.ps1"
$footballProject = Split-Path -Parent $PSScriptRoot
$footballLink = Join-Path $env:USERPROFILE 'FootballFieldApp'
if ($footballProject -match '[^\x00-\x7F]') {
    if (-not (Test-Path -LiteralPath $footballLink)) {
        throw 'Create an ASCII junction to this project first; see docs/MOI_TRUONG.md.'
    }
    $footballActual = (Get-Item -LiteralPath $footballLink).Target
    if (-not $footballActual -or [IO.Path]::GetFullPath([string]$footballActual).TrimEnd('\') -ne [IO.Path]::GetFullPath($footballProject).TrimEnd('\')) {
        throw 'The ASCII junction points to a different project.'
    }
    $footballProject = $footballLink
}
Push-Location -LiteralPath $footballProject
try {
    if ($ActiveArchOnly) { & npx.cmd react-native run-android --active-arch-only }
    else { & npx.cmd react-native run-android }
    $footballExit = $LASTEXITCODE
} finally {
    Pop-Location
}
exit $footballExit
