# ==============================================================================
# ICT PDSI Utility - Main Controller Script
# ==============================================================================

param(
    [object]$Manifest,
    [string]$RootPath
)

if ([string]::IsNullOrWhiteSpace($RootPath)) {
    $RootPath = if ($PSScriptRoot) { $PSScriptRoot } else { "$env:TEMP\ICT_PDSI_Utility" }
}

# Load Modules
$ModulesDir = Join-Path $RootPath "Modules"
Get-ChildItem -Path "$ModulesDir\*.psm1" -ErrorAction SilentlyContinue | ForEach-Object {
    Import-Module $_.FullName -Force
}

# Load XAML GUI
$XamlFile = Join-Path $RootPath "Xaml\Main.xaml"
if (-not (Test-Path $XamlFile)) {
    Write-Error "Main XAML layout missing at: $XamlFile"
    exit 1
}

$RawXaml = Get-Content -Path $XamlFile -Raw
# Strip x:Class and ignorable attributes that cause XamlReader::Load exceptions in PowerShell
$CleanXaml = $RawXaml -replace 'x:Class="[^"]*"', '' -replace 'mc:Ignorable="[^"]*"', '' -replace 'xmlns:mc="[^"]*"', '' -replace 'd:DesignHeight="[^"]*"', '' -replace 'd:DesignWidth="[^"]*"', ''
[xml]$XamlDoc = $CleanXaml

# Parse WPF XAML Reader
$Reader = (New-Object System.Xml.XmlNodeReader $XamlDoc)
$Window = [System.Windows.Markup.XamlReader]::Load($Reader)

# Map UI Controls by Name
$BtnInstallAll = $Window.FindName("BtnInstallAll")
$BtnRunTools  = $Window.FindName("BtnRunTools")
$TxtConsole    = $Window.FindName("TxtConsole")

# Event Wiring
if ($BtnInstallAll) {
    $BtnInstallAll.Add_Click({
        Invoke-SoftwareDeployment -Manifest $Manifest
    })
}

# Show WPF Window
$Window.ShowDialog() | Out-Null
