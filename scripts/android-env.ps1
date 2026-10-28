# Dot-source: . .\scripts\android-env.ps1
$ErrorActionPreference = 'Stop'
$footballJdk = [Environment]::GetEnvironmentVariable('JAVA_HOME', 'User')
$footballSdk = [Environment]::GetEnvironmentVariable('ANDROID_HOME', 'User')
if (-not $footballJdk -or -not (Test-Path -LiteralPath "$footballJdk\bin\java.exe")) {
    throw 'JAVA_HOME must point to a valid JDK 17 installation.'
}
if (-not $footballSdk -or -not (Test-Path -LiteralPath "$footballSdk\platform-tools\adb.exe")) {
    throw 'ANDROID_HOME must point to the Android SDK.'
}
$env:JAVA_HOME = $footballJdk
$env:ANDROID_HOME = $footballSdk
$env:Path = "$footballJdk\bin;$footballSdk\platform-tools;$footballSdk\emulator;$footballSdk\cmdline-tools\latest\bin;$env:Path"
Write-Host "JAVA_HOME=$footballJdk"
Write-Host "ANDROID_HOME=$footballSdk"
