# ==============================================================================
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
