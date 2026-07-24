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

# Map UI Controls
$GridApps          = $Window.FindName("GridApps")
$BtnSelectAll      = $Window.FindName("BtnSelectAll")
$BtnDeselectAll    = $Window.FindName("BtnDeselectAll")
$BtnInstallSelected = $Window.FindName("BtnInstallSelected")
$TxtConsole        = $Window.FindName("TxtConsole")
$TxtHostInfo       = $Window.FindName("TxtHostInfo")
$TxtNewHostname    = $Window.FindName("TxtNewHostname")
$BtnRenameHost     = $Window.FindName("BtnRenameHost")
$TxtTargetDomain   = $Window.FindName("TxtTargetDomain")
$BtnJoinDomain     = $Window.FindName("BtnJoinDomain")
$BtnFlushDns       = $Window.FindName("BtnFlushDns")
$BtnResetWinsock   = $Window.FindName("BtnResetWinsock")
$BtnPingDomain     = $Window.FindName("BtnPingDomain")
$BtnGpUpdate       = $Window.FindName("BtnGpUpdate")
$BtnCleanTemp      = $Window.FindName("BtnCleanTemp")
$BtnSfcScan        = $Window.FindName("BtnSfcScan")
$BtnPowerPlan      = $Window.FindName("BtnPowerPlan")
$BtnDisableTelemetry = $Window.FindName("BtnDisableTelemetry")
$BtnRestartExplorer = $Window.FindName("BtnRestartExplorer")
$BtnRefreshSysInfo = $Window.FindName("BtnRefreshSysInfo")
$TxtSysDetails     = $Window.FindName("TxtSysDetails")

# Console Logger Helper
function Append-ConsoleLog([string]$Msg) {
    $TS = (Get-Date).ToString("HH:mm:ss")
    if ($TxtConsole) {
        $TxtConsole.Dispatcher.Invoke([Action]{
            $TxtConsole.AppendText([Environment]::NewLine + "[$TS] $Msg")
            $TxtConsole.ScrollToEnd()
        })
    }
}

# Initialize Host Header Info
$CurrentHost = $env:COMPUTERNAME
$CurrentDomain = (Get-WmiObject Win32_ComputerSystem).Domain
if ($TxtHostInfo) {
    $TxtHostInfo.Text = "Host: $CurrentHost | Domain: $CurrentDomain"
}
if ($TxtNewHostname) {
    $TxtNewHostname.Text = $CurrentHost
}

# Populate Software Batch Installer Queue
$AppList = New-Object System.Collections.ObjectModel.ObservableCollection[PSCustomObject]
if ($Manifest -and $Manifest.applications) {
    foreach ($app in $Manifest.applications) {
        $AppList.Add([PSCustomObject]@{
            IsSelected        = [bool]$app.mandatory
            Id                = [string]$app.id
            Name              = [string]$app.name
            Category          = [string]$app.category
            EstimatedMB       = "$($app.estimatedMB) MB"
            InstallerFileName = [string]$app.installerFileName
            SilentArgs        = [string]$app.silentArgs
            Status            = "Ready"
        })
    }
}
if ($GridApps) {
    $GridApps.ItemsSource = $AppList
}

# Event Handlers - Software Deployment
if ($BtnSelectAll) {
    $BtnSelectAll.Add_Click({
        foreach ($item in $AppList) { $item.IsSelected = $true }
        if ($GridApps) { $GridApps.Items.Refresh() }
        Append-ConsoleLog "All applications selected."
    })
}

if ($BtnDeselectAll) {
    $BtnDeselectAll.Add_Click({
        foreach ($item in $AppList) { $item.IsSelected = $false }
        if ($GridApps) { $GridApps.Items.Refresh() }
        Append-ConsoleLog "All applications deselected."
    })
}

if ($BtnInstallSelected) {
    $BtnInstallSelected.Add_Click({
        $SelectedApps = $AppList | Where-Object { $_.IsSelected -eq $true }
        if (-not $SelectedApps) {
            Append-ConsoleLog "[!] No applications selected for installation."
            return
        }

        $SSDPath = if ($Manifest.installerRootSSD) { $Manifest.installerRootSSD } else { "D:\ICT_Tools\Installers" }
        Append-ConsoleLog "Starting batch installation of $($SelectedApps.Count) items from $SSDPath..."

        foreach ($app in $SelectedApps) {
            $app.Status = "Installing..."
            if ($GridApps) { $GridApps.Items.Refresh() }
            
            $FullPath = Join-Path $SSDPath $app.InstallerFileName
            Append-ConsoleLog "[*] Installing $($app.Name) ($($app.InstallerFileName))..."

            $Success = Invoke-SoftwareInstaller -AppId $app.Id -InstallerPath $FullPath -SilentArgs $app.SilentArgs
            if ($Success) {
                $app.Status = "Installed"
                Append-ConsoleLog "[+] $($app.Name) installed successfully."
            } else {
                $app.Status = "Failed"
                Append-ConsoleLog "[-] $($app.Name) installation failed (Check log)."
            }
            if ($GridApps) { $GridApps.Items.Refresh() }
        }
        Append-ConsoleLog "[+] Batch installation process complete."
    })
}

# Event Handlers - Admin Tools
if ($BtnRenameHost) {
    $BtnRenameHost.Add_Click({
        $NewName = $TxtNewHostname.Text
        if ([string]::IsNullOrWhiteSpace($NewName)) { return }
        Append-ConsoleLog "[*] Renaming hostname to $NewName..."
        Invoke-PDSITool -ToolId "rename_hostname" -Param1 $NewName
        Append-ConsoleLog "[+] Computer renamed to $NewName. Reboot required."
    })
}

if ($BtnJoinDomain) {
    $BtnJoinDomain.Add_Click({
        $Domain = $TxtTargetDomain.Text
        Append-ConsoleLog "[*] Attempting domain join to $Domain..."
        Invoke-PDSITool -ToolId "join_domain" -Param1 $Domain
        Append-ConsoleLog "[+] Domain join command executed."
    })
}

if ($BtnFlushDns) {
    $BtnFlushDns.Add_Click({
        Invoke-PDSITool -ToolId "flush_dns"
        Append-ConsoleLog "[+] DNS Client cache cleared."
    })
}

if ($BtnResetWinsock) {
    $BtnResetWinsock.Add_Click({
        Invoke-PDSITool -ToolId "reset_winsock"
        Append-ConsoleLog "[+] Winsock & TCP/IP stack reset."
    })
}

if ($BtnPingDomain) {
    $BtnPingDomain.Add_Click({
        $Domain = $TxtTargetDomain.Text
        Append-ConsoleLog "[*] Pinging $Domain..."
        $Ping = Test-Connection -ComputerName $Domain -Count 2 -Quiet -ErrorAction SilentlyContinue
        if ($Ping) {
            Append-ConsoleLog "[+] Domain $Domain is reachable."
        } else {
            Append-ConsoleLog "[-] Domain $Domain is unreachable!"
        }
    })
}

if ($BtnGpUpdate) {
    $BtnGpUpdate.Add_Click({
        Append-ConsoleLog "[*] Executing gpupdate /force..."
        Start-Process -FilePath "gpupdate.exe" -ArgumentList "/force" -NoNewWindow -Wait
        Append-ConsoleLog "[+] Group Policy update completed."
    })
}

# Event Handlers - Tweaks & Fixes
if ($BtnCleanTemp) {
    $BtnCleanTemp.Add_Click({
        Append-ConsoleLog "[*] Cleaning temp files..."
        Invoke-PDSITweak -TweakId "temp_cleanup"
        Append-ConsoleLog "[+] Temp files cleanup completed."
    })
}

if ($BtnSfcScan) {
    $BtnSfcScan.Add_Click({
        Append-ConsoleLog "[*] Launching System File Checker (SFC)..."
        Start-Process -FilePath "sfc.exe" -ArgumentList "/scannow" -NoNewWindow
        Append-ConsoleLog "[+] SFC scannow started in background."
    })
}

if ($BtnPowerPlan) {
    $BtnPowerPlan.Add_Click({
        Invoke-PDSITweak -TweakId "high_performance_power"
        Append-ConsoleLog "[+] High Performance power plan applied."
    })
}

if ($BtnDisableTelemetry) {
    $BtnDisableTelemetry.Add_Click({
        Append-ConsoleLog "[*] Disabling Windows Telemetry services..."
        Stop-Service -Name "DiagTrack" -ErrorAction SilentlyContinue
        Set-Service -Name "DiagTrack" -StartupType Disabled -ErrorAction SilentlyContinue
        Append-ConsoleLog "[+] Telemetry services disabled."
    })
}

if ($BtnRestartExplorer) {
    $BtnRestartExplorer.Add_Click({
        Append-ConsoleLog "[*] Restarting Windows Explorer..."
        Stop-Process -Name "explorer" -Force -ErrorAction SilentlyContinue
        Start-Process "explorer.exe"
        Append-ConsoleLog "[+] Explorer process restarted."
    })
}

# Diagnostics Function
function Update-SystemDiagnostics {
    if (-not $TxtSysDetails) { return }
    $OS = Get-WmiObject Win32_OperatingSystem
    $CPU = Get-WmiObject Win32_Processor
    $RAM = [math]::Round($OS.TotalVisibleMemorySize / 1MB, 2)
    $IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" }).IPAddress -join ", "
    
    $Report = @"
================================================================================
  WORKSTATION DIAGNOSTIC REPORT
================================================================================
Computer Name : $env:COMPUTERNAME
User Account  : $env:USERNAME
OS Name       : $($OS.Caption) ($($OS.OSArchitecture))
OS Version    : $($OS.Version) (Build $($OS.BuildNumber))
Processor     : $($CPU.Name)
Total RAM     : $RAM GB
IPv4 Address  : $IP
Domain / Work : $CurrentDomain
System Uptime : $((Get-Date) - [Management.ManagementDateTimeConverter]::ToDateTime($OS.LastBootUpTime))
================================================================================
"@
    $TxtSysDetails.Text = $Report
}

if ($BtnRefreshSysInfo) {
    $BtnRefreshSysInfo.Add_Click({
        Update-SystemDiagnostics
        Append-ConsoleLog "[+] System diagnostics refreshed."
    })
}

# Initial Diagnostics Load
Update-SystemDiagnostics
Append-ConsoleLog "ICT PDSI Utility GUI ready. $($AppList.Count) software packages loaded in queue."

# Show WPF Window
$Window.ShowDialog() | Out-Null
