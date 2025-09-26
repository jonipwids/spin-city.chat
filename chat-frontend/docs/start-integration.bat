@echo off
echo Starting CS Socket Backend and Frontend integration...

echo.
echo Starting Go backend...
cd /d "c:\Job\AWS-Ubuntu\cs-socket"
start /b cmd /c "go run main.go"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting Next.js frontend...
cd /d "c:\Job\cs-fork"
start /b cmd /c "npm run dev"

echo.
echo Services are starting:
echo   - Backend API: http://localhost:8080
echo   - Frontend: http://localhost:3000
echo.
echo Press any key to stop all services...
pause > nul

echo Stopping services...
taskkill /f /im go.exe 2>nul
taskkill /f /im node.exe 2>nul