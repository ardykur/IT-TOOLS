# ==============================================================================
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
