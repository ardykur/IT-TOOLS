# ==============================================================================
# ICT PDSI Utility - Bootstrap Script
# ==============================================================================

param(
    [Parameter(Mandatory=$true)]
    [object]$ManifestObj
)

Write-Host "[*] Bootstrapping ICT PDSI Utility environment..." -ForegroundColor Cyan

# Load WPF and Windows Presentation Framework Assemblies
Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase

# Check PowerShell Version
if ($PSVersionTable.PSVersion.Major -lt 5) {
    [System.Windows.MessageBox]::Show("ICT PDSI Utility requires PowerShell 5.1 or newer.", "Error", "OK", "Error")
    exit 1
}

# Initialize Logger Module
$LoggerModule = "$PSScriptRoot\Modules\Logger.psm1"
if (Test-Path -Path $LoggerModule) {
    Import-Module $LoggerModule -Force
    Write-PDSIlog -Action "Bootstrap" -Result "PowerShell & WPF Assemblies Loaded" -Status "SUCCESS"
}

# Launch Main GUI Engine
$MainScript = "$PSScriptRoot\Main.ps1"
if (Test-Path -Path $MainScript) {
    & $MainScript -Manifest $ManifestObj
} else {
    Write-Error "Main GUI script not found: $MainScript"
}
