import { SoftwareApp, SystemTool, SystemTweak, SystemInformation, ProjectFile, ExecutionLog, ManifestConfig } from '../types';

export const DEFAULT_SOFTWARE_APPS: SoftwareApp[] = [
  {
    id: 'office2019',
    name: 'Microsoft Office 2019 ProPlus',
    category: 'Productivity',
    version: '16.0.10411.20011',
    silentArgs: '/configure configuration.xml',
    estimatedMB: 3200,
    mandatory: true,
    description: 'Word, Excel, PowerPoint, Outlook, Access 2019 Offline Installer for PDSI Workstations.',
    installerFileName: 'Setup_Office2019_x64.exe',
    iconName: 'FileText',
    status: 'not_installed',
  },
  {
    id: 'm365',
    name: 'Microsoft 365 Apps for Enterprise',
    category: 'Productivity',
    version: 'Version 2406 (Build 17726.20160)',
    silentArgs: 'setup.exe /configure M365_Config.xml',
    estimatedMB: 3500,
    mandatory: false,
    description: 'Cloud-connected Microsoft 365 Suite with enterprise update channel.',
    installerFileName: 'OfficeSetup_M365_x64.exe',
    iconName: 'Cloud',
    status: 'not_installed',
  },
  {
    id: 'adobereader',
    name: 'Adobe Acrobat Reader DC',
    category: 'PDF & Docs',
    version: '24.002.20895',
    silentArgs: '/sAll /rs /msi EULA_ACCEPT=YES',
    estimatedMB: 350,
    mandatory: true,
    description: 'Standard PDF viewer for viewing, printing, and commenting on PDF documents.',
    installerFileName: 'AcroRdrDC_x64.exe',
    iconName: 'FileCode',
    status: 'installed',
  },
  {
    id: 'chrome',
    name: 'Google Chrome Enterprise',
    category: 'Browser',
    version: '126.0.6478.127',
    silentArgs: '/silent /install',
    estimatedMB: 120,
    mandatory: true,
    description: 'Chrome standalone enterprise bundle with GPO policy support.',
    installerFileName: 'GoogleChromeStandaloneEnterprise64.msi',
    iconName: 'Globe',
    status: 'installed',
  },
  {
    id: 'firefox',
    name: 'Mozilla Firefox Extended Support',
    category: 'Browser',
    version: '115.12.0 ESR',
    silentArgs: '-ms',
    estimatedMB: 110,
    mandatory: false,
    description: 'Firefox ESR web browser for corporate stability.',
    installerFileName: 'Firefox_Setup_ESR_x64.exe',
    iconName: 'Flame',
    status: 'not_installed',
  },
  {
    id: '7zip',
    name: '7-Zip 24.08 x64',
    category: 'Utility',
    version: '24.08',
    silentArgs: '/S',
    estimatedMB: 5,
    mandatory: true,
    description: 'High-ratio file archiver utility supporting .7z, .zip, .rar, .tar, .gz.',
    installerFileName: '7z2408-x64.exe',
    iconName: 'Archive',
    status: 'installed',
  },
  {
    id: 'pdf24',
    name: 'PDF24 Creator',
    category: 'PDF & Docs',
    version: '11.15.2',
    silentArgs: '/SILENT /NORESTART',
    estimatedMB: 140,
    mandatory: false,
    description: 'Virtual PDF printer, merger, splitter, and compression toolkit.',
    installerFileName: 'pdf24-creator-11.15.2-x64.exe',
    iconName: 'Printer',
    status: 'not_installed',
  },
  {
    id: 'pdfsam',
    name: 'PDFSAM Basic',
    category: 'PDF & Docs',
    version: '5.2.3',
    silentArgs: '/quiet /norestart',
    estimatedMB: 85,
    mandatory: false,
    description: 'Free open source tool to split, merge, rotate, and extract PDF pages.',
    installerFileName: 'pdfsam-v5.2.3-x64.msi',
    iconName: 'Scissors',
    status: 'not_installed',
  },
  {
    id: 'revpdf',
    name: 'RevPDF Reader & Converter',
    category: 'PDF & Docs',
    version: '3.5.2',
    silentArgs: '/verysilent /norestart',
    estimatedMB: 45,
    mandatory: false,
    description: 'Lightweight PDF viewer and document batch converter for legacy machines.',
    installerFileName: 'RevPDF_Setup.exe',
    iconName: 'BookOpen',
    status: 'not_installed',
  },
  {
    id: 'sapgui',
    name: 'SAP GUI for Windows 8.00',
    category: 'Enterprise',
    version: '8.00 PL2',
    silentArgs: '/Silent /Package="PDSI_Standard"',
    estimatedMB: 1200,
    mandatory: true,
    description: 'SAP Enterprise Client frontend for PDSI ERP system access.',
    installerFileName: 'SAPGUI_800_PL2.exe',
    iconName: 'Database',
    status: 'not_installed',
  },
  {
    id: 'arubavpn',
    name: 'Aruba VIA VPN Client',
    category: 'Network',
    version: '4.5.1.18520',
    silentArgs: '/qn /norestart',
    estimatedMB: 65,
    mandatory: true,
    description: 'Virtual Intranet Access VPN client for secure remote connection to PDSI network.',
    installerFileName: 'ArubaViaSetup-x64.msi',
    iconName: 'ShieldCheck',
    status: 'not_installed',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams (Work or School)',
    category: 'Communication',
    version: '24165.1410.2974.6689',
    silentArgs: '-msi /qn',
    estimatedMB: 180,
    mandatory: true,
    description: 'New Microsoft Teams client for corporate collaboration & calls.',
    installerFileName: 'MSTeamsSetup_x64.exe',
    iconName: 'Users',
    status: 'installed',
  },
  {
    id: 'anydesk',
    name: 'AnyDesk Remote Control',
    category: 'Remote',
    version: '8.0.8',
    silentArgs: '--install "C:\\Program Files (x86)\\AnyDesk" --start-with-win --silent',
    estimatedMB: 12,
    mandatory: false,
    description: 'Remote desktop support application for ICT helpdesk assistance.',
    installerFileName: 'AnyDesk.exe',
    iconName: 'MonitorPlay',
    status: 'installed',
  },
  {
    id: 'cortexxdr',
    name: 'Cortex XDR Agent (Palo Alto)',
    category: 'Security',
    version: '8.3.1.11902',
    silentArgs: '/qn /norestart',
    estimatedMB: 210,
    mandatory: true,
    description: 'Endpoint protection, EDR, and threat detection agent managed by ICT Security.',
    installerFileName: 'CortexXDR_PDSI_x64.msi',
    iconName: 'Lock',
    status: 'installed',
  },
];

export const DEFAULT_SYSTEM_TOOLS: SystemTool[] = [
  {
    id: 'rename_hostname',
    name: 'Rename Hostname',
    category: 'System Admin',
    description: 'Rename Windows Computer Name and prompt for reboot.',
    iconName: 'Edit3',
    psCommand: 'Rename-Computer -NewName "{param1}" -Force -Verbose',
    requiresParams: true,
    paramLabel: 'New Hostname (e.g. PDSI-WK-0920)',
    paramPlaceholder: 'PDSI-WK-XXXX',
    paramDefault: 'PDSI-WK-0842',
  },
  {
    id: 'join_domain',
    name: 'Join Domain',
    category: 'Domain',
    description: 'Join local workstation to PDSI Active Directory Domain.',
    iconName: 'Network',
    psCommand: 'Add-Computer -DomainName "{param1}" -OUPath "{param2}" -Force -Verbose',
    requiresParams: true,
    paramLabel: 'Target Domain Name',
    paramPlaceholder: 'PDSI.CORP.LOCAL',
    paramDefault: 'PDSI.CORP.LOCAL',
    secondParamLabel: 'Organizational Unit (OU)',
    secondParamPlaceholder: 'OU=Workstations,DC=PDSI,DC=CORP,DC=LOCAL',
    secondParamDefault: 'OU=Workstations,DC=PDSI,DC=CORP,DC=LOCAL',
  },
  {
    id: 'ping_network',
    name: 'Ping Network / Gateway',
    category: 'Network',
    description: 'Test ICMP connection & latency to domain controller or gateway.',
    iconName: 'Activity',
    psCommand: 'Test-Connection -ComputerName "{param1}" -Count 4 -ErrorAction Stop',
    requiresParams: true,
    paramLabel: 'Target IP / Hostname',
    paramPlaceholder: '10.10.1.10 or pdsi.corp.local',
    paramDefault: '10.10.1.10',
  },
  {
    id: 'flush_dns',
    name: 'Flush DNS Cache',
    category: 'Network',
    description: 'Clear local resolver cache to refresh domain name resolution.',
    iconName: 'RefreshCw',
    psCommand: 'Clear-DnsClientCache; Write-Host "DNS Client Cache successfully flushed."',
    requiresParams: false,
  },
  {
    id: 'release_renew_ip',
    name: 'Release / Renew IP',
    category: 'Network',
    description: 'Release DHCP lease and request new IPv4 address assignment.',
    iconName: 'Wifi',
    psCommand: 'ipconfig /release; Start-Sleep -Seconds 2; ipconfig /renew',
    requiresParams: false,
  },
  {
    id: 'reset_winsock',
    name: 'Reset Winsock Catalog',
    category: 'Network',
    description: 'Reset TCP/IP stack and Winsock catalog to resolve socket corruption.',
    iconName: 'Zap',
    psCommand: 'netsh winsock reset; netsh int ip reset; Write-Host "Winsock & IP Stack reset. Reboot required."',
    requiresParams: false,
  },
  {
    id: 'open_cmd',
    name: 'Launch CMD (Admin)',
    category: 'Utilities',
    description: 'Open Command Prompt with elevated Administrator privileges.',
    iconName: 'Terminal',
    psCommand: 'Start-Process cmd.exe -Verb RunAs',
    requiresParams: false,
  },
  {
    id: 'open_powershell',
    name: 'Launch PowerShell 5.1',
    category: 'Utilities',
    description: 'Open elevated 64-bit Windows PowerShell 5.1 console.',
    iconName: 'Code',
    psCommand: 'Start-Process powershell.exe -ArgumentList "-NoExit -ExecutionPolicy Bypass" -Verb RunAs',
    requiresParams: false,
  },
  {
    id: 'open_services',
    name: 'Services Manager',
    category: 'System Admin',
    description: 'Launch services.msc to inspect background Windows services.',
    iconName: 'Cpu',
    psCommand: 'Start-Process services.msc',
    requiresParams: false,
  },
  {
    id: 'open_devmgmt',
    name: 'Device Manager',
    category: 'System Admin',
    description: 'Launch devmgmt.msc to check driver status and hardware devices.',
    iconName: 'HardDrive',
    psCommand: 'Start-Process devmgmt.msc',
    requiresParams: false,
  },
];

export const DEFAULT_SYSTEM_TWEAKS: SystemTweak[] = [
  {
    id: 'temp_cleanup',
    name: 'Temp Files Cleanup',
    category: 'Disk & Maintenance',
    description: 'Purge Windows %TEMP%, C:\\Windows\\Temp, Prefetch, and SoftwareDistribution downloads.',
    psCommand: `Remove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Temporary disk space reclaimed successfully."`,
    risk: 'Safe',
    recommended: true,
  },
  {
    id: 'sfc_scan',
    name: 'SFC System File Checker',
    category: 'System Integrity',
    description: 'Run sfc /scannow to inspect and repair corrupted Windows system DLLs.',
    psCommand: 'sfc /scannow',
    risk: 'Safe',
    recommended: true,
  },
  {
    id: 'dism_repair',
    name: 'DISM Image Repair',
    category: 'System Integrity',
    description: 'Run DISM /Online /Cleanup-Image /RestoreHealth against Windows component store.',
    psCommand: 'DISM.exe /Online /Cleanup-Image /RestoreHealth',
    risk: 'Safe',
    recommended: true,
  },
  {
    id: 'chkdsk_check',
    name: 'CHKDSK Disk Verification',
    category: 'Disk & Maintenance',
    description: 'Schedule CHKDSK C: /F /R for bad sector check on next reboot.',
    psCommand: 'chkdsk C: /f /r',
    risk: 'Moderate',
    recommended: false,
  },
  {
    id: 'show_hidden_files',
    name: 'Show Hidden Files & System Items',
    category: 'Explorer & UI',
    description: 'Enable File Explorer setting to display hidden files and folders.',
    psCommand: `Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" -Name "Hidden" -Value 1
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" -Name "ShowSuperHidden" -Value 1
Get-Process explorer | Stop-Process
Write-Host "Hidden files visibility enabled."`,
    risk: 'Safe',
    recommended: true,
  },
  {
    id: 'show_extensions',
    name: 'Show File Name Extensions',
    category: 'Explorer & UI',
    description: 'Force File Explorer to always show file extensions (.exe, .ps1, .docx, .pdf).',
    psCommand: `Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" -Name "HideFileExt" -Value 0
Get-Process explorer | Stop-Process
Write-Host "File extensions unhidden."`,
    risk: 'Safe',
    recommended: true,
  },
  {
    id: 'high_performance_power',
    name: 'Set High Performance Power Plan',
    category: 'Performance & Power',
    description: 'Switch power plan to High Performance to prevent CPU throttling on workstations.',
    psCommand: `powercfg /s 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
Write-Host "Power plan switched to High Performance."`,
    risk: 'Safe',
    recommended: true,
  },
  {
    id: 'disable_fast_startup',
    name: 'Disable Fast Startup (Hiberboot)',
    category: 'Performance & Power',
    description: 'Disable Fast Startup to allow complete Windows shutdown, preventing driver state locks.',
    psCommand: `Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power" -Name "HiberbootEnabled" -Value 0
Write-Host "Fast Startup disabled."`,
    risk: 'Moderate',
    recommended: true,
  },
];

export const MOCK_SYSTEM_INFO: SystemInformation = {
  hardware: {
    cpu: '13th Gen Intel(R) Core(TM) i7-13700 @ 2.10 GHz',
    coresThreads: '16 Cores / 24 Threads',
    ramInstalled: '32.0 GB DDR5 (2 x 16GB)',
    ramSpeed: '4800 MHz',
    disks: [
      { drive: 'C:', type: 'NVMe M.2 SSD (SAMSUNG MZVL21T0HCLR)', totalGB: 512, freeGB: 284 },
      { drive: 'D:', type: 'External SSD (SanDisk Extreme Portable)', totalGB: 1024, freeGB: 742 },
    ],
    motherboard: 'Dell Inc. 0M7K8V (Chipset Intel Q670)',
    gpu: 'Intel(R) UHD Graphics 770 + NVIDIA T1000 8GB',
    serialNumber: 'PDSI-8F3K912',
  },
  os: {
    edition: 'Windows 11 Enterprise 64-bit',
    versionBuild: '23H2 (Build 22631.3737)',
    architecture: 'x64-based processor',
    installDate: '2024-01-15 09:22:18',
    uptime: '3 days, 14 hours, 28 minutes',
    lastBoot: '2026-07-20 06:06:48',
  },
  office: {
    installedProduct: 'Microsoft Office Professional Plus 2019',
    version: '16.0.10411.20011 (64-bit)',
    architecture: '64-bit (x64)',
    licenseType: 'KMS Enterprise Volume License',
    licenseStatus: 'LICENSED (Product Activated)',
  },
  network: {
    hostname: 'PDSI-WK-0842',
    adapterName: 'Intel(R) Ethernet Connection (17) I219-LM',
    ipv4Address: '10.10.14.128',
    subnetMask: '255.255.255.0',
    defaultGateway: '10.10.14.1',
    macAddress: '34:E6:D7:88:A1:BF',
    dnsServers: ['10.10.1.10', '10.10.1.11'],
    linkSpeed: '1000 Mbps (Full Duplex)',
  },
  domain: {
    domainName: 'PDSI.CORP.LOCAL',
    domainStatus: 'Domain Joined',
    currentUser: 'PDSI\\tech_admin',
    domainController: 'PDSI-DC-01.PDSI.CORP.LOCAL',
    organizationalUnit: 'OU=Workstations,OU=Jakarta_HQ,DC=PDSI,DC=CORP,DC=LOCAL',
  },
};

export const INITIAL_PROJECT_FILES: ProjectFile[] = [
  {
    path: 'Launcher.ps1',
    name: 'Launcher.ps1',
    folder: 'Root',
    language: 'powershell',
    description: 'Initial entry script located on external SSD launcher media. Checks GitHub for source update.',
    content: `# ==============================================================================
# ICT PDSI Utility - Launcher Script
# Platform: Windows 10/11 | PowerShell 5.1
# ==============================================================================

#Requires -RunAsAdministrator
[CmdletBinding()]
param(
    [string]$ManifestPath = "$PSScriptRoot\\Config\\Manifest.json",
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
$BootstrapScript = "$PSScriptRoot\\Bootstrap.ps1"
if (Test-Path -Path $BootstrapScript) {
    & $BootstrapScript -ManifestObj $Manifest
} else {
    Write-Error "Bootstrap script missing: $BootstrapScript"
    exit 1
}
`,
  },
  {
    path: 'Bootstrap.ps1',
    name: 'Bootstrap.ps1',
    folder: 'Root',
    language: 'powershell',
    description: 'Verifies Windows runtime requirements, loads assemblies, and executes Main.ps1 GUI.',
    content: `# ==============================================================================
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
$LoggerModule = "$PSScriptRoot\\Modules\\Logger.psm1"
if (Test-Path -Path $LoggerModule) {
    Import-Module $LoggerModule -Force
    Write-PDSIlog -Action "Bootstrap" -Result "PowerShell & WPF Assemblies Loaded" -Status "SUCCESS"
}

# Launch Main GUI Engine
$MainScript = "$PSScriptRoot\\Main.ps1"
if (Test-Path -Path $MainScript) {
    & $MainScript -Manifest $ManifestObj
} else {
    Write-Error "Main GUI script not found: $MainScript"
}
`,
  },
  {
    path: 'Main.ps1',
    name: 'Main.ps1',
    folder: 'Root',
    language: 'powershell',
    description: 'Main GUI controller loading Main.xaml WPF layout and binding event handlers to Modules.',
    content: `# ==============================================================================
# ICT PDSI Utility - Main Controller Script
# ==============================================================================

param(
    [object]$Manifest
)

# Load Modules
Get-ChildItem -Path "$PSScriptRoot\\Modules\\*.psm1" | ForEach-Object {
    Import-Module $_.FullName -Force
}

# Load XAML GUI
$XamlFile = "$PSScriptRoot\\Xaml\\Main.xaml"
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
`,
  },
  {
    path: 'Config/Manifest.json',
    name: 'Manifest.json',
    folder: 'Config',
    language: 'json',
    description: 'Central JSON configuration declaring software list, SSD paths, domain targets, and logs.',
    content: JSON.stringify(
      {
        version: '1.0.0',
        lastUpdated: '2026-07-23',
        repository: 'https://github.com/pdsi-ict/ict-pdsi-utility',
        installerRootSSD: 'D:\\ICT_Tools\\Installers',
        logFilePath: 'C:\\ProgramData\\ICT_PDSI_Utility\\Logs\\activity.log',
        applications: DEFAULT_SOFTWARE_APPS.map((a) => ({
          id: a.id,
          name: a.name,
          category: a.category,
          silentArgs: a.silentArgs,
          estimatedMB: a.estimatedMB,
          mandatory: a.mandatory,
          installerFileName: a.installerFileName,
        })),
        networkDomain: {
          targetDomain: 'PDSI.CORP.LOCAL',
          preferredDNS: '10.10.1.10',
          alternateDNS: '10.10.1.11',
        },
      },
      null,
      2
    ),
  },
  {
    path: 'Modules/Install.psm1',
    name: 'Install.psm1',
    folder: 'Modules',
    language: 'powershell',
    description: 'Software installer module executing silent background setups from external SSD media.',
    content: `# ==============================================================================
# Module: Install.psm1 - Software Installer Engine
# ==============================================================================

function Invoke-SoftwareInstaller {
    param(
        [Parameter(Mandatory=$true)][string]$AppId,
        [Parameter(Mandatory=$true)][string]$InstallerPath,
        [string]$SilentArgs
    )
    
    Write-Host "[+] Starting installation: $AppId" -ForegroundColor Cyan
    Write-Host "[*] Executable: $InstallerPath" -ForegroundColor Gray
    Write-Host "[*] Arguments:  $SilentArgs" -ForegroundColor Gray
    
    if (-not (Test-Path -Path $InstallerPath)) {
        Write-Error "Installer file not found on SSD: $InstallerPath"
        Write-PDSIlog -Action "Install $AppId" -Result "File missing on SSD" -Status "FAILED"
        return $false
    }
    
    $Process = Start-Process -FilePath $InstallerPath -ArgumentList $SilentArgs -Wait -PassThru -NoNewWindow
    
    if ($Process.ExitCode -eq 0) {
        Write-Host "[SUCCESS] $AppId installed successfully (Exit Code 0)" -ForegroundColor Green
        Write-PDSIlog -Action "Install $AppId" -Result "Installed successfully" -Status "SUCCESS"
        return $true
    } else {
        Write-Warning "[FAILED] $AppId installation failed with Exit Code $($Process.ExitCode)"
        Write-PDSIlog -Action "Install $AppId" -Result "Exit Code $($Process.ExitCode)" -Status "FAILED"
        return $false
    }
}

Export-ModuleMember -Function Invoke-SoftwareInstaller
`,
  },
  {
    path: 'Modules/Tools.psm1',
    name: 'Tools.psm1',
    folder: 'Modules',
    language: 'powershell',
    description: 'System administration tools module handling Hostname, Domain Join, Ping, Winsock, DNS.',
    content: `# ==============================================================================
# Module: Tools.psm1 - Windows System Administration Tools
# ==============================================================================

function Invoke-PDSITool {
    param(
        [Parameter(Mandatory=$true)][string]$ToolId,
        [string]$Param1,
        [string]$Param2
    )

    switch ($ToolId) {
        "rename_hostname" {
            Rename-Computer -NewName $Param1 -Force
            Write-Host "[+] Computer renamed to $Param1. Reboot required." -ForegroundColor Green
            Write-PDSIlog -Action "Rename Hostname" -Result "Renamed to $Param1" -Status "SUCCESS"
        }
        "join_domain" {
            Add-Computer -DomainName $Param1 -OUPath $Param2 -Force
            Write-Host "[+] Successfully joined domain $Param1." -ForegroundColor Green
            Write-PDSIlog -Action "Join Domain" -Result "Joined $Param1" -Status "SUCCESS"
        }
        "flush_dns" {
            Clear-DnsClientCache
            Write-Host "[+] DNS Client cache cleared." -ForegroundColor Green
            Write-PDSIlog -Action "Flush DNS" -Result "Cache flushed" -Status "SUCCESS"
        }
        "reset_winsock" {
            netsh winsock reset | Out-Null
            netsh int ip reset | Out-Null
            Write-Host "[+] Winsock & IP catalog reset completed." -ForegroundColor Green
            Write-PDSIlog -Action "Reset Winsock" -Result "Catalog reset" -Status "SUCCESS"
        }
        Default {
            Write-Warning "Unknown tool command: $ToolId"
        }
    }
}

Export-ModuleMember -Function Invoke-PDSITool
`,
  },
  {
    path: 'Modules/Tweaks.psm1',
    name: 'Tweaks.psm1',
    folder: 'Modules',
    language: 'powershell',
    description: 'System tweak engine handling Temp cleanup, SFC, DISM, Registry explorer settings & power plans.',
    content: `# ==============================================================================
# Module: Tweaks.psm1 - Windows Maintenance & Optimizations
# ==============================================================================

function Invoke-PDSITweak {
    param(
        [Parameter(Mandatory=$true)][string]$TweakId
    )

    switch ($TweakId) {
        "temp_cleanup" {
            Remove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue
            Remove-Item -Path "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "[+] Reclaimed temporary disk space." -ForegroundColor Green
            Write-PDSIlog -Action "Temp Cleanup" -Result "Temp files removed" -Status "SUCCESS"
        }
        "sfc_scan" {
            sfc /scannow
            Write-PDSIlog -Action "SFC Scan" -Result "System files checked" -Status "SUCCESS"
        }
        "high_performance_power" {
            powercfg /s 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
            Write-Host "[+] Power plan set to High Performance." -ForegroundColor Green
            Write-PDSIlog -Action "High Performance Power" -Result "Power plan applied" -Status "SUCCESS"
        }
        Default {
            Write-Host "[*] Executing tweak: $TweakId" -ForegroundColor Gray
        }
    }
}

Export-ModuleMember -Function Invoke-PDSITweak
`,
  },
  {
    path: 'Modules/Logger.psm1',
    name: 'Logger.psm1',
    folder: 'Modules',
    language: 'powershell',
    description: 'UTF-8 structured activity logger writing Timestamp, User, Computer, Action, Result, Status.',
    content: `# ==============================================================================
# Module: Logger.psm1 - UTF-8 Structured Activity Logging
# Format: Timestamp | User | Computer Name | Action | Result | Status
# ==============================================================================

function Write-PDSIlog {
    param(
        [Parameter(Mandatory=$true)][string]$Action,
        [Parameter(Mandatory=$true)][string]$Result,
        [Parameter(Mandatory=$true)][string]$Status, # SUCCESS, FAILED, WARNING, IN_PROGRESS
        [string]$LogPath = "C:\\ProgramData\\ICT_PDSI_Utility\\Logs\\activity.log"
    )

    $LogDir = Split-Path -Path $LogPath -Parent
    if (-not (Test-Path -Path $LogDir)) {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    }

    $Timestamp    = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $User         = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    $ComputerName = $env:COMPUTERNAME

    $LogEntry = "$Timestamp | $User | $ComputerName | $Action | $Result | $Status"
    
    # Write UTF-8 Log line
    Add-Content -Path $LogPath -Value $LogEntry -Encoding UTF8
    Write-Host "LOG: $LogEntry" -ForegroundColor DarkGray
}

Export-ModuleMember -Function Write-PDSIlog
`,
  },
  {
    path: 'Xaml/Main.xaml',
    name: 'Main.xaml',
    folder: 'Xaml',
    language: 'xml',
    description: 'Windows Presentation Foundation (WPF) XAML user interface grid definition.',
    content: `<Window x:Class="ICT_PDSI_Utility.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="ICT PDSI Utility v1.0 - Windows Technician Suite" Height="720" Width="1100"
        Background="#F3F4F6" WindowStartupLocation="CenterScreen">
    <Grid Margin="12">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>
        
        <!-- Header Bar -->
        <Border Grid.Row="0" Background="#1E293B" CornerRadius="8" Padding="16" Margin="0,0,0,12">
            <StackPanel Orientation="Horizontal" HorizontalAlignment="Stretch">
                <TextBlock Text="ICT PDSI UTILITY v1.0" Foreground="#38BDF8" FontSize="20" FontWeight="Bold"/>
                <TextBlock Text="  |  Workstation Technician Tool" Foreground="#94A3B8" FontSize="14" VerticalAlignment="Center"/>
            </StackPanel>
        </Border>
        
        <!-- Main Tab Control -->
        <TabControl Grid.Row="1" Background="White" BorderBrush="#E2E8F0">
            <TabItem Header="Software Deployment">
                <Grid Margin="10">
                    <TextBlock Text="Software Batch Installer Queue" FontSize="16" FontWeight="SemiBold"/>
                    <!-- Installers Grid -->
                </Grid>
            </TabItem>
            <TabItem Header="Admin Tools">
                <Grid Margin="10">
                    <TextBlock Text="Windows Administrative Commands" FontSize="16" FontWeight="SemiBold"/>
                </Grid>
            </TabItem>
            <TabItem Header="Tweaks &amp; Fixes">
                <Grid Margin="10">
                    <TextBlock Text="Performance &amp; System Maintenance" FontSize="16" FontWeight="SemiBold"/>
                </Grid>
            </TabItem>
            <TabItem Header="System Information">
                <Grid Margin="10">
                    <TextBlock Text="Hardware &amp; Network Diagnostics" FontSize="16" FontWeight="SemiBold"/>
                </Grid>
            </TabItem>
        </TabControl>
        
        <!-- Terminal Footer -->
        <Border Grid.Row="2" Background="#0F172A" CornerRadius="6" Padding="10" Margin="0,12,0,0">
            <TextBox x:Name="TxtConsole" Background="Transparent" Foreground="#4ADE80" FontFamily="Consolas"
                     IsReadOnly="True" Text="[PDSI System] Utility initialized. Ready for technician input." BorderThickness="0"/>
        </Border>
    </Grid>
</Window>
`,
  },
];
