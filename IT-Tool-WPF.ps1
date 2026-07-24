# ============================================
# ICT PDSI - IT INTERNAL TOOL - OFFLINE SSD
# Version: 1.1.0
# ============================================

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName Microsoft.VisualBasic

# ============================================
# AUTO RUN AS ADMINISTRATOR
# ============================================

$CurrentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$Principal = New-Object Security.Principal.WindowsPrincipal($CurrentUser)

if (-not $Principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Start-Process powershell.exe `
        -ArgumentList "-ExecutionPolicy Bypass -File `"$PSCommandPath`"" `
        -Verb RunAs
    exit
}

# ============================================
# BASE PATH SSD
# ============================================

$BasePath = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallerPath = Join-Path $BasePath "Installers"
$LogPath = Join-Path $BasePath "Logs"

if (!(Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath | Out-Null
}

$LogFile = Join-Path $LogPath "IT-Tool-Log.txt"

# ============================================
# COMMON FUNCTIONS
# ============================================

function Write-Log {
    param([string]$Message)
    $Time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$Time - $Message" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}

function Add-Output {
    param([string]$Message)

    Write-Log $Message

    if ($null -ne $TxtConfigOutput) {
        $Time = Get-Date -Format "HH:mm:ss"
        $TxtConfigOutput.AppendText("[$Time] $Message`r`n")
        $TxtConfigOutput.ScrollToEnd()
    }
}

function Show-Msg {
    param([string]$Message)
    [System.Windows.MessageBox]::Show($Message, "ICT PDSI IT Tool")
}

function Test-Installer {
    param([string]$FilePath)

    if (!(Test-Path $FilePath)) {
        Show-Msg "File installer tidak ditemukan:`n$FilePath"
        Write-Log "ERROR file tidak ditemukan: $FilePath"
        return $false
    }

    return $true
}

function Run-Installer {
    param(
        [string]$FilePath,
        [string]$Arguments
    )

    if (Test-Installer $FilePath) {
        try {
            Write-Log "RUN INSTALLER: $FilePath $Arguments"

            if ([string]::IsNullOrWhiteSpace($Arguments)) {
                Start-Process -FilePath $FilePath -Wait
            }
            else {
                Start-Process -FilePath $FilePath -ArgumentList $Arguments -Wait
            }

            Write-Log "DONE INSTALLER: $FilePath"
        }
        catch {
            Write-Log "ERROR INSTALLER: $($_.Exception.Message)"
            Show-Msg "Gagal menjalankan installer:`n$FilePath`n`n$($_.Exception.Message)"
        }
    }
}

function Run-MSI {
    param(
        [string]$FilePath,
        [string]$Arguments = "/qn /norestart"
    )

    if (Test-Installer $FilePath) {
        try {
            Write-Log "RUN MSI: $FilePath $Arguments"
            Start-Process msiexec.exe -ArgumentList "/i `"$FilePath`" $Arguments" -Wait
            Write-Log "DONE MSI: $FilePath"
        }
        catch {
            Write-Log "ERROR MSI: $($_.Exception.Message)"
            Show-Msg "Gagal menjalankan MSI:`n$FilePath`n`n$($_.Exception.Message)"
        }
    }
}

# ============================================
# INSTALL FUNCTIONS
# ============================================

function Install-Office {
    param(
        [string]$Folder,
        [string]$Config
    )

    $SetupPath = Join-Path $InstallerPath "$Folder\setup.exe"
    $ConfigPath = Join-Path $InstallerPath "$Folder\$Config"

    if ((Test-Installer $SetupPath) -and (Test-Installer $ConfigPath)) {
        try {
            Write-Log "INSTALL OFFICE: $Folder"
            Start-Process -FilePath $SetupPath -ArgumentList "/configure `"$ConfigPath`"" -Wait
            Write-Log "DONE OFFICE: $Folder"
        }
        catch {
            Write-Log "ERROR OFFICE: $($_.Exception.Message)"
            Show-Msg "Gagal install Office:`n$($_.Exception.Message)"
        }
    }
}

function Install-SelectedApps {
    $Selected = @()

    foreach ($Item in $AppCheckBoxes.Keys) {
        if ($AppCheckBoxes[$Item].IsChecked -eq $true) {
            $Selected += $Item
        }
    }

    if ($Selected.Count -eq 0) {
        Show-Msg "Belum ada aplikasi yang dipilih."
        return
    }

    foreach ($App in $Selected) {
        Write-Log "SELECTED INSTALL: $App"

        switch ($App) {
            "Adobe Reader" {
                $File = Join-Path $InstallerPath "AdobeReader\AdobeReader.exe"
                Run-Installer $File "/sAll /rs /rps /msi EULA_ACCEPT=YES"
            }

            "Aruba VPN" {
                $File = Join-Path $InstallerPath "ArubaVPN\ArubaVPN.msi"
                Run-MSI $File "/qn /norestart"
            }

            "RevPDF" {
                $File = Join-Path $InstallerPath "RevPDF\RevPDF.exe"
                Run-Installer $File "/S"
            }

            "PDF24" {
                $File = Join-Path $InstallerPath "PDF24\PDF24.exe"
                Run-Installer $File "/VERYSILENT /NORESTART"
            }

            "PDFsam Basic" {
                $File = Join-Path $InstallerPath "PDFsamBasic\PDFsamBasic.exe"
                Run-Installer $File "/S"
            }

            "Office 2019" {
                Install-Office -Folder "Office2019" -Config "config2019.xml"
            }

            "Office 365 Online" {
                $File = Join-Path $InstallerPath "Office365Online\OfficeSetup.exe"
                Run-Installer $File ""
            }

            "SAP GUI" {
                $File = Join-Path $InstallerPath "SAPGUI\setup.exe"
                Run-Installer $File "/silent"
            }

            "7-Zip" {
                $File = Join-Path $InstallerPath "7zip\7zSetup.exe"
                Run-Installer $File "/S"
            }

            "MS Teams" {
                $File = Join-Path $InstallerPath "MSTeams\MSTeamsSetup.exe"
                Run-Installer $File "-s"
            }

            "AnyDesk" {
                $File = Join-Path $InstallerPath "AnyDesk\AnyDesk.exe"
                Run-Installer $File "--install `"C:\Program Files (x86)\AnyDesk`" --start-with-win --silent"
            }

            "Cortex XDR" {
                $File = Join-Path $InstallerPath "CortexXDR\CortexXDR.msi"
                Run-MSI $File "/qn /norestart"
            }
        }
    }

    Show-Msg "Install aplikasi terpilih selesai."
}

# ============================================
# INSTALLED APPS / UNINSTALL FUNCTIONS
# ============================================

function Get-InstalledApplications {
    $RegistryPaths = @(
        "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*"
    )

    $Apps = foreach ($Path in $RegistryPaths) {
        Get-ItemProperty $Path -ErrorAction SilentlyContinue |
        Where-Object {
            $_.DisplayName -and
            $_.DisplayName.Trim() -ne "" -and
            ($_.UninstallString -or $_.QuietUninstallString)
        } |
        Select-Object DisplayName, DisplayVersion, Publisher, InstallDate, UninstallString, QuietUninstallString
    }

    $Apps |
    Sort-Object DisplayName -Unique |
    ForEach-Object {
        [PSCustomObject]@{
            Name                 = $_.DisplayName
            Version              = $_.DisplayVersion
            Publisher            = $_.Publisher
            InstallDate          = $_.InstallDate
            UninstallString      = $_.UninstallString
            QuietUninstallString = $_.QuietUninstallString
        }
    }
}

function Start-UninstallApplication {
    param(
        [string]$AppName,
        [string]$UninstallString,
        [string]$QuietUninstallString
    )

    if ([string]::IsNullOrWhiteSpace($UninstallString) -and [string]::IsNullOrWhiteSpace($QuietUninstallString)) {
        Show-Msg "Uninstall command tidak ditemukan untuk aplikasi ini."
        return
    }

    $Confirm = [System.Windows.MessageBox]::Show(
        "Yakin ingin uninstall aplikasi:`n`n$AppName ?",
        "Konfirmasi Uninstall",
        "YesNo",
        "Warning"
    )

    if ($Confirm -ne "Yes") {
        return
    }

    try {
        $Command = $QuietUninstallString
        if ([string]::IsNullOrWhiteSpace($Command)) {
            $Command = $UninstallString
        }

        Write-Log "UNINSTALL APP: $AppName"
        Write-Log "UNINSTALL COMMAND: $Command"

        if ($Command -match "MsiExec.exe" -or $Command -match "msiexec") {
            $MsiCommand = $Command
            $MsiCommand = $MsiCommand -replace "/I", "/X"
            $MsiCommand = $MsiCommand -replace "/i", "/x"

            if ($MsiCommand -notmatch "/qn" -and $MsiCommand -notmatch "/quiet") {
                $MsiCommand = "$MsiCommand /qn /norestart"
            }

            Start-Process "cmd.exe" -ArgumentList "/c $MsiCommand" -Wait
        }
        else {
            Start-Process "cmd.exe" -ArgumentList "/c `"$Command`"" -Wait
        }

        Write-Log "DONE UNINSTALL APP: $AppName"
        Show-Msg "Proses uninstall selesai:`n$AppName"
    }
    catch {
        Write-Log "ERROR UNINSTALL $AppName : $($_.Exception.Message)"
        Show-Msg "Gagal uninstall aplikasi:`n$($_.Exception.Message)"
    }
}

function Show-InstalledApplications {
    $Apps = Get-InstalledApplications

    if (!$Apps -or $Apps.Count -eq 0) {
        Show-Msg "Tidak ada aplikasi terdeteksi."
        return
    }

[xml]$AppXaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        Title="Installed Applications"
        Height="600"
        Width="950"
        WindowStartupLocation="CenterScreen"
        Background="#1e2328">
    <Grid Margin="10">
        <Grid.RowDefinitions>
            <RowDefinition Height="40"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="45"/>
        </Grid.RowDefinitions>

        <TextBlock Grid.Row="0"
                   Text="Installed Applications"
                   Foreground="#5ce1ff"
                   FontSize="20"
                   FontWeight="Bold"
                   VerticalAlignment="Center"/>

        <DataGrid Name="DgInstalledApps"
                  Grid.Row="1"
                  AutoGenerateColumns="False"
                  IsReadOnly="True"
                  SelectionMode="Single"
                  Background="#20252a"
                  Foreground="White"
                  RowBackground="#20252a"
                  AlternatingRowBackground="#26313a"
                  GridLinesVisibility="Horizontal"
                  HeadersVisibility="Column">
            <DataGrid.Columns>
                <DataGridTextColumn Header="Application Name" Binding="{Binding Name}" Width="320"/>
                <DataGridTextColumn Header="Version" Binding="{Binding Version}" Width="130"/>
                <DataGridTextColumn Header="Publisher" Binding="{Binding Publisher}" Width="220"/>
                <DataGridTextColumn Header="Install Date" Binding="{Binding InstallDate}" Width="120"/>
            </DataGrid.Columns>
        </DataGrid>

        <StackPanel Grid.Row="2"
                    Orientation="Horizontal"
                    HorizontalAlignment="Right"
                    VerticalAlignment="Center">
            <Button Name="BtnRefreshApps"
                    Content="Refresh"
                    Width="120"
                    Height="32"
                    Margin="5"
                    Background="#263846"
                    Foreground="White"/>
            <Button Name="BtnUninstallApp"
                    Content="Uninstall Selected"
                    Width="160"
                    Height="32"
                    Margin="5"
                    Background="#7a2f2f"
                    Foreground="White"/>
            <Button Name="BtnCloseApps"
                    Content="Close"
                    Width="120"
                    Height="32"
                    Margin="5"
                    Background="#263846"
                    Foreground="White"/>
        </StackPanel>
    </Grid>
</Window>
"@

    $Reader = New-Object System.Xml.XmlNodeReader $AppXaml
    $AppWindow = [Windows.Markup.XamlReader]::Load($Reader)

    $DgInstalledApps = $AppWindow.FindName("DgInstalledApps")
    $BtnRefreshApps = $AppWindow.FindName("BtnRefreshApps")
    $BtnUninstallApp = $AppWindow.FindName("BtnUninstallApp")
    $BtnCloseApps = $AppWindow.FindName("BtnCloseApps")

    $DgInstalledApps.ItemsSource = $Apps

    $BtnRefreshApps.Add_Click({
        $DgInstalledApps.ItemsSource = $null
        $DgInstalledApps.ItemsSource = Get-InstalledApplications
    })

    $BtnUninstallApp.Add_Click({
        $SelectedApp = $DgInstalledApps.SelectedItem

        if ($null -eq $SelectedApp) {
            [System.Windows.MessageBox]::Show("Pilih aplikasi yang ingin di-uninstall.", "Installed Applications")
            return
        }

        Start-UninstallApplication `
            -AppName $SelectedApp.Name `
            -UninstallString $SelectedApp.UninstallString `
            -QuietUninstallString $SelectedApp.QuietUninstallString

        $DgInstalledApps.ItemsSource = $null
        $DgInstalledApps.ItemsSource = Get-InstalledApplications
    })

    $BtnCloseApps.Add_Click({
        $AppWindow.Close()
    })

    $AppWindow.ShowDialog() | Out-Null
}

# ============================================
# SYSTEM TOOLS FUNCTIONS
# ============================================

function Rename-Hostname {
    $NewName = [Microsoft.VisualBasic.Interaction]::InputBox(
        "Masukkan hostname baru:",
        "Rename Hostname",
        ""
    )

    if ([string]::IsNullOrWhiteSpace($NewName)) {
        Show-Msg "Hostname tidak boleh kosong."
        return
    }

    try {
        Rename-Computer -NewName $NewName -Force
        Write-Log "Hostname diganti ke $NewName"
        Show-Msg "Hostname berhasil diganti ke $NewName.`nSilakan restart komputer."
    }
    catch {
        Write-Log "ERROR Rename Hostname: $($_.Exception.Message)"
        Show-Msg "Gagal rename hostname:`n$($_.Exception.Message)"
    }
}

function Join-Domain {
    $DomainName = "pertamina.com"
    $OUPath = "OU=Computers,OU=PDSI,DC=pertamina,DC=com"

    try {
        $Credential = Get-Credential -Message "Masukkan akun join domain"

        Add-Computer `
            -DomainName $DomainName `
            -OUPath $OUPath `
            -Credential $Credential `
            -Force

        Write-Log "Join domain berhasil ke $DomainName"
        Show-Msg "Join domain berhasil.`nSilakan restart komputer."
    }
    catch {
        Write-Log "ERROR Join Domain: $($_.Exception.Message)"
        Show-Msg "Gagal join domain:`n$($_.Exception.Message)"
    }
}

# ============================================
# TWEAK FUNCTIONS
# ============================================

function Clean-Windows {
    try {
        Write-Log "Clean Windows dimulai"

        Remove-Item "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item "C:\Windows\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue
        Clear-RecycleBin -Force -ErrorAction SilentlyContinue
        ipconfig /flushdns | Out-Null

        Write-Log "Clean Windows selesai"
        Show-Msg "Clean sampah Windows selesai."
    }
    catch {
        Write-Log "ERROR Clean Windows: $($_.Exception.Message)"
        Show-Msg "Gagal clean Windows:`n$($_.Exception.Message)"
    }
}

function Clean-UpdateCache {
    try {
        Write-Log "Clean Windows Update Cache dimulai"

        Stop-Service wuauserv -Force -ErrorAction SilentlyContinue
        Stop-Service bits -Force -ErrorAction SilentlyContinue

        Remove-Item "C:\Windows\SoftwareDistribution\Download\*" `
            -Recurse -Force -ErrorAction SilentlyContinue

        Start-Service wuauserv -ErrorAction SilentlyContinue
        Start-Service bits -ErrorAction SilentlyContinue

        Write-Log "Clean Windows Update Cache selesai"
        Show-Msg "Clean Windows Update Cache selesai."
    }
    catch {
        Write-Log "ERROR Update Cache: $($_.Exception.Message)"
        Show-Msg "Gagal clean update cache:`n$($_.Exception.Message)"
    }
}

function Repair-System {
    try {
        Write-Log "Repair System dimulai"

        Start-Process powershell.exe `
            -ArgumentList "-NoExit -Command sfc /scannow; DISM /Online /Cleanup-Image /RestoreHealth" `
            -Verb RunAs

        Write-Log "Repair System dijalankan"
    }
    catch {
        Show-Msg "Gagal menjalankan repair system:`n$($_.Exception.Message)"
    }
}

function Apply-SelectedTweaks {
    $Selected = @()

    foreach ($Item in $TweakCheckBoxes.Keys) {
        if ($TweakCheckBoxes[$Item].IsChecked -eq $true) {
            $Selected += $Item
        }
    }

    if ($Selected.Count -eq 0) {
        Show-Msg "Belum ada tweak yang dipilih."
        return
    }

    foreach ($Tweak in $Selected) {
        Write-Log "APPLY TWEAK: $Tweak"

        try {
            switch ($Tweak) {
                "Activity History - Disable" {
                    New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Force | Out-Null
                    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "EnableActivityFeed" -Type DWord -Value 0
                    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "PublishUserActivities" -Type DWord -Value 0
                    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "UploadUserActivities" -Type DWord -Value 0
                }

                "Consumer Features - Disable" {
                    New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\CloudContent" -Force | Out-Null
                    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\CloudContent" -Name "DisableWindowsConsumerFeatures" -Type DWord -Value 1
                }

                "Disk Cleanup - Run" {
                    cleanmgr.exe /verylowdisk
                }

                "End Task With Right Click - Enable" {
                    New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarDeveloperSettings" -Force | Out-Null
                    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarDeveloperSettings" -Name "TaskbarEndTask" -Type DWord -Value 1
                }

                "File Explorer Automatic Folder Discovery - Disable" {
                    New-Item -Path "HKCU:\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\Bags\AllFolders\Shell" -Force | Out-Null
                    Set-ItemProperty -Path "HKCU:\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\Bags\AllFolders\Shell" -Name "FolderType" -Type String -Value "NotSpecified"
                }

                "Hibernation - Disable" {
                    powercfg.exe /hibernate off
                }

                "Location Tracking - Disable" {
                    New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors" -Force | Out-Null
                    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors" -Name "DisableLocation" -Type DWord -Value 1
                    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors" -Name "DisableLocationScripting" -Type DWord -Value 1
                    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors" -Name "DisableSensors" -Type DWord -Value 1
                }

                "Microsoft Store Recommended Search Results - Disable" {
                    New-Item -Path "HKCU:\Software\Policies\Microsoft\Windows\Explorer" -Force | Out-Null
                    Set-ItemProperty -Path "HKCU:\Software\Policies\Microsoft\Windows\Explorer" -Name "DisableSearchBoxSuggestions" -Type DWord -Value 1
                }

                "PowerShell 7 Telemetry - Disable" {
                    [Environment]::SetEnvironmentVariable("POWERSHELL_TELEMETRY_OPTOUT", "1", "Machine")
                    [Environment]::SetEnvironmentVariable("POWERSHELL_UPDATECHECK", "Off", "Machine")
                }

                "Restore Point - Create" {
                    Enable-ComputerRestore -Drive "$env:SystemDrive\" -ErrorAction SilentlyContinue
                    Checkpoint-Computer -Description "ICT PDSI Restore Point" -RestorePointType "MODIFY_SETTINGS"
                }

                "Services - Set to Manual" {
                    $Services = @("DiagTrack","dmwappushservice","MapsBroker","lfsvc","Fax","XblAuthManager","XblGameSave","XboxNetApiSvc")
                    foreach ($Svc in $Services) {
                        Set-Service -Name $Svc -StartupType Manual -ErrorAction SilentlyContinue
                    }
                }

                "Start Menu Previous Layout - Enable" {
                    New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Force | Out-Null
                    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "Start_Layout" -Type DWord -Value 1
                }

                "Telemetry - Disable" {
                    New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Force | Out-Null
                    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -Type DWord -Value 0
                    Stop-Service DiagTrack -Force -ErrorAction SilentlyContinue
                    Set-Service DiagTrack -StartupType Disabled -ErrorAction SilentlyContinue
                }

                "Temporary Files - Remove" {
                    Clean-Windows
                }

                "Unwanted Pre-Installed Apps - Remove" {
                    $Apps = @(
                        "*Microsoft.BingNews*",
                        "*Microsoft.GetHelp*",
                        "*Microsoft.Getstarted*",
                        "*Microsoft.MicrosoftSolitaireCollection*",
                        "*Microsoft.People*",
                        "*Microsoft.Xbox*",
                        "*Microsoft.ZuneMusic*",
                        "*Microsoft.ZuneVideo*",
                        "*Microsoft.YourPhone*",
                        "*MicrosoftTeams*"
                    )

                    foreach ($App in $Apps) {
                        Get-AppxPackage -Name $App -AllUsers | Remove-AppxPackage -ErrorAction SilentlyContinue
                        Get-AppxProvisionedPackage -Online | Where-Object DisplayName -like $App | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue | Out-Null
                    }
                }

                "Widgets - Remove" {
                    Get-AppxPackage -AllUsers *WebExperience* | Remove-AppxPackage -ErrorAction SilentlyContinue
                    Get-AppxProvisionedPackage -Online | Where-Object DisplayName -like "*WebExperience*" | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue | Out-Null
                }

                "Windows Platform Binary Table WPBT - Disable" {
                    New-Item -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager" -Force | Out-Null
                    Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager" -Name "DisableWpbtExecution" -Type DWord -Value 1
                }
            }

            Write-Log "DONE TWEAK: $Tweak"
        }
        catch {
            Write-Log "ERROR TWEAK $Tweak : $($_.Exception.Message)"
            Show-Msg "Gagal menjalankan tweak:`n$Tweak`n`n$($_.Exception.Message)"
        }
    }

    Show-Msg "Tweak terpilih selesai dijalankan.`nBeberapa tweak perlu restart / sign out agar aktif."
}

# ============================================
# CONFIG FUNCTIONS
# ============================================

function Run-SelectedFeatures {
    $Selected = @()

    foreach ($Item in $FeatureCheckBoxes.Keys) {
        if ($FeatureCheckBoxes[$Item].IsChecked -eq $true) {
            $Selected += $Item
        }
    }

    if ($Selected.Count -eq 0) {
        Show-Msg "Belum ada feature yang dipilih."
        return
    }

    foreach ($Feature in $Selected) {
        Add-Output "RUN FEATURE: $Feature"

        try {
            switch ($Feature) {
                ".NET Framework (Versions 2, 3, 4) - Enable" {
                    Enable-WindowsOptionalFeature -Online -FeatureName "NetFx3" -All -NoRestart -ErrorAction SilentlyContinue | Out-Null
                    Enable-WindowsOptionalFeature -Online -FeatureName "NetFx4-AdvSrvs" -All -NoRestart -ErrorAction SilentlyContinue | Out-Null
                }

                "Hyper-V - Enable" {
                    Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -All -NoRestart | Out-Null
                }

                "Legacy F8 Boot Recovery - Disable" {
                    bcdedit /set "{current}" bootmenupolicy Standard | Out-Null
                }

                "Legacy F8 Boot Recovery - Enable" {
                    bcdedit /set "{current}" bootmenupolicy Legacy | Out-Null
                }

                "Legacy Media Components (WMP, DirectPlay) - Enable" {
                    Enable-WindowsOptionalFeature -Online -FeatureName "WindowsMediaPlayer" -All -NoRestart -ErrorAction SilentlyContinue | Out-Null
                    Enable-WindowsOptionalFeature -Online -FeatureName "DirectPlay" -All -NoRestart -ErrorAction SilentlyContinue | Out-Null
                }

                "Network File System (NFS) - Enable" {
                    Enable-WindowsOptionalFeature -Online -FeatureName "ServicesForNFS-ClientOnly" -All -NoRestart -ErrorAction SilentlyContinue | Out-Null
                    Enable-WindowsOptionalFeature -Online -FeatureName "ClientForNFS-Infrastructure" -All -NoRestart -ErrorAction SilentlyContinue | Out-Null
                }

                "Registry Backup (Daily Task 12:30am) - Enable" {
                    New-Item -Path "HKLM:\System\CurrentControlSet\Control\Session Manager\Configuration Manager" -Force | Out-Null
                    Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Session Manager\Configuration Manager" -Name "EnablePeriodicBackup" -Type DWord -Value 1

                    $Action = New-ScheduledTaskAction -Execute "reg.exe" -Argument "export HKLM\SOFTWARE `"$env:SystemDrive\RegistryBackup-Software.reg`" /y"
                    $Trigger = New-ScheduledTaskTrigger -Daily -At 12:30am
                    Register-ScheduledTask -TaskName "ICTPDSI-RegistryBackup" -Action $Action -Trigger $Trigger -RunLevel Highest -Force | Out-Null
                }

                "Windows Sandbox - Enable" {
                    Enable-WindowsOptionalFeature -Online -FeatureName "Containers-DisposableClientVM" -All -NoRestart | Out-Null
                }

                "Windows Subsystem for Linux (WSL) - Enable" {
                    Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Windows-Subsystem-Linux" -All -NoRestart | Out-Null
                    Enable-WindowsOptionalFeature -Online -FeatureName "VirtualMachinePlatform" -All -NoRestart | Out-Null
                }
            }

            Add-Output "DONE FEATURE: $Feature"
        }
        catch {
            Add-Output "ERROR FEATURE $Feature : $($_.Exception.Message)"
            Show-Msg "Gagal menjalankan feature:`n$Feature`n`n$($_.Exception.Message)"
        }
    }

    Show-Msg "Feature terpilih selesai dijalankan.`nBeberapa feature perlu restart agar aktif."
}

function Run-AutoLogon {
    try {
        $User = [Microsoft.VisualBasic.Interaction]::InputBox("Masukkan username:", "AutoLogon", "")
        if ([string]::IsNullOrWhiteSpace($User)) { return }

        $Domain = [Microsoft.VisualBasic.Interaction]::InputBox("Masukkan domain/nama komputer:", "AutoLogon", $env:COMPUTERNAME)
        $Pass = [Microsoft.VisualBasic.Interaction]::InputBox("Masukkan password:", "AutoLogon", "")

        $Path = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
        Set-ItemProperty -Path $Path -Name "AutoAdminLogon" -Type String -Value "1"
        Set-ItemProperty -Path $Path -Name "DefaultUserName" -Type String -Value $User
        Set-ItemProperty -Path $Path -Name "DefaultDomainName" -Type String -Value $Domain
        Set-ItemProperty -Path $Path -Name "DefaultPassword" -Type String -Value $Pass

        Add-Output "AutoLogon enabled for $Domain\$User"
        Show-Msg "AutoLogon berhasil diset."
    }
    catch {
        Add-Output "ERROR AutoLogon: $($_.Exception.Message)"
        Show-Msg "Gagal AutoLogon:`n$($_.Exception.Message)"
    }
}

function Reset-Network {
    try {
        Add-Output "Reset network started"
        ipconfig /flushdns | Out-Null
        netsh winsock reset | Out-Null
        netsh int ip reset | Out-Null
        Add-Output "Reset network done. Restart recommended."
        Show-Msg "Reset network selesai.`nRestart komputer disarankan."
    }
    catch {
        Add-Output "ERROR Reset Network: $($_.Exception.Message)"
    }
}

function Enable-NTPServer {
    try {
        Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\NtpServer" -Name "Enabled" -Type DWord -Value 1
        Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\W32Time\Config" -Name "AnnounceFlags" -Type DWord -Value 5
        Restart-Service w32time -Force
        Add-Output "NTP Server enabled"
        Show-Msg "NTP Server berhasil di-enable."
    }
    catch {
        Add-Output "ERROR NTP Server: $($_.Exception.Message)"
    }
}

function Reset-WindowsUpdate {
    try {
        Add-Output "Windows Update reset started"

        Stop-Service wuauserv -Force -ErrorAction SilentlyContinue
        Stop-Service bits -Force -ErrorAction SilentlyContinue
        Stop-Service cryptsvc -Force -ErrorAction SilentlyContinue

        Rename-Item "C:\Windows\SoftwareDistribution" "SoftwareDistribution.old" -ErrorAction SilentlyContinue
        Rename-Item "C:\Windows\System32\catroot2" "catroot2.old" -ErrorAction SilentlyContinue

        Start-Service cryptsvc -ErrorAction SilentlyContinue
        Start-Service bits -ErrorAction SilentlyContinue
        Start-Service wuauserv -ErrorAction SilentlyContinue

        Add-Output "Windows Update reset done"
        Show-Msg "Windows Update reset selesai."
    }
    catch {
        Add-Output "ERROR Windows Update Reset: $($_.Exception.Message)"
    }
}

function Reinstall-WinGet {
    try {
        Add-Output "Opening Winget reinstall instruction"
        Start-Process "ms-windows-store://pdp/?ProductId=9NBLGGH4NNS1"
        Add-Output "Microsoft Store opened for App Installer / Winget"
    }
    catch {
        Add-Output "ERROR WinGet reinstall: $($_.Exception.Message)"
    }
}

function Open-LegacyPanel {
    param([string]$Panel)

    try {
        Add-Output "OPEN PANEL: $Panel"

        switch ($Panel) {
            "Computer Management" { Start-Process "compmgmt.msc" }
            "Control Panel" { Start-Process "control.exe" }
            "Network Connections" { Start-Process "ncpa.cpl" }
            "Power Panel" { Start-Process "powercfg.cpl" }
            "Printer Panel" { Start-Process "control.exe" -ArgumentList "printers" }
            "Region" { Start-Process "intl.cpl" }
            "Sound Settings" { Start-Process "mmsys.cpl" }
            "System Properties" { Start-Process "sysdm.cpl" }
            "Time and Date" { Start-Process "timedate.cpl" }
            "Windows Restore" { Start-Process "rstrui.exe" }
        }
    }
    catch {
        Add-Output "ERROR Open Panel $Panel : $($_.Exception.Message)"
    }
}

# ============================================
# MAIN XAML GUI
# ============================================

[xml]$XAML = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        Title="ICT PDSI IT Internal Tool"
        Height="720"
        Width="1120"
        WindowStartupLocation="CenterScreen"
        ResizeMode="CanResize"
        Background="#1e2328">

    <Window.Resources>
        <Style TargetType="Button">
            <Setter Property="Background" Value="#263846"/>
            <Setter Property="Foreground" Value="White"/>
            <Setter Property="BorderBrush" Value="#5d7890"/>
            <Setter Property="FontWeight" Value="SemiBold"/>
            <Setter Property="Height" Value="32"/>
            <Setter Property="Margin" Value="4"/>
        </Style>

        <Style TargetType="CheckBox">
            <Setter Property="Foreground" Value="#ffffff"/>
            <Setter Property="FontWeight" Value="SemiBold"/>
            <Setter Property="Margin" Value="4"/>
        </Style>

        <Style TargetType="TextBlock">
            <Setter Property="Foreground" Value="White"/>
            <Setter Property="FontFamily" Value="Consolas"/>
        </Style>

        <Style TargetType="TabItem">
            <Setter Property="Foreground" Value="White"/>
            <Setter Property="Background" Value="#2d3338"/>
            <Setter Property="FontWeight" Value="Bold"/>
            <Setter Property="Width" Value="150"/>
            <Setter Property="Height" Value="34"/>
        </Style>
    </Window.Resources>

    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="48"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="28"/>
        </Grid.RowDefinitions>

        <DockPanel Grid.Row="0" Background="#171b1f">
            <Border Width="150"
                    Background="#101418"
                    BorderBrush="#30485a"
                    BorderThickness="0,0,1,0">
                <TextBlock Text="ICT PDSI"
                           FontSize="20"
                           FontWeight="Bold"
                           Foreground="#5ce1ff"
                           VerticalAlignment="Center"
                           HorizontalAlignment="Center"/>
            </Border>

            <TextBlock Text="IT Internal Tool"
                       FontSize="16"
                       FontWeight="Bold"
                       Foreground="White"
                       VerticalAlignment="Center"
                       Margin="15,0,0,0"/>

            <TextBox Width="260"
                     Height="28"
                     Margin="10,9,15,9"
                     HorizontalAlignment="Right"
                     DockPanel.Dock="Right"
                     Background="#1d252c"
                     Foreground="White"
                     BorderBrush="#8aa4bb"
                     Text="Search..."/>
        </DockPanel>

        <TabControl Name="MainTabs"
                    Grid.Row="1"
                    Background="#1e2328"
                    BorderThickness="0"
                    Margin="8">

            <TabItem Header="Install">
                <Grid Margin="0,8,0,0">
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="220"/>
                        <ColumnDefinition Width="*"/>
                    </Grid.ColumnDefinitions>

                    <Border Grid.Column="0" Background="#20282f" CornerRadius="5" BorderBrush="#303c44" BorderThickness="1" Padding="8">
                        <StackPanel>
                            <TextBlock Text="Actions" Foreground="#5ce1ff" FontSize="15" Margin="0,5,0,8"/>
                            <Button Name="BtnInstallSelected" Content="Install Selected Apps"/>
                            <Button Name="BtnClearSelection" Content="Clear Selection"/>
                            <Button Name="BtnSelectAll" Content="Select All Apps"/>
                            <Button Name="BtnShowInstalled" Content="Show Installed Apps"/>
                            <Button Name="BtnUninstallApps" Content="Uninstall Application"/>

                            <TextBlock Text="Package Source" Foreground="#5ce1ff" FontSize="15" Margin="0,20,0,8"/>
                            <TextBlock Text="Offline SSD" Foreground="#42d35d" FontSize="13"/>
                            <TextBlock Name="TxtBasePathInstall" Text="Base Path" Foreground="#cfd8dc" FontSize="11" TextWrapping="Wrap" Margin="0,8,0,0"/>
                        </StackPanel>
                    </Border>

                    <Border Grid.Column="1" Background="#20252a" CornerRadius="5" BorderBrush="#303c44" BorderThickness="1" Padding="10" Margin="10,0,0,0">
                        <ScrollViewer VerticalScrollBarVisibility="Auto">
                            <StackPanel>
                                <TextBlock Text="- Office" Foreground="#5ce1ff" FontSize="16" Margin="0,0,0,5"/>
                                <UniformGrid Columns="3" Margin="0,0,0,15">
                                    <CheckBox Name="CbOffice2019" Content="Office 2019"/>
                                    <CheckBox Name="CbOffice365Online" Content="Office 365 Online"/>
                                </UniformGrid>

                                <TextBlock Text="- PDF / Document" Foreground="#5ce1ff" FontSize="16" Margin="0,0,0,5"/>
                                <UniformGrid Columns="3" Margin="0,0,0,15">
                                    <CheckBox Name="CbAdobe" Content="Adobe Reader"/>
                                    <CheckBox Name="CbRevPDF" Content="RevPDF"/>
                                    <CheckBox Name="CbPDF24" Content="PDF24"/>
                                    <CheckBox Name="CbPDFsam" Content="PDFsam Basic"/>
                                </UniformGrid>

                                <TextBlock Text="- Utility" Foreground="#5ce1ff" FontSize="16" Margin="0,0,0,5"/>
                                <UniformGrid Columns="3" Margin="0,0,0,15">
                                    <CheckBox Name="Cb7zip" Content="7-Zip"/>
                                    <CheckBox Name="CbTeams" Content="MS Teams"/>
                                    <CheckBox Name="CbAnyDesk" Content="AnyDesk"/>
                                </UniformGrid>

                                <TextBlock Text="- Internal / Security" Foreground="#5ce1ff" FontSize="16" Margin="0,0,0,5"/>
                                <UniformGrid Columns="3" Margin="0,0,0,15">
                                    <CheckBox Name="CbSAP" Content="SAP GUI"/>
                                    <CheckBox Name="CbArubaVPN" Content="Aruba VPN"/>
                                    <CheckBox Name="CbCortexXDR" Content="Cortex XDR"/>
                                </UniformGrid>
                            </StackPanel>
                        </ScrollViewer>
                    </Border>
                </Grid>
            </TabItem>

            <TabItem Header="System Tools">
                <Grid Margin="0,8,0,0">
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="220"/>
                        <ColumnDefinition Width="*"/>
                    </Grid.ColumnDefinitions>

                    <Border Grid.Column="0" Background="#20282f" CornerRadius="5" BorderBrush="#303c44" BorderThickness="1" Padding="8">
                        <StackPanel>
                            <TextBlock Text="System Actions" Foreground="#5ce1ff" FontSize="15" Margin="0,5,0,8"/>
                            <Button Name="BtnRename" Content="Rename Hostname"/>
                            <Button Name="BtnJoinDomain" Content="Join Domain"/>
                            <Button Name="BtnRestart" Content="Restart Computer"/>
                            <Button Name="BtnOpenLogsSystem" Content="Open Logs Folder"/>
                        </StackPanel>
                    </Border>

                    <Border Grid.Column="1" Background="#20252a" CornerRadius="5" BorderBrush="#303c44" BorderThickness="1" Padding="15" Margin="10,0,0,0">
                        <StackPanel>
                            <TextBlock Text="- Computer Identity" Foreground="#5ce1ff" FontSize="16" Margin="0,0,0,10"/>
                            <TextBlock Text="Rename hostname digunakan untuk mengganti nama komputer sebelum join domain." Foreground="#cfd8dc" FontSize="13" TextWrapping="Wrap" Margin="0,0,0,15"/>
                            <TextBlock Text="- Domain" Foreground="#5ce1ff" FontSize="16" Margin="0,0,0,10"/>
                            <TextBlock Text="Join domain otomatis menggunakan domain dan OU yang sudah ditentukan di script." Foreground="#cfd8dc" FontSize="13" TextWrapping="Wrap" Margin="0,0,0,15"/>
                            <TextBlock Text="- Restart" Foreground="#5ce1ff" FontSize="16" Margin="0,0,0,10"/>
                            <TextBlock Text="Gunakan restart setelah rename hostname atau join domain selesai." Foreground="#cfd8dc" FontSize="13" TextWrapping="Wrap"/>
                        </StackPanel>
                    </Border>
                </Grid>
            </TabItem>

            <TabItem Header="Tweak">
                <Grid Margin="0,8,0,0">
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="220"/>
                        <ColumnDefinition Width="*"/>
                    </Grid.ColumnDefinitions>

                    <Border Grid.Column="0" Background="#20282f" CornerRadius="5" BorderBrush="#303c44" BorderThickness="1" Padding="8">
                        <StackPanel>
                            <TextBlock Text="Tweak Actions" Foreground="#5ce1ff" FontSize="15" Margin="0,5,0,8"/>
                            <Button Name="BtnApplyTweaks" Content="Apply Selected Tweaks"/>
                            <Button Name="BtnClearTweaks" Content="Clear Selection"/>
                            <Button Name="BtnSelectAllTweaks" Content="Select All Tweaks"/>

                            <TextBlock Text="Quick Repair" Foreground="#5ce1ff" FontSize="15" Margin="0,20,0,8"/>
                            <Button Name="BtnClean" Content="Clean Sampah Windows"/>
                            <Button Name="BtnUpdateCache" Content="Clean Update Cache"/>
                            <Button Name="BtnRepairSystem" Content="SFC / DISM Repair"/>
                            <Button Name="BtnOpenLogsTweak" Content="Open Logs Folder"/>
                        </StackPanel>
                    </Border>

                    <Border Grid.Column="1" Background="#20252a" CornerRadius="5" BorderBrush="#303c44" BorderThickness="1" Padding="15" Margin="10,0,0,0">
                        <ScrollViewer VerticalScrollBarVisibility="Auto">
                            <StackPanel>
                                <TextBlock Text="- Windows Tweaks" Foreground="#5ce1ff" FontSize="16" Margin="0,0,0,8"/>
                                <CheckBox Name="TwActivityHistory" Content="Activity History - Disable"/>
                                <CheckBox Name="TwConsumerFeatures" Content="ConsumerFeatures - Disable"/>
                                <CheckBox Name="TwDiskCleanup" Content="Disk Cleanup - Run"/>
                                <CheckBox Name="TwEndTask" Content="End Task With Right Click - Enable"/>
                                <CheckBox Name="TwFolderDiscovery" Content="File Explorer Automatic Folder Discovery - Disable"/>
                                <CheckBox Name="TwHibernation" Content="Hibernation - Disable"/>
                                <CheckBox Name="TwLocation" Content="Location Tracking - Disable"/>
                                <CheckBox Name="TwStoreSearch" Content="Microsoft Store Recommended Search Results - Disable"/>
                                <CheckBox Name="TwPSTelemetry" Content="PowerShell 7 Telemetry - Disable"/>
                                <CheckBox Name="TwRestorePoint" Content="Restore Point - Create"/>
                                <CheckBox Name="TwServicesManual" Content="Services - Set to Manual"/>
                                <CheckBox Name="TwStartMenuPrevious" Content="Start Menu Previous Layout - Enable"/>
                                <CheckBox Name="TwTelemetry" Content="Telemetry - Disable"/>
                                <CheckBox Name="TwTempFiles" Content="Temporary Files - Remove"/>
                                <CheckBox Name="TwRemoveApps" Content="Unwanted Pre-Installed Apps - Remove"/>
                                <CheckBox Name="TwWidgets" Content="Widgets - Remove"/>
                                <CheckBox Name="TwWPBT" Content="Windows Platform Binary Table WPBT - Disable"/>
                                <TextBlock Text="Catatan: beberapa tweak perlu restart / sign out. Hindari memilih semua pada PC domain produksi sebelum diuji." Foreground="#cfd8dc" FontSize="12" TextWrapping="Wrap" Margin="0,20,0,0"/>
                            </StackPanel>
                        </ScrollViewer>
                    </Border>
                </Grid>
            </TabItem>

            <TabItem Header="Config">
                <Grid Margin="0,8,0,0">
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="*"/>
                        <ColumnDefinition Width="470"/>
                    </Grid.ColumnDefinitions>

                    <Border Grid.Column="0" Background="#20252a" CornerRadius="5" BorderBrush="#303c44" BorderThickness="1" Padding="10" Margin="0,0,8,0">
                        <ScrollViewer VerticalScrollBarVisibility="Auto">
                            <StackPanel>
                                <TextBlock Text="Features" Foreground="#5ce1ff" FontSize="16" FontWeight="Bold" Margin="0,0,0,8"/>

                                <CheckBox Name="CfgNetFx" Content=".NET Framework (Versions 2, 3, 4) - Enable"/>
                                <CheckBox Name="CfgHyperV" Content="Hyper-V - Enable"/>
                                <CheckBox Name="CfgF8Disable" Content="Legacy F8 Boot Recovery - Disable"/>
                                <CheckBox Name="CfgF8Enable" Content="Legacy F8 Boot Recovery - Enable"/>
                                <CheckBox Name="CfgMedia" Content="Legacy Media Components (WMP, DirectPlay) - Enable"/>
                                <CheckBox Name="CfgNFS" Content="Network File System (NFS) - Enable"/>
                                <CheckBox Name="CfgRegBackup" Content="Registry Backup (Daily Task 12:30am) - Enable"/>
                                <CheckBox Name="CfgSandbox" Content="Windows Sandbox - Enable"/>
                                <CheckBox Name="CfgWSL" Content="Windows Subsystem for Linux (WSL) - Enable"/>

                                <Button Name="BtnRunFeatures" Content="Run Features" Height="34" Margin="0,10,0,16"/>

                                <TextBlock Text="Fixes" Foreground="#5ce1ff" FontSize="16" FontWeight="Bold" Margin="0,0,0,8"/>
                                <Button Name="BtnAutoLogon" Content="AutoLogon - Run"/>
                                <Button Name="BtnNetworkReset" Content="Network - Reset"/>
                                <Button Name="BtnNTPEnable" Content="NTP Server - Enable"/>
                                <Button Name="BtnCorruptionScan" Content="System Corruption Scan - Run"/>
                                <Button Name="BtnWinUpdateReset" Content="Windows Update - Reset"/>
                                <Button Name="BtnWingetReinstall" Content="WinGet - Reinstall"/>
                            </StackPanel>
                        </ScrollViewer>
                    </Border>

                    <StackPanel Grid.Column="1">
                        <Border Background="#20252a" CornerRadius="5" BorderBrush="#303c44" BorderThickness="1" Padding="10" Margin="0,0,0,8">
                            <StackPanel>
                                <TextBlock Text="Legacy Windows Panels" Foreground="#5ce1ff" FontSize="16" FontWeight="Bold" Margin="0,0,0,8"/>
                                <Button Name="BtnComputerManagement" Content="Computer Management"/>
                                <Button Name="BtnControlPanel" Content="Control Panel"/>
                                <Button Name="BtnNetworkConnections" Content="Network Connections"/>
                                <Button Name="BtnPowerPanel" Content="Power Panel"/>
                                <Button Name="BtnPrinterPanel" Content="Printer Panel"/>
                                <Button Name="BtnRegion" Content="Region"/>
                                <Button Name="BtnSoundSettings" Content="Sound Settings"/>
                                <Button Name="BtnSystemProperties" Content="System Properties"/>
                                <Button Name="BtnTimeDate" Content="Time and Date"/>
                                <Button Name="BtnWindowsRestore" Content="Windows Restore"/>
                            </StackPanel>
                        </Border>

                        <Border Background="#20252a" CornerRadius="5" BorderBrush="#303c44" BorderThickness="1" Padding="10">
                            <StackPanel>
                                <TextBlock Text="Output / Logs" Foreground="#5ce1ff" FontSize="16" FontWeight="Bold" Margin="0,0,0,8"/>
                                <TextBox Name="TxtConfigOutput"
                                         Height="170"
                                         Background="White"
                                         Foreground="Black"
                                         TextWrapping="Wrap"
                                         AcceptsReturn="True"
                                         VerticalScrollBarVisibility="Auto"
                                         IsReadOnly="True"/>
                            </StackPanel>
                        </Border>
                    </StackPanel>
                </Grid>
            </TabItem>

        </TabControl>

        <Border Grid.Row="2" Background="#171b1f">
            <DockPanel>
                <TextBlock Name="TxtStatus" Text="Ready" Foreground="#cfd8dc" VerticalAlignment="Center" Margin="10,0,0,0"/>
                <TextBlock Text="Version: 1.1.0.0" Foreground="#cfd8dc" VerticalAlignment="Center" Margin="0,0,80,0" DockPanel.Dock="Right"/>
            </DockPanel>
        </Border>
    </Grid>
</Window>
"@

# ============================================
# LOAD GUI
# ============================================

$Reader = New-Object System.Xml.XmlNodeReader $XAML
$Window = [Windows.Markup.XamlReader]::Load($Reader)

# ============================================
# GET CONTROLS
# ============================================

$BtnInstallSelected = $Window.FindName("BtnInstallSelected")
$BtnClearSelection = $Window.FindName("BtnClearSelection")
$BtnSelectAll = $Window.FindName("BtnSelectAll")
$BtnShowInstalled = $Window.FindName("BtnShowInstalled")
$BtnUninstallApps = $Window.FindName("BtnUninstallApps")
$TxtBasePathInstall = $Window.FindName("TxtBasePathInstall")

$BtnRename = $Window.FindName("BtnRename")
$BtnJoinDomain = $Window.FindName("BtnJoinDomain")
$BtnRestart = $Window.FindName("BtnRestart")
$BtnOpenLogsSystem = $Window.FindName("BtnOpenLogsSystem")

$BtnApplyTweaks = $Window.FindName("BtnApplyTweaks")
$BtnClearTweaks = $Window.FindName("BtnClearTweaks")
$BtnSelectAllTweaks = $Window.FindName("BtnSelectAllTweaks")
$BtnClean = $Window.FindName("BtnClean")
$BtnUpdateCache = $Window.FindName("BtnUpdateCache")
$BtnRepairSystem = $Window.FindName("BtnRepairSystem")
$BtnOpenLogsTweak = $Window.FindName("BtnOpenLogsTweak")

$TxtStatus = $Window.FindName("TxtStatus")
$TxtBasePathInstall.Text = "Path: $BasePath"

$TxtConfigOutput = $Window.FindName("TxtConfigOutput")

# Config Buttons
$BtnRunFeatures = $Window.FindName("BtnRunFeatures")
$BtnAutoLogon = $Window.FindName("BtnAutoLogon")
$BtnNetworkReset = $Window.FindName("BtnNetworkReset")
$BtnNTPEnable = $Window.FindName("BtnNTPEnable")
$BtnCorruptionScan = $Window.FindName("BtnCorruptionScan")
$BtnWinUpdateReset = $Window.FindName("BtnWinUpdateReset")
$BtnWingetReinstall = $Window.FindName("BtnWingetReinstall")

$BtnComputerManagement = $Window.FindName("BtnComputerManagement")
$BtnControlPanel = $Window.FindName("BtnControlPanel")
$BtnNetworkConnections = $Window.FindName("BtnNetworkConnections")
$BtnPowerPanel = $Window.FindName("BtnPowerPanel")
$BtnPrinterPanel = $Window.FindName("BtnPrinterPanel")
$BtnRegion = $Window.FindName("BtnRegion")
$BtnSoundSettings = $Window.FindName("BtnSoundSettings")
$BtnSystemProperties = $Window.FindName("BtnSystemProperties")
$BtnTimeDate = $Window.FindName("BtnTimeDate")
$BtnWindowsRestore = $Window.FindName("BtnWindowsRestore")

$AppCheckBoxes = @{
    "Adobe Reader"      = $Window.FindName("CbAdobe")
    "Aruba VPN"         = $Window.FindName("CbArubaVPN")
    "RevPDF"            = $Window.FindName("CbRevPDF")
    "PDF24"             = $Window.FindName("CbPDF24")
    "PDFsam Basic"      = $Window.FindName("CbPDFsam")
    "Office 2019"       = $Window.FindName("CbOffice2019")
    "Office 365 Online" = $Window.FindName("CbOffice365Online")
    "SAP GUI"           = $Window.FindName("CbSAP")
    "7-Zip"             = $Window.FindName("Cb7zip")
    "MS Teams"          = $Window.FindName("CbTeams")
    "AnyDesk"           = $Window.FindName("CbAnyDesk")
    "Cortex XDR"        = $Window.FindName("CbCortexXDR")
}

$TweakCheckBoxes = @{
    "Activity History - Disable" = $Window.FindName("TwActivityHistory")
    "Consumer Features - Disable" = $Window.FindName("TwConsumerFeatures")
    "Disk Cleanup - Run" = $Window.FindName("TwDiskCleanup")
    "End Task With Right Click - Enable" = $Window.FindName("TwEndTask")
    "File Explorer Automatic Folder Discovery - Disable" = $Window.FindName("TwFolderDiscovery")
    "Hibernation - Disable" = $Window.FindName("TwHibernation")
    "Location Tracking - Disable" = $Window.FindName("TwLocation")
    "Microsoft Store Recommended Search Results - Disable" = $Window.FindName("TwStoreSearch")
    "PowerShell 7 Telemetry - Disable" = $Window.FindName("TwPSTelemetry")
    "Restore Point - Create" = $Window.FindName("TwRestorePoint")
    "Services - Set to Manual" = $Window.FindName("TwServicesManual")
    "Start Menu Previous Layout - Enable" = $Window.FindName("TwStartMenuPrevious")
    "Telemetry - Disable" = $Window.FindName("TwTelemetry")
    "Temporary Files - Remove" = $Window.FindName("TwTempFiles")
    "Unwanted Pre-Installed Apps - Remove" = $Window.FindName("TwRemoveApps")
    "Widgets - Remove" = $Window.FindName("TwWidgets")
    "Windows Platform Binary Table WPBT - Disable" = $Window.FindName("TwWPBT")
}

$FeatureCheckBoxes = @{
    ".NET Framework (Versions 2, 3, 4) - Enable" = $Window.FindName("CfgNetFx")
    "Hyper-V - Enable" = $Window.FindName("CfgHyperV")
    "Legacy F8 Boot Recovery - Disable" = $Window.FindName("CfgF8Disable")
    "Legacy F8 Boot Recovery - Enable" = $Window.FindName("CfgF8Enable")
    "Legacy Media Components (WMP, DirectPlay) - Enable" = $Window.FindName("CfgMedia")
    "Network File System (NFS) - Enable" = $Window.FindName("CfgNFS")
    "Registry Backup (Daily Task 12:30am) - Enable" = $Window.FindName("CfgRegBackup")
    "Windows Sandbox - Enable" = $Window.FindName("CfgSandbox")
    "Windows Subsystem for Linux (WSL) - Enable" = $Window.FindName("CfgWSL")
}

# ============================================
# BUTTON EVENTS - INSTALL
# ============================================

$BtnInstallSelected.Add_Click({
    $TxtStatus.Text = "Installing selected apps..."
    Install-SelectedApps
    $TxtStatus.Text = "Ready"
})

$BtnClearSelection.Add_Click({
    foreach ($cb in $AppCheckBoxes.Values) {
        $cb.IsChecked = $false
    }
    $TxtStatus.Text = "Selection cleared"
})

$BtnSelectAll.Add_Click({
    foreach ($cb in $AppCheckBoxes.Values) {
        $cb.IsChecked = $true
    }
    $TxtStatus.Text = "All apps selected"
})

$BtnShowInstalled.Add_Click({
    $TxtStatus.Text = "Showing installed applications..."
    Show-InstalledApplications
    $TxtStatus.Text = "Ready"
})

$BtnUninstallApps.Add_Click({
    $TxtStatus.Text = "Opening uninstall application menu..."
    Show-InstalledApplications
    $TxtStatus.Text = "Ready"
})

# ============================================
# BUTTON EVENTS - SYSTEM TOOLS
# ============================================

$BtnRename.Add_Click({
    $TxtStatus.Text = "Rename hostname..."
    Rename-Hostname
    $TxtStatus.Text = "Ready"
})

$BtnJoinDomain.Add_Click({
    $TxtStatus.Text = "Join domain..."
    Join-Domain
    $TxtStatus.Text = "Ready"
})

$BtnRestart.Add_Click({
    $Confirm = [System.Windows.MessageBox]::Show(
        "Yakin ingin restart komputer?",
        "Konfirmasi",
        "YesNo",
        "Question"
    )

    if ($Confirm -eq "Yes") {
        Restart-Computer -Force
    }
})

$BtnOpenLogsSystem.Add_Click({
    Start-Process explorer.exe $LogPath
})

# ============================================
# BUTTON EVENTS - TWEAK
# ============================================

$BtnApplyTweaks.Add_Click({
    $TxtStatus.Text = "Applying selected tweaks..."
    Apply-SelectedTweaks
    $TxtStatus.Text = "Ready"
})

$BtnClearTweaks.Add_Click({
    foreach ($cb in $TweakCheckBoxes.Values) {
        $cb.IsChecked = $false
    }
    $TxtStatus.Text = "Tweak selection cleared"
})

$BtnSelectAllTweaks.Add_Click({
    foreach ($cb in $TweakCheckBoxes.Values) {
        $cb.IsChecked = $true
    }
    $TxtStatus.Text = "All tweaks selected"
})

$BtnClean.Add_Click({
    $TxtStatus.Text = "Cleaning Windows..."
    Clean-Windows
    $TxtStatus.Text = "Ready"
})

$BtnUpdateCache.Add_Click({
    $TxtStatus.Text = "Cleaning Windows Update Cache..."
    Clean-UpdateCache
    $TxtStatus.Text = "Ready"
})

$BtnRepairSystem.Add_Click({
    $TxtStatus.Text = "Running SFC / DISM repair..."
    Repair-System
    $TxtStatus.Text = "Repair opened in PowerShell"
})

$BtnOpenLogsTweak.Add_Click({
    Start-Process explorer.exe $LogPath
})

# ============================================
# BUTTON EVENTS - CONFIG
# ============================================

$BtnRunFeatures.Add_Click({
    $TxtStatus.Text = "Running selected features..."
    Run-SelectedFeatures
    $TxtStatus.Text = "Ready"
})

$BtnAutoLogon.Add_Click({ Run-AutoLogon })
$BtnNetworkReset.Add_Click({ Reset-Network })
$BtnNTPEnable.Add_Click({ Enable-NTPServer })
$BtnCorruptionScan.Add_Click({ Repair-System })
$BtnWinUpdateReset.Add_Click({ Reset-WindowsUpdate })
$BtnWingetReinstall.Add_Click({ Reinstall-WinGet })

$BtnComputerManagement.Add_Click({ Open-LegacyPanel "Computer Management" })
$BtnControlPanel.Add_Click({ Open-LegacyPanel "Control Panel" })
$BtnNetworkConnections.Add_Click({ Open-LegacyPanel "Network Connections" })
$BtnPowerPanel.Add_Click({ Open-LegacyPanel "Power Panel" })
$BtnPrinterPanel.Add_Click({ Open-LegacyPanel "Printer Panel" })
$BtnRegion.Add_Click({ Open-LegacyPanel "Region" })
$BtnSoundSettings.Add_Click({ Open-LegacyPanel "Sound Settings" })
$BtnSystemProperties.Add_Click({ Open-LegacyPanel "System Properties" })
$BtnTimeDate.Add_Click({ Open-LegacyPanel "Time and Date" })
$BtnWindowsRestore.Add_Click({ Open-LegacyPanel "Windows Restore" })

# ============================================
# SHOW GUI
# ============================================

Add-Output "ICT PDSI IT Tool started. BasePath: $BasePath"
$Window.ShowDialog() | Out-Null
