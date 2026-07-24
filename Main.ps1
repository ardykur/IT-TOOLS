# ==============================================================================
# ICT PDSI Utility - Main Controller Script
# ==============================================================================

param(
    [object]$Manifest
)

# Load Modules
Get-ChildItem -Path "$PSScriptRoot\Modules\*.psm1" | ForEach-Object {
    Import-Module $_.FullName -Force
}

# Load XAML GUI
$XamlFile = "$PSScriptRoot\Xaml\Main.xaml"
[xml]$XamlDoc = Get-Content -Path $XamlFile -Raw

# Parse WPF XAML Reader
$Reader = (New-Object System.Xml.XmlNodeReader $XamlDoc)
$Window = [Windows.Markup.XamlReader]::Load($Reader)

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
