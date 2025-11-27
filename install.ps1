# WABA BSP Platform - One-Command Installation Script (Windows)
# Usage: .\install.ps1 -Environment development
# Environments: development, production, staging

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "production", "staging")]
    [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

# Configuration
$ProjectDir = Get-Location
$BackendDir = Join-Path $ProjectDir "server"
$FrontendDir = Join-Path $ProjectDir "client"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Color Functions
function Write-Header {
    param([string]$Message)
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║ $Message" -ForegroundColor Blue
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
}

function Write-Step {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Test-CommandExists {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop > $null
        return $true
    } catch {
        return $false
    }
}

function Get-RandomString {
    $bytes = New-Object Byte[] 32
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

function Main {
    Write-Header "WABA BSP Platform Installation"
    
    Write-Host "Environment: $Environment" -ForegroundColor Cyan
    Write-Host "Project Dir: $ProjectDir" -ForegroundColor Cyan
    Write-Host ""
    
    # Step 1: Check Prerequisites
    Check-Prerequisites
    
    # Step 2: Collect Environment Variables
    $EnvVars = Collect-EnvironmentVariables
    
    # Step 3: Setup Backend
    Setup-Backend $EnvVars
    
    # Step 4: Setup Frontend
    Setup-Frontend $EnvVars
    
    # Step 5: Final Summary
    Print-Summary $EnvVars
}

function Check-Prerequisites {
    Write-Header "Checking Prerequisites"
    
    # Check Node.js
    if (Test-CommandExists node) {
        $NodeVersion = node --version
        Write-Step "Node.js installed: $NodeVersion"
    } else {
        Write-Error "Node.js 18.x or higher is required"
        exit 1
    }
    
    # Check npm
    if (Test-CommandExists npm) {
        $NpmVersion = npm --version
        Write-Step "npm installed: $NpmVersion"
    } else {
        Write-Error "npm is required"
        exit 1
    }
    
    # Check MongoDB (for development)
    if ($Environment -eq "development") {
        if (Test-CommandExists mongod) {
            Write-Step "MongoDB is available"
        } else {
            Write-Warning "MongoDB not found - ensure it's running before starting the server"
        }
    }
    
    # Check Git
    if (Test-CommandExists git) {
        Write-Step "Git is available"
    } else {
        Write-Warning "Git not found - some features may not work"
    }
    
    Write-Host ""
}

function Collect-EnvironmentVariables {
    Write-Header "Environment Configuration"
    
    $EnvVars = @{}
    
    # Server Configuration
    Write-Info "Server Configuration"
    $Port = Read-Host "Enter server port (default: 5000)"
    $EnvVars['PORT'] = if ([string]::IsNullOrEmpty($Port)) { "5000" } else { $Port }
    
    # Node Environment
    if ($Environment -eq "production") {
        $EnvVars['NODE_ENV'] = "production"
        $EnvVars['REACT_APP_ENV'] = "production"
    } else {
        $EnvVars['NODE_ENV'] = $Environment
        $EnvVars['REACT_APP_ENV'] = $Environment
    }
    
    # Database Configuration
    Write-Info "Database Configuration"
    if ($Environment -eq "production") {
        $MongoUri = Read-Host "Enter MongoDB Atlas URI (mongodb+srv://...)"
        $EnvVars['MONGODB_URI'] = $MongoUri
    } else {
        $EnvVars['MONGODB_URI'] = "mongodb://localhost:27017/waba-bsp"
        Write-Host "MongoDB URI: mongodb://localhost:27017/waba-bsp" -ForegroundColor Gray
    }
    
    # JWT Configuration
    Write-Info "JWT Configuration"
    $EnvVars['JWT_SECRET'] = Get-RandomString
    $EnvVars['JWT_EXPIRY'] = "7d"
    $EnvVars['REFRESH_TOKEN_SECRET'] = Get-RandomString
    Write-Step "Generated JWT secrets"
    
    # Gupshup Configuration
    Write-Info "Gupshup Configuration"
    $GupshupKey = Read-Host "Enter Gupshup API Key (press Enter to skip)"
    $EnvVars['GUPSHUP_API_KEY'] = if ([string]::IsNullOrEmpty($GupshupKey)) { "YOUR_GUPSHUP_API_KEY_HERE" } else { $GupshupKey }
    
    $GupshupAppId = Read-Host "Enter Gupshup App ID (press Enter to skip)"
    $EnvVars['GUPSHUP_APP_ID'] = if ([string]::IsNullOrEmpty($GupshupAppId)) { "YOUR_GUPSHUP_APP_ID_HERE" } else { $GupshupAppId }
    
    $EnvVars['GUPSHUP_API_BASE_URL'] = "https://api.gupshup.io/wa"
    
    $WebhookToken = Read-Host "Enter Webhook Token (press Enter to generate)"
    if ([string]::IsNullOrEmpty($WebhookToken)) {
        $EnvVars['WEBHOOK_TOKEN'] = Get-RandomString
        Write-Step "Generated webhook token"
    } else {
        $EnvVars['WEBHOOK_TOKEN'] = $WebhookToken
    }
    
    # CORS Configuration
    Write-Info "CORS Configuration"
    if ($Environment -eq "production") {
        $CorsOrigin = Read-Host "Enter frontend URL (e.g., https://yourdomain.com)"
        $EnvVars['CORS_ORIGIN'] = $CorsOrigin
    } else {
        $EnvVars['CORS_ORIGIN'] = "http://localhost:3000"
    }
    
    $EnvVars['REACT_APP_API_URL'] = "http://localhost:$($EnvVars['PORT'])/api"
    
    # Email Configuration (Optional)
    Write-Info "Email Configuration (Optional - press Enter to skip)"
    $SmtpHost = Read-Host "Enter SMTP Host (e.g., smtp.gmail.com)"
    if (-not [string]::IsNullOrEmpty($SmtpHost)) {
        $EnvVars['SMTP_HOST'] = $SmtpHost
        $SmtpPort = Read-Host "Enter SMTP Port (default: 587)"
        $EnvVars['SMTP_PORT'] = if ([string]::IsNullOrEmpty($SmtpPort)) { "587" } else { $SmtpPort }
        $EnvVars['SMTP_USER'] = Read-Host "Enter SMTP User"
        $SecurePass = Read-Host "Enter SMTP Password" -AsSecureString
        $EnvVars['SMTP_PASS'] = [System.Net.NetworkCredential]::new("", $SecurePass).Password
        $EnvVars['SENDER_EMAIL'] = Read-Host "Enter Sender Email"
        Write-Step "Email configuration added"
    }
    
    # Rate Limiting
    if ($Environment -eq "production") {
        $EnvVars['RATE_LIMIT_WINDOW_MS'] = "900000"
        $EnvVars['RATE_LIMIT_MAX_REQUESTS'] = "1000"
    } else {
        $EnvVars['RATE_LIMIT_WINDOW_MS'] = "900000"
        $EnvVars['RATE_LIMIT_MAX_REQUESTS'] = "100"
    }
    
    # Session Secret
    $EnvVars['SESSION_SECRET'] = Get-RandomString
    
    # Additional configuration
    $EnvVars['MAX_FILE_SIZE'] = "5242880"
    $EnvVars['UPLOAD_DIR'] = "./uploads"
    $EnvVars['ANALYTICS_RETENTION_DAYS'] = "90"
    $EnvVars['ENABLE_ANALYTICS'] = "true"
    $EnvVars['WEBHOOK_URL'] = "https://yourdomain.com/api/webhooks"
    
    Write-Host ""
    return $EnvVars
}

function Setup-Backend {
    param([hashtable]$EnvVars)
    
    Write-Header "Setting Up Backend"
    
    Push-Location $BackendDir
    
    # Backup existing .env
    if (Test-Path .env) {
        Write-Info "Backing up existing .env to .env.backup.$Timestamp"
        Copy-Item .env ".env.backup.$Timestamp"
    }
    
    # Create .env file
    Write-Info "Creating .env file..."
    $EnvContent = @"
# Auto-generated at $(Get-Date)
# Environment: $Environment

# Server
PORT=$($EnvVars['PORT'])
NODE_ENV=$($EnvVars['NODE_ENV'])

# Database
MONGODB_URI=$($EnvVars['MONGODB_URI'])

# JWT
JWT_SECRET=$($EnvVars['JWT_SECRET'])
JWT_EXPIRY=$($EnvVars['JWT_EXPIRY'])
REFRESH_TOKEN_SECRET=$($EnvVars['REFRESH_TOKEN_SECRET'])

# Gupshup
GUPSHUP_API_KEY=$($EnvVars['GUPSHUP_API_KEY'])
GUPSHUP_APP_ID=$($EnvVars['GUPSHUP_APP_ID'])
GUPSHUP_API_BASE_URL=$($EnvVars['GUPSHUP_API_BASE_URL'])

# Webhook
WEBHOOK_TOKEN=$($EnvVars['WEBHOOK_TOKEN'])
WEBHOOK_URL=$($EnvVars['WEBHOOK_URL'])

# CORS
CORS_ORIGIN=$($EnvVars['CORS_ORIGIN'])

# Session
SESSION_SECRET=$($EnvVars['SESSION_SECRET'])

# Rate Limiting
RATE_LIMIT_WINDOW_MS=$($EnvVars['RATE_LIMIT_WINDOW_MS'])
RATE_LIMIT_MAX_REQUESTS=$($EnvVars['RATE_LIMIT_MAX_REQUESTS'])

# File Upload
MAX_FILE_SIZE=$($EnvVars['MAX_FILE_SIZE'])
UPLOAD_DIR=$($EnvVars['UPLOAD_DIR'])

# Analytics
ANALYTICS_RETENTION_DAYS=$($EnvVars['ANALYTICS_RETENTION_DAYS'])
ENABLE_ANALYTICS=$($EnvVars['ENABLE_ANALYTICS'])
"@
    
    if ($EnvVars.ContainsKey('SMTP_HOST')) {
        $EnvContent += "`n`n# Email`n"
        $EnvContent += "SMTP_HOST=$($EnvVars['SMTP_HOST'])`n"
        $EnvContent += "SMTP_PORT=$($EnvVars['SMTP_PORT'])`n"
        $EnvContent += "SMTP_USER=$($EnvVars['SMTP_USER'])`n"
        $EnvContent += "SMTP_PASS=$($EnvVars['SMTP_PASS'])`n"
        $EnvContent += "SENDER_EMAIL=$($EnvVars['SENDER_EMAIL'])`n"
    }
    
    Set-Content -Path .env -Value $EnvContent
    Write-Step "Created .env file"
    
    # Install dependencies
    Write-Info "Installing backend dependencies..."
    npm install --legacy-peer-deps | Select-Object -Last 20
    Write-Step "Backend dependencies installed"
    
    # Create uploads directory
    New-Item -ItemType Directory -Force -Path uploads > $null
    Write-Step "Created uploads directory"
    
    Pop-Location
    Write-Host ""
}

function Setup-Frontend {
    param([hashtable]$EnvVars)
    
    Write-Header "Setting Up Frontend"
    
    Push-Location $FrontendDir
    
    # Backup existing .env
    if (Test-Path .env) {
        Write-Info "Backing up existing .env to .env.backup.$Timestamp"
        Copy-Item .env ".env.backup.$Timestamp"
    }
    
    # Create .env file
    Write-Info "Creating .env file..."
    $LogLevel = if ($Environment -eq "production") { "info" } else { "debug" }
    
    $EnvContent = @"
# Auto-generated at $(Get-Date)
# Environment: $Environment

REACT_APP_ENV=$($EnvVars['REACT_APP_ENV'])
REACT_APP_API_URL=$($EnvVars['REACT_APP_API_URL'])
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_LOG_LEVEL=$LogLevel
"@
    
    Set-Content -Path .env -Value $EnvContent
    Write-Step "Created .env file"
    
    # Install dependencies
    Write-Info "Installing frontend dependencies..."
    npm install --legacy-peer-deps | Select-Object -Last 20
    Write-Step "Frontend dependencies installed"
    
    Pop-Location
    Write-Host ""
}

function Print-Summary {
    param([hashtable]$EnvVars)
    
    Write-Header "Installation Complete!"
    
    Write-Host "Successfully installed WABA BSP Platform" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configuration Summary:" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Environment:     $Environment"
    Write-Host "Backend Port:    $($EnvVars['PORT'])"
    Write-Host "Node Env:        $($EnvVars['NODE_ENV'])"
    Write-Host "MongoDB:         $($EnvVars['MONGODB_URI'])"
    Write-Host "CORS Origin:     $($EnvVars['CORS_ORIGIN'])"
    Write-Host "Gupshup API:     $($EnvVars['GUPSHUP_API_KEY'].Substring(0, [Math]::Min(20, $EnvVars['GUPSHUP_API_KEY'].Length)))..."
    Write-Host ""
    
    if ($Environment -eq "development") {
        Write-Host "Next Steps:" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host ""
        Write-Host "1. Start MongoDB (if not already running)"
        Write-Host ""
        Write-Host "2. Start the backend server:" -ForegroundColor Yellow
        Write-Host "   cd $BackendDir" -ForegroundColor Gray
        Write-Host "   npm run dev" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. In another terminal, start the frontend:" -ForegroundColor Yellow
        Write-Host "   cd $FrontendDir" -ForegroundColor Gray
        Write-Host "   npm start" -ForegroundColor Gray
        Write-Host ""
        Write-Host "4. Open http://localhost:3000 in your browser"
        Write-Host ""
    } elseif ($Environment -eq "production") {
        Write-Host "Production Deployment Steps:" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host ""
        Write-Host "1. Review and update .env files:" -ForegroundColor Yellow
        Write-Host "   Backend:  $BackendDir\.env" -ForegroundColor Gray
        Write-Host "   Frontend: $FrontendDir\.env" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Build the frontend:" -ForegroundColor Yellow
        Write-Host "   cd $FrontendDir" -ForegroundColor Gray
        Write-Host "   npm run build" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. Setup PM2 process manager:" -ForegroundColor Yellow
        Write-Host "   npm install -g pm2" -ForegroundColor Gray
        Write-Host "   cd $ProjectDir" -ForegroundColor Gray
        Write-Host "   pm2 start ecosystem.config.js" -ForegroundColor Gray
        Write-Host ""
        Write-Host "4. Configure Nginx reverse proxy"
        Write-Host "   See DEPLOYMENT_GUIDE.md for detailed instructions"
        Write-Host ""
    }
    
    Write-Host "Documentation:" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "• Quick Start:      $ProjectDir\QUICKSTART.md"
    Write-Host "• Deployment:       $ProjectDir\DEPLOYMENT_GUIDE.md"
    Write-Host "• API Reference:    $ProjectDir\API_DOCUMENTATION.md"
    Write-Host "• Configuration:    $ProjectDir\CONFIGURATION_GUIDE.md"
    Write-Host "• Troubleshooting:  $ProjectDir\TROUBLESHOOTING.md"
    Write-Host ""
    
    Write-Step "Installation completed successfully!"
}

# Main execution
Main
