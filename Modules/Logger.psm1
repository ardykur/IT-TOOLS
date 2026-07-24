# ==============================================================================
# Module: Logger.psm1 - UTF-8 Structured Activity Logging
# Format: Timestamp | User | Computer Name | Action | Result | Status
# ==============================================================================

function Write-PDSIlog {
    param(
        [Parameter(Mandatory=$true)][string]$Action,
        [Parameter(Mandatory=$true)][string]$Result,
        [Parameter(Mandatory=$true)][string]$Status, # SUCCESS, FAILED, WARNING, IN_PROGRESS
        [string]$LogPath = "C:\ProgramData\ICT_PDSI_Utility\Logs\activity.log"
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
