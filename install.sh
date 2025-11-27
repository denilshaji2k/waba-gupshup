#!/bin/bash

###############################################################################
# WABA BSP Platform - One-Command Installation Script
# Usage: bash install.sh [environment]
# Environments: development, production, staging
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/server"
FRONTEND_DIR="$PROJECT_DIR/client"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed"
        return 1
    fi
    return 0
}

generate_random_string() {
    openssl rand -base64 32
}

verify_directories() {
    print_info "Verifying project structure..."
    
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Frontend directory not found: $FRONTEND_DIR"
        exit 1
    fi
    
    if [ ! -f "$BACKEND_DIR/package.json" ]; then
        print_error "Backend package.json not found"
        exit 1
    fi
    
    if [ ! -f "$FRONTEND_DIR/package.json" ]; then
        print_error "Frontend package.json not found"
        exit 1
    fi
    
    print_step "Project structure verified"
}

cleanup_node_modules() {
    print_info "Cleaning up node_modules and lock files..."
    
    # Clean backend
    if [ -d "$BACKEND_DIR/node_modules" ]; then
        print_info "Removing old backend node_modules..."
        rm -rf "$BACKEND_DIR/node_modules"
    fi
    
    if [ -f "$BACKEND_DIR/package-lock.json" ]; then
        rm -f "$BACKEND_DIR/package-lock.json"
    fi
    
    # Clean frontend
    if [ -d "$FRONTEND_DIR/node_modules" ]; then
        print_info "Removing old frontend node_modules..."
        rm -rf "$FRONTEND_DIR/node_modules"
    fi
    
    if [ -f "$FRONTEND_DIR/package-lock.json" ]; then
        rm -f "$FRONTEND_DIR/package-lock.json"
    fi
    
    print_step "Cleanup completed"
}

###############################################################################
# Main Installation Flow
###############################################################################

main() {
    print_header "WABA BSP Platform Installation"
    
    echo "Environment: $ENVIRONMENT"
    echo "Project Dir: $PROJECT_DIR"
    echo "Time: $(date)"
    echo ""
    
    # Step 0: Verify Directories
    verify_directories
    
    # Step 1: Check and Install Prerequisites
    check_prerequisites
    
    # Step 2: Clean old installations (optional)
    read -p "Clean old node_modules? (y/n, default: y): " -t 10 CLEAN_OLD
    CLEAN_OLD=${CLEAN_OLD:-y}
    if [ "$CLEAN_OLD" = "y" ] || [ "$CLEAN_OLD" = "Y" ]; then
        cleanup_node_modules
    fi
    
    # Step 3: Collect Environment Variables
    collect_env_variables
    
    # Step 4: Setup Backend
    setup_backend
    
    # Step 5: Setup Frontend
    setup_frontend
    
    # Step 6: Final Summary
    print_summary
}

###############################################################################
# Step 1: Check Prerequisites
###############################################################################

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check and install Node.js
    if check_command node; then
        NODE_VERSION=$(node -v)
        print_step "Node.js installed: $NODE_VERSION"
    else
        print_warning "Node.js 18.x not found - attempting to install..."
        install_nodejs
    fi
    
    # Check and install npm
    if check_command npm; then
        NPM_VERSION=$(npm -v)
        print_step "npm installed: $NPM_VERSION"
    else
        print_warning "npm not found - attempting to install..."
        install_npm
    fi
    
    # Check and install Git
    if check_command git; then
        print_step "Git is available"
    else
        print_warning "Git not found - attempting to install..."
        install_git
    fi
    
    # Check MongoDB (only if local development)
    if [ "$ENVIRONMENT" = "development" ]; then
        if command -v mongod &> /dev/null; then
            print_step "MongoDB is available"
        else
            print_warning "MongoDB not found - attempting to install..."
            install_mongodb_local
        fi
    fi
    
    echo ""
}

install_nodejs() {
    print_info "Installing Node.js 18.x..."
    
    # Detect OS
    OS_TYPE=$(uname -s)
    
    if [ "$OS_TYPE" = "Darwin" ]; then
        # macOS
        if command -v brew &> /dev/null; then
            print_info "Using Homebrew to install Node.js..."
            brew install node@18
            brew link node@18
        else
            print_error "Homebrew not found. Please install Node.js manually from https://nodejs.org/"
            exit 1
        fi
    elif [ "$OS_TYPE" = "Linux" ]; then
        # Linux (Ubuntu/Debian)
        if command -v apt-get &> /dev/null; then
            print_info "Using apt to install Node.js..."
            sudo apt-get update
            curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            print_info "Using yum to install Node.js..."
            curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install nodejs
        else
            print_error "Could not detect package manager. Please install Node.js manually from https://nodejs.org/"
            exit 1
        fi
    else
        print_error "Unsupported OS. Please install Node.js manually from https://nodejs.org/"
        exit 1
    fi
    
    if check_command node; then
        NODE_VERSION=$(node -v)
        print_step "Node.js installed successfully: $NODE_VERSION"
    else
        print_error "Failed to install Node.js"
        exit 1
    fi
}

install_npm() {
    print_info "npm is part of Node.js installation"
    if check_command node; then
        npm install -g npm@latest
        print_step "npm upgraded to latest version"
    else
        print_error "Node.js must be installed first"
        exit 1
    fi
}

install_git() {
    print_info "Installing Git..."
    
    # Detect OS
    OS_TYPE=$(uname -s)
    
    if [ "$OS_TYPE" = "Darwin" ]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install git
        else
            print_error "Homebrew not found. Please install Git manually."
            exit 1
        fi
    elif [ "$OS_TYPE" = "Linux" ]; then
        # Linux (Ubuntu/Debian)
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y git
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            sudo yum install git
        else
            print_error "Could not detect package manager. Please install Git manually."
            exit 1
        fi
    else
        print_error "Unsupported OS. Please install Git manually."
        exit 1
    fi
    
    if check_command git; then
        GIT_VERSION=$(git --version)
        print_step "Git installed successfully: $GIT_VERSION"
    else
        print_error "Failed to install Git"
        exit 1
    fi
}

install_mongodb_local() {
    print_info "Installing MongoDB locally..."
    
    # Detect OS
    OS_TYPE=$(uname -s)
    
    if [ "$OS_TYPE" = "Darwin" ]; then
        # macOS
        if command -v brew &> /dev/null; then
            print_info "Using Homebrew to install MongoDB..."
            brew install mongodb-community
            brew services start mongodb-community
        else
            print_warning "Homebrew not found. MongoDB must be installed manually."
            print_info "Download from: https://www.mongodb.com/try/download/community"
            return
        fi
    elif [ "$OS_TYPE" = "Linux" ]; then
        # Linux (Ubuntu/Debian)
        if command -v apt-get &> /dev/null; then
            print_info "Using apt to install MongoDB..."
            
            # Add MongoDB repository
            curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
            echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] http://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
            
            sudo apt-get update
            sudo apt-get install -y mongodb-org
            sudo systemctl start mongod
            sudo systemctl enable mongod
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            print_info "Using yum to install MongoDB..."
            
            cat <<EOF | sudo tee /etc/yum.repos.d/mongodb-org-6.0.repo
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF
            
            sudo yum install -y mongodb-org
            sudo systemctl start mongod
            sudo systemctl enable mongod
        else
            print_warning "Could not detect package manager for MongoDB installation."
            print_info "Install MongoDB manually from: https://www.mongodb.com/try/download/community"
            return
        fi
    else
        print_warning "Unsupported OS for automatic MongoDB installation."
        print_info "Install MongoDB manually from: https://www.mongodb.com/try/download/community"
        return
    fi
    
    if command -v mongod &> /dev/null; then
        MONGO_VERSION=$(mongod --version | head -n 1)
        print_step "MongoDB installed successfully: $MONGO_VERSION"
    else
        print_warning "MongoDB installation completed but command not found in PATH"
    fi
}

###############################################################################
# Step 2: Collect Environment Variables
###############################################################################

collect_env_variables() {
    print_header "Environment Configuration"
    
    # Create associative arrays for env vars
    declare -gA BACKEND_ENV
    declare -gA FRONTEND_ENV
    
    # Server Configuration
    print_info "Server Configuration"
    read -p "Enter server port (default: 5000): " PORT
    PORT=${PORT:-5000}
    BACKEND_ENV[PORT]=$PORT
    
    # Node Environment
    if [ "$ENVIRONMENT" = "production" ]; then
        BACKEND_ENV[NODE_ENV]="production"
        FRONTEND_ENV[REACT_APP_ENV]="production"
    else
        BACKEND_ENV[NODE_ENV]="$ENVIRONMENT"
        FRONTEND_ENV[REACT_APP_ENV]="$ENVIRONMENT"
    fi
    
    # Database Configuration
    print_info "Database Configuration"
    if [ "$ENVIRONMENT" = "production" ]; then
        read -p "Enter MongoDB Atlas URI (mongodb+srv://...): " MONGODB_URI
    else
        MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/waba-bsp"}
        echo "MongoDB URI: $MONGODB_URI"
    fi
    BACKEND_ENV[MONGODB_URI]=$MONGODB_URI
    
    # JWT Configuration
    print_info "JWT Configuration"
    JWT_SECRET=$(generate_random_string)
    REFRESH_TOKEN_SECRET=$(generate_random_string)
    BACKEND_ENV[JWT_SECRET]=$JWT_SECRET
    BACKEND_ENV[JWT_EXPIRY]="7d"
    BACKEND_ENV[REFRESH_TOKEN_SECRET]=$REFRESH_TOKEN_SECRET
    print_step "Generated JWT secrets"
    
    # Gupshup Configuration
    print_info "Gupshup Configuration"
    read -p "Enter Gupshup API Key: " GUPSHUP_API_KEY
    if [ -z "$GUPSHUP_API_KEY" ]; then
        print_warning "Gupshup API Key is empty - you can add it later in .env"
        GUPSHUP_API_KEY="YOUR_GUPSHUP_API_KEY_HERE"
    fi
    BACKEND_ENV[GUPSHUP_API_KEY]=$GUPSHUP_API_KEY
    BACKEND_ENV[GUPSHUP_API_BASE_URL]="https://api.gupshup.io/wa"
    
    read -p "Enter Gupshup App ID: " GUPSHUP_APP_ID
    if [ -z "$GUPSHUP_APP_ID" ]; then
        GUPSHUP_APP_ID="YOUR_GUPSHUP_APP_ID_HERE"
    fi
    BACKEND_ENV[GUPSHUP_APP_ID]=$GUPSHUP_APP_ID
    
    read -p "Enter Webhook Token (press Enter to generate): " WEBHOOK_TOKEN
    if [ -z "$WEBHOOK_TOKEN" ]; then
        WEBHOOK_TOKEN=$(generate_random_string)
        print_step "Generated webhook token"
    fi
    BACKEND_ENV[WEBHOOK_TOKEN]=$WEBHOOK_TOKEN
    
    # CORS Configuration
    print_info "CORS Configuration"
    if [ "$ENVIRONMENT" = "production" ]; then
        read -p "Enter frontend URL (e.g., https://yourdomain.com): " CORS_ORIGIN
    else
        CORS_ORIGIN=${CORS_ORIGIN:-"http://localhost:3000"}
    fi
    BACKEND_ENV[CORS_ORIGIN]=$CORS_ORIGIN
    FRONTEND_ENV[REACT_APP_API_URL]="http://localhost:$PORT/api"
    
    # Email Configuration (Optional)
    print_info "Email Configuration (Optional - press Enter to skip)"
    read -p "Enter SMTP Host (e.g., smtp.gmail.com): " SMTP_HOST
    if [ ! -z "$SMTP_HOST" ]; then
        BACKEND_ENV[SMTP_HOST]=$SMTP_HOST
        read -p "Enter SMTP Port (default: 587): " SMTP_PORT
        BACKEND_ENV[SMTP_PORT]=${SMTP_PORT:-587}
        read -p "Enter SMTP User: " SMTP_USER
        BACKEND_ENV[SMTP_USER]=$SMTP_USER
        read -sp "Enter SMTP Password: " SMTP_PASS
        echo ""
        BACKEND_ENV[SMTP_PASS]=$SMTP_PASS
        read -p "Enter Sender Email: " SENDER_EMAIL
        BACKEND_ENV[SENDER_EMAIL]=$SENDER_EMAIL
        print_step "Email configuration added"
    fi
    
    # Rate Limiting
    if [ "$ENVIRONMENT" = "production" ]; then
        BACKEND_ENV[RATE_LIMIT_WINDOW_MS]="900000"
        BACKEND_ENV[RATE_LIMIT_MAX_REQUESTS]="1000"
    else
        BACKEND_ENV[RATE_LIMIT_WINDOW_MS]="900000"
        BACKEND_ENV[RATE_LIMIT_MAX_REQUESTS]="100"
    fi
    
    # Session Secret
    SESSION_SECRET=$(generate_random_string)
    BACKEND_ENV[SESSION_SECRET]=$SESSION_SECRET
    
    echo ""
}

###############################################################################
# Step 3: Setup Backend
###############################################################################

setup_backend() {
    print_header "Setting Up Backend"
    
    cd "$BACKEND_DIR"
    
    # Verify package.json exists
    if [ ! -f package.json ]; then
        print_error "Backend package.json not found in $BACKEND_DIR"
        exit 1
    fi
    
    # Backup existing .env
    if [ -f .env ]; then
        print_info "Backing up existing .env to .env.backup.$TIMESTAMP"
        cp .env ".env.backup.$TIMESTAMP"
    fi
    
    # Create .env file
    print_info "Creating .env file..."
    {
        echo "# Auto-generated at $(date)"
        echo "# Environment: $ENVIRONMENT"
        echo ""
        echo "# Server"
        echo "PORT=${BACKEND_ENV[PORT]}"
        echo "NODE_ENV=${BACKEND_ENV[NODE_ENV]}"
        echo ""
        echo "# Database"
        echo "MONGODB_URI=${BACKEND_ENV[MONGODB_URI]}"
        echo ""
        echo "# JWT"
        echo "JWT_SECRET=${BACKEND_ENV[JWT_SECRET]}"
        echo "JWT_EXPIRY=${BACKEND_ENV[JWT_EXPIRY]}"
        echo "REFRESH_TOKEN_SECRET=${BACKEND_ENV[REFRESH_TOKEN_SECRET]}"
        echo ""
        echo "# Gupshup"
        echo "GUPSHUP_API_KEY=${BACKEND_ENV[GUPSHUP_API_KEY]}"
        echo "GUPSHUP_APP_ID=${BACKEND_ENV[GUPSHUP_APP_ID]}"
        echo "GUPSHUP_API_BASE_URL=${BACKEND_ENV[GUPSHUP_API_BASE_URL]}"
        echo ""
        echo "# Webhook"
        echo "WEBHOOK_TOKEN=${BACKEND_ENV[WEBHOOK_TOKEN]}"
        echo "WEBHOOK_URL=https://yourdomain.com/api/webhooks"
        echo ""
        echo "# CORS"
        echo "CORS_ORIGIN=${BACKEND_ENV[CORS_ORIGIN]}"
        echo ""
        echo "# Session"
        echo "SESSION_SECRET=${BACKEND_ENV[SESSION_SECRET]}"
        echo ""
        
        if [ ! -z "${BACKEND_ENV[SMTP_HOST]}" ]; then
            echo "# Email"
            echo "SMTP_HOST=${BACKEND_ENV[SMTP_HOST]}"
            echo "SMTP_PORT=${BACKEND_ENV[SMTP_PORT]}"
            echo "SMTP_USER=${BACKEND_ENV[SMTP_USER]}"
            echo "SMTP_PASS=${BACKEND_ENV[SMTP_PASS]}"
            echo "SENDER_EMAIL=${BACKEND_ENV[SENDER_EMAIL]}"
            echo ""
        fi
        
        echo "# Rate Limiting"
        echo "RATE_LIMIT_WINDOW_MS=${BACKEND_ENV[RATE_LIMIT_WINDOW_MS]}"
        echo "RATE_LIMIT_MAX_REQUESTS=${BACKEND_ENV[RATE_LIMIT_MAX_REQUESTS]}"
        echo ""
        echo "# File Upload"
        echo "MAX_FILE_SIZE=5242880"
        echo "UPLOAD_DIR=./uploads"
        echo ""
        echo "# Analytics"
        echo "ANALYTICS_RETENTION_DAYS=90"
        echo "ENABLE_ANALYTICS=true"
    } > .env
    
    print_step "Created .env file"
    
    # Install dependencies with retry logic
    print_info "Installing backend dependencies (this may take a few minutes)..."
    max_retries=3
    retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if npm install --legacy-peer-deps; then
            print_step "Backend dependencies installed successfully"
            break
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $max_retries ]; then
                print_warning "npm install failed, retrying ($retry_count/$max_retries)..."
                sleep 5
            else
                print_error "Failed to install backend dependencies after $max_retries attempts"
                exit 1
            fi
        fi
    done
    
    # Create uploads directory
    mkdir -p uploads
    print_step "Created uploads directory"
    
    # Verify Node modules were installed
    if [ ! -d node_modules ]; then
        print_error "node_modules directory not created - installation may have failed"
        exit 1
    fi
    
    print_step "Backend setup completed"
    
    cd "$PROJECT_DIR"
    echo ""
}

###############################################################################
# Step 4: Setup Frontend
###############################################################################

setup_frontend() {
    print_header "Setting Up Frontend"
    
    cd "$FRONTEND_DIR"
    
    # Verify package.json exists
    if [ ! -f package.json ]; then
        print_error "Frontend package.json not found in $FRONTEND_DIR"
        exit 1
    fi
    
    # Backup existing .env
    if [ -f .env ]; then
        print_info "Backing up existing .env to .env.backup.$TIMESTAMP"
        cp .env ".env.backup.$TIMESTAMP"
    fi
    
    # Create .env file
    print_info "Creating .env file..."
    {
        echo "# Auto-generated at $(date)"
        echo "# Environment: $ENVIRONMENT"
        echo ""
        echo "# API Configuration"
        echo "REACT_APP_API_BASE_URL=${FRONTEND_ENV[REACT_APP_API_URL]}"
        echo "REACT_APP_SOCKET_URL=${FRONTEND_ENV[REACT_APP_API_URL]}"
        echo ""
        echo "# Features"
        echo "REACT_APP_ENABLE_ANALYTICS=true"
        echo "REACT_APP_ENABLE_DEBUG=$([ "$ENVIRONMENT" = "production" ] && echo "false" || echo "true")"
        echo ""
        echo "# Gupshup"
        echo "REACT_APP_GUPSHUP_APP_ID=${FRONTEND_ENV[REACT_APP_GUPSHUP_APP_ID]:-YOUR_APP_ID}"
        echo ""
        echo "# App Info"
        echo "REACT_APP_VERSION=1.0.0"
        echo "REACT_APP_NAME=WABA Gupshup"
        echo "REACT_APP_ENV=$ENVIRONMENT"
        echo "REACT_APP_MAX_FILE_SIZE=5242880"
        echo "REACT_APP_LOG_LEVEL=$([ "$ENVIRONMENT" = "production" ] && echo "info" || echo "debug")"
    } > .env
    
    print_step "Created .env file"
    
    # Install dependencies with retry logic
    print_info "Installing frontend dependencies (this may take a few minutes)..."
    max_retries=3
    retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if npm install --legacy-peer-deps; then
            print_step "Frontend dependencies installed successfully"
            break
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $max_retries ]; then
                print_warning "npm install failed, retrying ($retry_count/$max_retries)..."
                sleep 5
            else
                print_error "Failed to install frontend dependencies after $max_retries attempts"
                exit 1
            fi
        fi
    done
    
    # Verify Node modules were installed
    if [ ! -d node_modules ]; then
        print_error "node_modules directory not created - installation may have failed"
        exit 1
    fi
    
    # Check if build is required for production
    if [ "$ENVIRONMENT" = "production" ]; then
        print_info "Production environment detected - creating optimized build..."
        if npm run build; then
            print_step "Frontend build created successfully"
        else
            print_warning "Frontend build failed - you may need to run 'npm run build' manually"
        fi
    fi
    
    print_step "Frontend setup completed"
    
    cd "$PROJECT_DIR"
    echo ""
}

###############################################################################
# Step 5: Summary
###############################################################################

print_summary() {
    print_header "Installation Complete!"
    
    echo -e "${GREEN}Successfully installed WABA BSP Platform${NC}"
    echo ""
    echo "Configuration Summary:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Environment:     $ENVIRONMENT"
    echo "Backend Port:    ${BACKEND_ENV[PORT]}"
    echo "Node Env:        ${BACKEND_ENV[NODE_ENV]}"
    echo "MongoDB:         ${BACKEND_ENV[MONGODB_URI]}"
    echo "CORS Origin:     ${BACKEND_ENV[CORS_ORIGIN]}"
    echo "Gupshup API:     ${BACKEND_ENV[GUPSHUP_API_KEY]:0:20}..."
    echo ""
    
    if [ "$ENVIRONMENT" = "development" ]; then
        echo "Next Steps:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "1. Start MongoDB (if not already running):"
        echo "   mongod"
        echo ""
        echo "2. Start the backend server:"
        echo "   cd $BACKEND_DIR"
        echo "   npm run dev"
        echo ""
        echo "3. In another terminal, start the frontend:"
        echo "   cd $FRONTEND_DIR"
        echo "   npm start"
        echo ""
        echo "4. Open http://localhost:3000 in your browser"
        echo ""
    elif [ "$ENVIRONMENT" = "production" ]; then
        echo "Production Deployment Steps:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "1. Review and update .env files:"
        echo "   Backend:  $BACKEND_DIR/.env"
        echo "   Frontend: $FRONTEND_DIR/.env"
        echo ""
        echo "2. Build the frontend:"
        echo "   cd $FRONTEND_DIR"
        echo "   npm run build"
        echo ""
        echo "3. Setup PM2 process manager:"
        echo "   npm install -g pm2"
        echo "   cd $PROJECT_DIR"
        echo "   pm2 start ecosystem.config.js"
        echo ""
        echo "4. Configure Nginx reverse proxy:"
        echo "   See DEPLOYMENT_GUIDE.md for detailed instructions"
        echo ""
        echo "5. Setup SSL with Let's Encrypt:"
        echo "   sudo certbot certonly --standalone -d yourdomain.com"
        echo ""
    fi
    
    echo "Backup files (if any):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    find "$BACKEND_DIR" -name ".env.backup.*" -o -name ".env.backup.*" | grep -v node_modules || echo "None"
    echo ""
    
    echo "Documentation:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "• Quick Start:      $PROJECT_DIR/QUICKSTART.md"
    echo "• Deployment:       $PROJECT_DIR/DEPLOYMENT_GUIDE.md"
    echo "• API Reference:    $PROJECT_DIR/API_DOCUMENTATION.md"
    echo "• Configuration:    $PROJECT_DIR/CONFIGURATION_GUIDE.md"
    echo "• Troubleshooting:  $PROJECT_DIR/TROUBLESHOOTING.md"
    echo ""
    
    print_step "Installation completed successfully!"
}

###############################################################################
# Run Main
###############################################################################

if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    print_error "Invalid environment. Use: development, production, or staging"
    exit 1
fi

main

exit 0
