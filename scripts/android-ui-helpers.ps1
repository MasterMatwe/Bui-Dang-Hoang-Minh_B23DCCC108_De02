# Helpers for manual emulator acceptance checks. Does not reset app data.
$script:footballAdb = Join-Path ([Environment]::GetEnvironmentVariable('ANDROID_HOME', 'User')) 'platform-tools\adb.exe'
function Get-FootballUI {
    & $script:footballAdb shell uiautomator dump /sdcard/football-check.xml | Out-Null
    [xml]$result = (& $script:footballAdb shell cat /sdcard/football-check.xml) -join "`n"
    return $result
}
function Find-FootballNode([string]$XPath) {
    for ($attempt = 0; $attempt -lt 6; $attempt++) {
        $tree = Get-FootballUI
        $found = if ($tree) { $tree.SelectSingleNode($XPath) } else { $null }
        if ($found) { return $found }
        Start-Sleep -Milliseconds 400
    }
    throw "UI element not found: $XPath"
}
function Tap-FootballNode([string]$XPath) {
    $found = Find-FootballNode $XPath
    $coordinates = [regex]::Matches($found.bounds, '\d+') | ForEach-Object { [int]$_.Value }
    $tapX = [int](($coordinates[0] + $coordinates[2]) / 2)
    $tapY = [int](($coordinates[1] + $coordinates[3]) / 2)
    & $script:footballAdb shell input tap $tapX $tapY
}
function Set-FootballInput([string]$Id, [string]$Value) {
    $xpath = "//node[@resource-id='$Id']"
    $found = Find-FootballNode $xpath
    Tap-FootballNode $xpath
    & $script:footballAdb shell input keyevent 123
    $deleteKeys = @('67') * ([Math]::Min($found.text.Length, 100) + 1)
    & $script:footballAdb shell input keyevent @deleteKeys
    & $script:footballAdb shell input text $Value
    & $script:footballAdb shell input keyevent 4
    Get-FootballUI | Out-Null
}
function Show-FootballUI {
    (Get-FootballUI).SelectNodes('//node[@text!="" or @content-desc!=""]') | ForEach-Object {
        '{0} | {1} | {2} | enabled={3}' -f $_.text,$_.GetAttribute('content-desc'),$_.bounds,$_.enabled
    }
}
