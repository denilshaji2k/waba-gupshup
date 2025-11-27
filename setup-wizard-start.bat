@echo off
REM WABA BSP Setup Wizard Quick Start (Windows)
REM Opens the setup wizard in your default browser
REM Usage: setup-wizard-start.bat

setlocal enabledelayedexpansion

cls

echo.
echo ================================================================================
echo                 WABA BSP Platform - Setup Wizard
echo ================================================================================
echo.

REM Get project root
set PROJECT_ROOT=%~dp0
set WIZARD_FILE=%PROJECT_ROOT%setup-wizard.html

REM Check if wizard exists
if not exist "%WIZARD_FILE%" (
    echo [WARN] Setup wizard not found!
    echo Expected location: %WIZARD_FILE%
    pause
    exit /b 1
)

echo [OK] Found setup wizard
echo.

REM Check if Node.js is available
where /q node
if errorlevel 1 (
    echo [WARN] Node.js not found. Attempting to use Python...
    goto try_python
)

REM Try to start with Node.js
echo [INFO] Starting HTTP server with Node.js...

REM Create temporary server script
set TEMP_SERVER=%temp%\waba-setup-server.js
(
    echo const http = require('http');
    echo const fs = require('fs');
    echo const path = require('path');
    echo const os = require('os');
    echo.
    echo const PORT = process.env.PORT ^|^| 8000;
    echo const projectRoot = process.env.PROJECT_ROOT ^|^| __dirname;
    echo.
    echo const server = http.createServer((req, res) =^> {
    echo     let filePath = path.join(projectRoot, req.url);
    echo.
    echo     if (req.url === '/' ^|^| req.url === '') {
    echo         filePath = path.join(projectRoot, 'setup-wizard.html');
    echo     }
    echo.
    echo     fs.readFile(filePath, (err, content) =^> {
    echo         if (err) {
    echo             res.writeHead(404);
    echo             res.end('File not found');
    echo             return;
    echo         }
    echo.
    echo         const ext = path.extname(filePath);
    echo         let contentType = 'text/plain';
    echo.
    echo         if (ext === '.html') contentType = 'text/html';
    echo         else if (ext === '.js') contentType = 'application/javascript';
    echo         else if (ext === '.css') contentType = 'text/css';
    echo.
    echo         res.writeHead(200, { 'Content-Type': contentType });
    echo         res.end(content);
    echo     });
    echo });
    echo.
    echo server.listen(PORT, () =^> {
    echo     const url = `http://localhost:${PORT}/setup-wizard.html`;
    echo     console.log(`✓ Server running at ${url}`);
    echo });
) > "%TEMP_SERVER%"

set PORT=8000
set "URL=http://localhost:%PORT%/setup-wizard.html"

echo [OK] Server starting on %URL%
echo [WARN] Press Ctrl+C to stop the server
echo.

REM Open browser
start "" "%URL%"

REM Start server
set PROJECT_ROOT=%PROJECT_ROOT%
set PORT=%PORT%
node "%TEMP_SERVER%"
del "%TEMP_SERVER%"
goto :eof

:try_python
where /q python
if errorlevel 1 (
    goto no_server
)

echo [INFO] Starting HTTP server with Python...

for /f "delims=" %%A in ('python --version 2^>^&1') do set PYTHON_VERSION=%%A

set PORT=8000
set "URL=http://localhost:%PORT%/setup-wizard.html"

echo [OK] Server starting on %URL%
echo [WARN] Press Ctrl+C to stop the server
echo.

REM Open browser
start "" "%URL%"

REM Start server
cd /d "%PROJECT_ROOT%"
python -m http.server %PORT%
goto :eof

:no_server
echo.
echo [ERROR] No suitable HTTP server found!
echo.
echo Please open the following file in your browser:
echo.
echo %WIZARD_FILE%
echo.
echo Or install Node.js (recommended) and run this script again.
echo.
echo Download Node.js from: https://nodejs.org/
echo.
pause
exit /b 1
