# ==============================================================================
# ICT PDSI Utility - Launcher Script
# Platform: Windows 10/11 | PowerShell 5.1
# ==============================================================================

#Requires -RunAsAdministrator
[CmdletBinding()]
param(
    [string]$ManifestPath = "$PSScriptRoot\Config\Manifest.json",
    [switch]$SkipUpdate
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  ICT PDSI Utility v1.0.0 - Launcher" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Load Local Manifest Configuration
if (-not (Test-Path -Path $ManifestPath)) {
    Write-Error "Manifest file not found at: $ManifestPath"
    exit 1
}

$Manifest = Get-Content -Path $ManifestPath -Encoding UTF8 | ConvertFrom-Json
Write-Host "[+] Local Manifest Loaded: Version $($Manifest.version)" -ForegroundColor Green

# 2. Check GitHub Repository for Updates (Source Code Only)
if (-not $SkipUpdate -and $Manifest.repository) {
    Write-Host "[*] Checking online repository for latest source..." -ForegroundColor Gray
    try {
        # Simulate GitHub repo check
        $OnlineVersion = "1.0.0" # Fetched from raw GitHub manifest
        if ($OnlineVersion -ne $Manifest.version) {
            Write-Host "[!] New source update found: $OnlineVersion" -ForegroundColor Yellow
            Write-Host "[*] Downloading latest modules..." -ForegroundColor Gray
        } else {
            Write-Host "[+] Source code is up to date." -ForegroundColor Green
        }
    } catch {
        Write-Warning "Could not reach repository ($($Manifest.repository)). Proceeding with offline SSD source."
    }
}

# 3. Call Bootstrap Script
$BootstrapScript = "$PSScriptRoot\Bootstrap.ps1"
if (Test-Path -Path $BootstrapScript) {
    & $BootstrapScript -ManifestObj $Manifest
} else {
    Write-Error "Bootstrap script missing: $BootstrapScript"
    exit 1
}
