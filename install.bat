@echo off
REM WABA BSP Platform - One-Command Installation Script (Windows Batch)
REM Usage: install.bat development
REM Environments: development, production, staging

setlocal enabledelayedexpansion

if "%1"=="" (
    set ENVIRONMENT=development
) else (
    set ENVIRONMENT=%1
)

REM Configuration
set PROJECT_DIR=%CD%
set BACKEND_DIR=%PROJECT_DIR%\server
set FRONTEND_DIR=%PROJECT_DIR%\client
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set TIMESTAMP=%mydate%_%mytime%

cls
title WABA BSP Platform Installation

REM Color codes (using echo with findstr trick for colors)
call :print_header "WABA BSP Platform Installation"

echo.
echo Environment: %ENVIRONMENT%
echo Project Dir: %PROJECT_DIR%
echo.

call :check_prerequisites
call :collect_environment_variables
call :setup_backend
call :setup_frontend
call :print_summary

pause
exit /b 0

REM ============================================================================
REM FUNCTIONS
REM ============================================================================

:print_header
echo.
echo ================================================================================
echo %~1
echo ================================================================================
echo.
goto :eof

:print_step
echo [OK] %~1
goto :eof

:print_info
echo [INFO] %~1
goto :eof

:print_warning
echo [WARN] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

:check_prerequisites
call :print_header "Checking Prerequisites"

REM Check Node.js
where /q node
if errorlevel 1 (
    call :print_error "Node.js 18.x or higher is required"
    call :print_error "Download from: https://nodejs.org/"
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
call :print_step "Node.js installed: %NODE_VERSION%"

REM Check npm
where /q npm
if errorlevel 1 (
    call :print_error "npm is required"
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
call :print_step "npm installed: %NPM_VERSION%"

REM Check Git
where /q git
if %errorlevel% equ 0 (
    call :print_step "Git is available"
) else (
    call :print_warning "Git not found - some features may not work"
)

echo.
goto :eof

:collect_environment_variables
call :print_header "Environment Configuration"

REM Default values
set /p PORT="Enter server port (default: 5000): "
if "!PORT!"=="" set PORT=5000

if "%ENVIRONMENT%"=="production" (
    set NODE_ENV=production
    set REACT_APP_ENV=production
) else (
    set NODE_ENV=%ENVIRONMENT%
    set REACT_APP_ENV=%ENVIRONMENT%
)

call :print_info "Database Configuration"
if "%ENVIRONMENT%"=="production" (
    set /p MONGODB_URI="Enter MongoDB Atlas URI (mongodb+srv://...): "
) else (
    set MONGODB_URI=mongodb://localhost:27017/waba-bsp
    echo MongoDB URI: mongodb://localhost:27017/waba-bsp
)

REM Generate random strings for secrets
call :generate_random_string JWT_SECRET
call :generate_random_string REFRESH_TOKEN_SECRET
call :generate_random_string WEBHOOK_TOKEN_GEN
call :generate_random_string SESSION_SECRET

set JWT_EXPIRY=7d
set JWT_EXPIRY_SECONDS=604800

call :print_info "Gupshup Configuration"
set /p GUPSHUP_API_KEY="Enter Gupshup API Key (press Enter to skip): "
if "!GUPSHUP_API_KEY!"=="" set GUPSHUP_API_KEY=YOUR_GUPSHUP_API_KEY_HERE

set /p GUPSHUP_APP_ID="Enter Gupshup App ID (press Enter to skip): "
if "!GUPSHUP_APP_ID!"=="" set GUPSHUP_APP_ID=YOUR_GUPSHUP_APP_ID_HERE

set GUPSHUP_API_BASE_URL=https://api.gupshup.io/wa
set WEBHOOK_URL=https://yourdomain.com/api/webhooks

REM CORS Configuration
call :print_info "CORS Configuration"
if "%ENVIRONMENT%"=="production" (
    set /p CORS_ORIGIN="Enter frontend URL (e.g., https://yourdomain.com): "
) else (
    set CORS_ORIGIN=http://localhost:3000
)

set REACT_APP_API_URL=http://localhost:%PORT%/api

REM Email Configuration (Optional)
call :print_info "Email Configuration (Optional - press Enter to skip)"
set /p SMTP_HOST="Enter SMTP Host (e.g., smtp.gmail.com): "
if not "!SMTP_HOST!"=="" (
    set /p SMTP_PORT="Enter SMTP Port (default: 587): "
    if "!SMTP_PORT!"=="" set SMTP_PORT=587
    set /p SMTP_USER="Enter SMTP User: "
    set /p SMTP_PASS="Enter SMTP Password: "
    set /p SENDER_EMAIL="Enter Sender Email: "
    call :print_step "Email configuration added"
)

REM Rate Limiting
if "%ENVIRONMENT%"=="production" (
    set RATE_LIMIT_WINDOW_MS=900000
    set RATE_LIMIT_MAX_REQUESTS=1000
) else (
    set RATE_LIMIT_WINDOW_MS=900000
    set RATE_LIMIT_MAX_REQUESTS=100
)

REM Additional configuration
set MAX_FILE_SIZE=5242880
set UPLOAD_DIR=./uploads
set ANALYTICS_RETENTION_DAYS=90
set ENABLE_ANALYTICS=true

echo.
goto :eof

:generate_random_string
REM Generate a pseudo-random string using system resources
setlocal
for /f "delims=" %%a in ('powershell -Command "[convert]::ToBase64String(([byte[]](1..32 | ForEach-Object {Get-Random -Maximum 256})))"') do set RANDOM_STR=%%a
endlocal & set "%~1=%RANDOM_STR%"
goto :eof

:setup_backend
call :print_header "Setting Up Backend"

pushd "%BACKEND_DIR%"

REM Backup existing .env
if exist .env (
    call :print_info "Backing up existing .env to .env.backup.%TIMESTAMP%"
    copy .env ".env.backup.%TIMESTAMP%" >nul
)

REM Create .env file
call :print_info "Creating .env file..."

(
    echo # Auto-generated at %date% %time%
    echo # Environment: %ENVIRONMENT%
    echo.
    echo # Server
    echo PORT=%PORT%
    echo NODE_ENV=%NODE_ENV%
    echo.
    echo # Database
    echo MONGODB_URI=%MONGODB_URI%
    echo.
    echo # JWT
    echo JWT_SECRET=%JWT_SECRET%
    echo JWT_EXPIRY=%JWT_EXPIRY%
    echo REFRESH_TOKEN_SECRET=%REFRESH_TOKEN_SECRET%
    echo.
    echo # Gupshup
    echo GUPSHUP_API_KEY=%GUPSHUP_API_KEY%
    echo GUPSHUP_APP_ID=%GUPSHUP_APP_ID%
    echo GUPSHUP_API_BASE_URL=%GUPSHUP_API_BASE_URL%
    echo.
    echo # Webhook
    echo WEBHOOK_TOKEN=%WEBHOOK_TOKEN_GEN%
    echo WEBHOOK_URL=%WEBHOOK_URL%
    echo.
    echo # CORS
    echo CORS_ORIGIN=%CORS_ORIGIN%
    echo.
    echo # Session
    echo SESSION_SECRET=%SESSION_SECRET%
    echo.
    echo # Rate Limiting
    echo RATE_LIMIT_WINDOW_MS=%RATE_LIMIT_WINDOW_MS%
    echo RATE_LIMIT_MAX_REQUESTS=%RATE_LIMIT_MAX_REQUESTS%
    echo.
    echo # File Upload
    echo MAX_FILE_SIZE=%MAX_FILE_SIZE%
    echo UPLOAD_DIR=%UPLOAD_DIR%
    echo.
    echo # Analytics
    echo ANALYTICS_RETENTION_DAYS=%ANALYTICS_RETENTION_DAYS%
    echo ENABLE_ANALYTICS=%ENABLE_ANALYTICS%
) > .env

if not "!SMTP_HOST!"=="" (
    (
        echo.
        echo # Email
        echo SMTP_HOST=!SMTP_HOST!
        echo SMTP_PORT=!SMTP_PORT!
        echo SMTP_USER=!SMTP_USER!
        echo SMTP_PASS=!SMTP_PASS!
        echo SENDER_EMAIL=!SENDER_EMAIL!
    ) >> .env
)

call :print_step "Created .env file"

REM Install dependencies
call :print_info "Installing backend dependencies..."
npm install --legacy-peer-deps

if errorlevel 1 (
    call :print_error "Failed to install backend dependencies"
    popd
    exit /b 1
)

call :print_step "Backend dependencies installed"

REM Create uploads directory
if not exist uploads mkdir uploads
call :print_step "Created uploads directory"

popd
echo.
goto :eof

:setup_frontend
call :print_header "Setting Up Frontend"

pushd "%FRONTEND_DIR%"

REM Backup existing .env
if exist .env (
    call :print_info "Backing up existing .env to .env.backup.%TIMESTAMP%"
    copy .env ".env.backup.%TIMESTAMP%" >nul
)

REM Create .env file
call :print_info "Creating .env file..."

if "%ENVIRONMENT%"=="production" (
    set LOG_LEVEL=info
) else (
    set LOG_LEVEL=debug
)

(
    echo # Auto-generated at %date% %time%
    echo # Environment: %ENVIRONMENT%
    echo.
    echo REACT_APP_ENV=%REACT_APP_ENV%
    echo REACT_APP_API_URL=%REACT_APP_API_URL%
    echo REACT_APP_MAX_FILE_SIZE=5242880
    echo REACT_APP_LOG_LEVEL=%LOG_LEVEL%
) > .env

call :print_step "Created .env file"

REM Install dependencies
call :print_info "Installing frontend dependencies..."
npm install --legacy-peer-deps

if errorlevel 1 (
    call :print_error "Failed to install frontend dependencies"
    popd
    exit /b 1
)

call :print_step "Frontend dependencies installed"

popd
echo.
goto :eof

:print_summary
call :print_header "Installation Complete!"

echo Successfully installed WABA BSP Platform
echo.
echo Configuration Summary:
echo ================================================================================
echo Environment:     %ENVIRONMENT%
echo Backend Port:    %PORT%
echo Node Env:        %NODE_ENV%
echo MongoDB:         %MONGODB_URI%
echo CORS Origin:     %CORS_ORIGIN%
echo Gupshup API:     %GUPSHUP_API_KEY:~0,20%...
echo.

if "%ENVIRONMENT%"=="development" (
    echo Next Steps:
    echo ================================================================================
    echo.
    echo 1. Start MongoDB (if not already running^)
    echo.
    echo 2. Start the backend server:
    echo    cd %BACKEND_DIR%
    echo    npm run dev
    echo.
    echo 3. In another terminal, start the frontend:
    echo    cd %FRONTEND_DIR%
    echo    npm start
    echo.
    echo 4. Open http://localhost:3000 in your browser
    echo.
) else if "%ENVIRONMENT%"=="production" (
    echo Production Deployment Steps:
    echo ================================================================================
    echo.
    echo 1. Review and update .env files:
    echo    Backend:  %BACKEND_DIR%\.env
    echo    Frontend: %FRONTEND_DIR%\.env
    echo.
    echo 2. Build the frontend:
    echo    cd %FRONTEND_DIR%
    echo    npm run build
    echo.
    echo 3. Setup PM2 process manager:
    echo    npm install -g pm2
    echo    cd %PROJECT_DIR%
    echo    pm2 start ecosystem.config.js
    echo.
    echo 4. Configure Nginx reverse proxy
    echo    See DEPLOYMENT_GUIDE.md for detailed instructions
    echo.
)

echo Documentation:
echo ================================================================================
echo - Quick Start:      %PROJECT_DIR%\QUICKSTART.md
echo - Deployment:       %PROJECT_DIR%\DEPLOYMENT_GUIDE.md
echo - API Reference:    %PROJECT_DIR%\API_DOCUMENTATION.md
echo - Configuration:    %PROJECT_DIR%\CONFIGURATION_GUIDE.md
echo - Troubleshooting:  %PROJECT_DIR%\TROUBLESHOOTING.md
echo.
call :print_step "Installation completed successfully!"
echo.
goto :eof
