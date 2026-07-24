# ===============================
# IT INTERNAL TOOL - OFFLINE SSD
# ===============================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName Microsoft.VisualBasic

# Auto Run As Administrator
$CurrentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$Principal = New-Object Security.Principal.WindowsPrincipal($CurrentUser)

if (-not $Principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Start-Process powershell.exe `
        -ArgumentList "-ExecutionPolicy Bypass -File `"$PSCommandPath`"" `
        -Verb RunAs
    exit
}

# Base Path SSD
$BasePath = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallerPath = Join-Path $BasePath "Installers"
$LogPath = Join-Path $BasePath "Logs"

if (!(Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath | Out-Null
}

$LogFile = Join-Path $LogPath "IT-Tool-Log.txt"

function Write-Log {
    param([string]$Message)
    $Time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$Time - $Message" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}

function Show-Msg {
    param([string]$Message)
    [System.Windows.Forms.MessageBox]::Show($Message, "IT Internal Tool")
}

function Test-Installer {
    param([string]$FilePath)

    if (!(Test-Path $FilePath)) {
        Show-Msg "File installer tidak ditemukan:`n$FilePath"
        Write-Log "ERROR: File tidak ditemukan $FilePath"
        return $false
    }

    return $true
}

function Run-Process {
    param(
        [string]$FilePath,
        [string]$Arguments
    )

    if (Test-Installer $FilePath) {
        try {
            Write-Log "Menjalankan: $FilePath $Arguments"

            Start-Process -FilePath $FilePath `
                -ArgumentList $Arguments `
                -Wait

            Write-Log "Selesai: $FilePath"
            Show-Msg "Proses selesai."
        }
        catch {
            Write-Log "ERROR: $($_.Exception.Message)"
            Show-Msg "Gagal menjalankan installer:`n$($_.Exception.Message)"
        }
    }
}

function Install-Office {
    param(
        [string]$OfficeFolder,
        [string]$ConfigFile
    )

    $Setup = Join-Path $InstallerPath "$OfficeFolder\setup.exe"
    $Config = Join-Path $InstallerPath "$OfficeFolder\$ConfigFile"

    if ((Test-Installer $Setup) -and (Test-Installer $Config)) {
        try {
            Write-Log "Install Office: $OfficeFolder"

            Start-Process -FilePath $Setup `
                -ArgumentList "/configure `"$Config`"" `
                -Wait

            Write-Log "Selesai install Office: $OfficeFolder"
            Show-Msg "Install Office selesai."
        }
        catch {
            Write-Log "ERROR Office: $($_.Exception.Message)"
            Show-Msg "Gagal install Office:`n$($_.Exception.Message)"
        }
    }
}

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
        Write-Log "Rename hostname ke $NewName"
        Rename-Computer -NewName $NewName -Force
        Show-Msg "Hostname berhasil diganti menjadi $NewName.`nSilakan restart komputer."
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
        $Credential = Get-Credential -Message "Masukkan akun domain untuk join domain"

        Write-Log "Join domain ke $DomainName"

        Add-Computer `
            -DomainName $DomainName `
            -OUPath $OUPath `
            -Credential $Credential `
            -Force

        Show-Msg "Join domain berhasil.`nSilakan restart komputer."
    }
    catch {
        Write-Log "ERROR Join Domain: $($_.Exception.Message)"
        Show-Msg "Gagal join domain:`n$($_.Exception.Message)"
    }
}

function Clean-Windows {
    try {
        Write-Log "Mulai clean sampah Windows"

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

function Clean-WindowsUpdateCache {
    try {
        Write-Log "Mulai clean Windows Update cache"

        Stop-Service wuauserv -Force -ErrorAction SilentlyContinue
        Stop-Service bits -Force -ErrorAction SilentlyContinue

        Remove-Item "C:\Windows\SoftwareDistribution\Download\*" `
            -Recurse -Force -ErrorAction SilentlyContinue

        Start-Service wuauserv -ErrorAction SilentlyContinue
        Start-Service bits -ErrorAction SilentlyContinue

        Write-Log "Clean Windows Update cache selesai"
        Show-Msg "Clean Windows Update cache selesai."
    }
    catch {
        Write-Log "ERROR Clean Update Cache: $($_.Exception.Message)"
        Show-Msg "Gagal clean update cache:`n$($_.Exception.Message)"
    }
}

# ===============================
# GUI
# ===============================

$form = New-Object System.Windows.Forms.Form
$form.Text = "IT Internal Tool - Offline SSD"
$form.Size = New-Object System.Drawing.Size(620,620)
$form.StartPosition = "CenterScreen"
$form.MaximizeBox = $false

$title = New-Object System.Windows.Forms.Label
$title.Text = "IT Internal Tool - Offline SSD"
$title.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$title.Size = New-Object System.Drawing.Size(500,35)
$title.Location = New-Object System.Drawing.Point(30,20)
$form.Controls.Add($title)

$info = New-Object System.Windows.Forms.Label
$info.Text = "Base Path: $BasePath"
$info.Size = New-Object System.Drawing.Size(550,25)
$info.Location = New-Object System.Drawing.Point(30,55)
$form.Controls.Add($info)

function Add-Button {
    param(
        [string]$Text,
        [int]$X,
        [int]$Y,
        [scriptblock]$Action
    )

    $btn = New-Object System.Windows.Forms.Button
    $btn.Text = $Text
    $btn.Size = New-Object System.Drawing.Size(250,38)
    $btn.Location = New-Object System.Drawing.Point($X,$Y)
    $btn.Add_Click($Action)
    $form.Controls.Add($btn)
}

# Install Apps
Add-Button "Install Office 2019" 30 100 {
    Install-Office -OfficeFolder "Office2019" -ConfigFile "config2019.xml"
}

Add-Button "Install Office 365" 320 100 {
    Install-Office -OfficeFolder "Office365" -ConfigFile "config365.xml"
}

Add-Button "Install Adobe Reader" 30 150 {
    $File = Join-Path $InstallerPath "AdobeReader\AdobeReader.exe"
    Run-Process $File "/sAll /rs /rps /msi EULA_ACCEPT=YES"
}

Add-Button "Install AnyDesk" 320 150 {
    $File = Join-Path $InstallerPath "AnyDesk\AnyDesk.exe"
    Run-Process $File "--install `"C:\Program Files (x86)\AnyDesk`" --start-with-win --silent"
}

Add-Button "Install SAP GUI" 30 200 {
    $File = Join-Path $InstallerPath "SAPGUI\setup.exe"
    Run-Process $File "/silent"
}

Add-Button "Install Chrome" 320 200 {
    $File = Join-Path $InstallerPath "Chrome\ChromeSetup.exe"
    Run-Process $File "/silent /install"
}

Add-Button "Install Firefox" 30 250 {
    $File = Join-Path $InstallerPath "Firefox\FirefoxSetup.exe"
    Run-Process $File "-ms"
}

Add-Button "Install 7-Zip" 320 250 {
    $File = Join-Path $InstallerPath "7zip\7zSetup.exe"
    Run-Process $File "/S"
}

Add-Button "Install PDF24" 30 300 {
    $File = Join-Path $InstallerPath "PDF24\PDF24.exe"
    Run-Process $File "/VERYSILENT /NORESTART"
}

Add-Button "Install Aruba VIA" 320 300 {
    $File = Join-Path $InstallerPath "ArubaVIA\ArubaVIA.msi"
    Run-Process "msiexec.exe" "/i `"$File`" /qn /norestart"
}

# System Tools
Add-Button "Rename Hostname" 30 370 {
    Rename-Hostname
}

Add-Button "Join Domain" 320 370 {
    Join-Domain
}

Add-Button "Clean Sampah Windows" 30 420 {
    Clean-Windows
}

Add-Button "Clean Windows Update Cache" 320 420 {
    Clean-WindowsUpdateCache
}

Add-Button "Restart Komputer" 30 470 {
    $Confirm = [System.Windows.Forms.MessageBox]::Show(
        "Yakin ingin restart komputer?",
        "Konfirmasi Restart",
        [System.Windows.Forms.MessageBoxButtons]::YesNo
    )

    if ($Confirm -eq [System.Windows.Forms.DialogResult]::Yes) {
        Restart-Computer -Force
    }
}

Add-Button "Buka Folder Logs" 320 470 {
    Start-Process explorer.exe $LogPath
}

$form.ShowDialog()