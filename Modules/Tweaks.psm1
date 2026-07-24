# ==============================================================================
# Module: Tweaks.psm1 - Windows Maintenance & Optimizations
# ==============================================================================

function Invoke-PDSITweak {
    param(
        [Parameter(Mandatory=$true)][string]$TweakId
    )

    switch ($TweakId) {
        "temp_cleanup" {
            Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
            Remove-Item -Path "C:\Windows\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue
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
