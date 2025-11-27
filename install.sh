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

###############################################################################
# Main Installation Flow
###############################################################################

main() {
    print_header "WABA BSP Platform Installation"
    
    echo "Environment: $ENVIRONMENT"
    echo "Project Dir: $PROJECT_DIR"
    echo ""
    
    # Step 1: Check Prerequisites
    check_prerequisites
    
    # Step 2: Collect Environment Variables
    collect_env_variables
    
    # Step 3: Setup Backend
    setup_backend
    
    # Step 4: Setup Frontend
    setup_frontend
    
    # Step 5: Final Summary
    print_summary
}

###############################################################################
# Step 1: Check Prerequisites
###############################################################################

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if check_command node; then
        NODE_VERSION=$(node -v)
        print_step "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js 18.x or higher is required"
        exit 1
    fi
    
    # Check npm
    if check_command npm; then
        NPM_VERSION=$(npm -v)
        print_step "npm installed: $NPM_VERSION"
    else
        print_error "npm is required"
        exit 1
    fi
    
    # Check MongoDB (only if local development)
    if [ "$ENVIRONMENT" = "development" ]; then
        if command -v mongod &> /dev/null; then
            print_step "MongoDB is available"
        else
            print_warning "MongoDB not found locally - ensure it's running before starting the server"
        fi
    fi
    
    # Check Git
    if check_command git; then
        print_step "Git is available"
    else
        print_warning "Git not found - some features may not work"
    fi
    
    echo ""
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
    
    # Install dependencies
    print_info "Installing backend dependencies..."
    npm install --legacy-peer-deps 2>&1 | tail -20
    print_step "Backend dependencies installed"
    
    # Create uploads directory
    mkdir -p uploads
    print_step "Created uploads directory"
    
    cd "$PROJECT_DIR"
    echo ""
}

###############################################################################
# Step 4: Setup Frontend
###############################################################################

setup_frontend() {
    print_header "Setting Up Frontend"
    
    cd "$FRONTEND_DIR"
    
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
        echo "REACT_APP_ENV=${FRONTEND_ENV[REACT_APP_ENV]}"
        echo "REACT_APP_API_URL=${FRONTEND_ENV[REACT_APP_API_URL]}"
        echo "REACT_APP_MAX_FILE_SIZE=5242880"
        echo "REACT_APP_LOG_LEVEL=$([ "$ENVIRONMENT" = "production" ] && echo "info" || echo "debug")"
    } > .env
    
    print_step "Created .env file"
    
    # Install dependencies
    print_info "Installing frontend dependencies..."
    npm install --legacy-peer-deps 2>&1 | tail -20
    print_step "Frontend dependencies installed"
    
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
