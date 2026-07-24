# ==============================================================================
# ICT PDSI Utility - Launcher Script
# Platform: Windows 10/11 | PowerShell 5.1
# ==============================================================================

#Requires -RunAsAdministrator
[CmdletBinding()]
param(
    [string]$ManifestPath,
    [switch]$SkipUpdate,
    [string]$RootPath
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Bypass ExecutionPolicy for current process
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force -ErrorAction SilentlyContinue

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  ICT PDSI Utility v1.0.0 - Launcher" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

# Resolve Base Directory (Handles 'iwr | iex' in-memory execution)
if ([string]::IsNullOrWhiteSpace($RootPath)) {
    if ([string]::IsNullOrWhiteSpace($PSScriptRoot)) {
        $RootPath = "$env:TEMP\ICT_PDSI_Utility"
        Write-Host "[*] In-memory pipeline execution detected. Using work directory: $RootPath" -ForegroundColor Yellow
    } else {
        $RootPath = $PSScriptRoot
    }
}

if ([string]::IsNullOrWhiteSpace($ManifestPath)) {
    $ManifestPath = Join-Path $RootPath "Config\Manifest.json"
}

# Auto-Download Repository Zip if Config/Manifest.json is missing locally
if (-not (Test-Path -Path $ManifestPath)) {
    Write-Host "[!] Manifest file missing at: $ManifestPath" -ForegroundColor Yellow
    Write-Host "[*] Auto-downloading full IT-TOOLS repository from GitHub..." -ForegroundColor Cyan

    $ZipUrl = "https://github.com/ardykur/IT-TOOLS/archive/refs/heads/main.zip"
    $ZipFile = Join-Path $env:TEMP "IT-TOOLS-main.zip"
    $ExtractDir = Join-Path $env:TEMP "IT-TOOLS-extract"

    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipFile -UseBasicParsing
        
        if (Test-Path $ExtractDir) { Remove-Item $ExtractDir -Recurse -Force }
        Expand-Archive -Path $ZipFile -DestinationPath $ExtractDir -Force

        if (-not (Test-Path $RootPath)) { New-Item -ItemType Directory -Path $RootPath -Force | Out-Null }
        
        Get-ChildItem -Path "$ExtractDir\IT-TOOLS-main\*" | Copy-Item -Destination $RootPath -Recurse -Force

        Remove-Item $ZipFile -Force -ErrorAction SilentlyContinue
        Remove-Item $ExtractDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "[+] Repository successfully downloaded & extracted to: $RootPath" -ForegroundColor Green
    } catch {
        Write-Error "Failed to download repository files from $ZipUrl : $_"
        exit 1
    }
}

# Unblock all extracted script files (removes Windows Mark-of-the-Web block)
Get-ChildItem -Path $RootPath -Recurse -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue

# 1. Load Local Manifest Configuration
if (-not (Test-Path -Path $ManifestPath)) {
    Write-Error "Manifest file not found at: $ManifestPath"
    exit 1
}

$Manifest = Get-Content -Path $ManifestPath -Encoding UTF8 | ConvertFrom-Json
Write-Host "[+] Local Manifest Loaded: Version $($Manifest.version)" -ForegroundColor Green

# 2. Call Bootstrap Script
$BootstrapScript = Join-Path $RootPath "Bootstrap.ps1"
if (Test-Path -Path $BootstrapScript) {
    & $BootstrapScript -ManifestObj $Manifest -RootPath $RootPath
} else {
    Write-Error "Bootstrap script missing: $BootstrapScript"
    exit 1
}
