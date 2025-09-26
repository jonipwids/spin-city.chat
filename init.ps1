# init.ps1 - Git repository initialization script
# Usage: .\init.ps1 -Token "your_github_token_here"

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

Write-Host "Initializing git repository with provided token..." -ForegroundColor Green

git init
git remote set-url origin https://jonipwids:$Token@github.com/jonipwids/spin-city.chat.git
git remote add origin https://jonipwids:$Token@github.com/jonipwids/spin-city.chat.git
git add .
git commit -m "Initial commit"
git push --set-upstream origin master
git pull --rebase origin master
Write-Host "Git remote origin checked!" -ForegroundColor Red
git remote -v
git remote remove origin
Write-Host "Git remote origin removed!" -ForegroundColor Green
git remote -v
./del-git.ps1

Write-Host "Git initialization process completed!" -ForegroundColor Green