Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess

# Replace 1234 with the number you got above
Stop-Process -Id 1234 -Force