# del-git.ps1
# This script searches recursively for .git directories and deletes them using PowerShell force remove.

Write-Host "Searching for .git folders and removing them..." -ForegroundColor Yellow

# Find all .git directories recursively and remove them with force
Get-ChildItem -Path . -Directory -Recurse -Force | Where-Object { $_.Name -eq ".git" } | ForEach-Object {
    $gitPath = $_.FullName
    Write-Host "Removing: $gitPath" -ForegroundColor Red
    Remove-Item -Path $gitPath -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Done! All .git directories removed." -ForegroundColor Green