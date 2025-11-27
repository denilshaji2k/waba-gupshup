# WABA BSP Platform - Complete Installation Guide

## Overview

The WABA BSP Platform now includes a **fully automated installation system** that handles all dependencies, configuration, and setup with minimal user intervention.

## Installation Methods

### Method 1: Automated Installation (Recommended)

#### Requirements:
- macOS, Linux (Ubuntu/Debian/CentOS/RHEL), or Windows with WSL2
- Bash shell
- Internet connection

#### Quick Start:

```bash
# Clone the repository (if you haven't already)
cd /path/to/WABA-GUPSHUP

# Run the automated installer
bash install.sh development    # For development environment
bash install.sh production     # For production environment
bash install.sh staging        # For staging environment
```

#### What Happens Automatically:

1. **Project Structure Verification**
   - Validates `server/` and `client/` directories exist
   - Checks for `package.json` files in both directories
   - Offers to clean old `node_modules` if present

2. **Prerequisites Installation**
   - Auto-detects missing tools (Node.js, npm, Git, MongoDB)
   - Installs missing dependencies using system package managers:
     - **macOS**: Homebrew
     - **Ubuntu/Debian**: apt-get
     - **CentOS/RHEL**: yum
   - Validates successful installation of each tool

3. **Environment Configuration**
   - Interactive prompts for:
     - MongoDB URI (connection string)
     - JWT secrets (auto-generated if not provided)
     - Gupshup API credentials
     - Webhook token
     - CORS origin (auto-configured by environment)
     - Email settings (optional)
     - Rate limiting (auto-configured by environment)

4. **Backend Setup**
   - Creates `server/.env` with all configuration
   - Backs up existing `.env` files with timestamp
   - Installs dependencies with retry logic (3 attempts)
   - Validates `node_modules` installation
   - Creates `uploads/` directory for file storage

5. **Frontend Setup**
   - Creates `client/.env` with API configuration
   - Backs up existing `.env` files with timestamp
   - Installs dependencies with retry logic (3 attempts)
   - Validates `node_modules` installation
   - For production: Creates optimized build automatically

6. **Display Summary**
   - Shows all configured values
   - Provides next steps for starting the application

---

## Supported Operating Systems

### macOS (10.15+)

**Automatic Dependencies:**
- Node.js 18.x (via Homebrew)
- npm (upgraded to latest)
- Git
- MongoDB Community (optional, for development)

**Prerequisites:**
```bash
# Install Homebrew if needed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Installation:**
```bash
bash install.sh development
```

---

### Ubuntu / Debian (18.04+)

**Automatic Dependencies:**
- Node.js 18.x (via NodeSource repository)
- npm (upgraded to latest)
- Git
- MongoDB Community (optional, for development)

**Prerequisites:**
```bash
# Update package manager
sudo apt-get update
sudo apt-get upgrade
```

**Installation:**
```bash
bash install.sh development
```

---

### CentOS / RHEL (7.0+)

**Automatic Dependencies:**
- Node.js 18.x (via RPM NodeSource)
- npm (upgraded to latest)
- Git
- MongoDB Community (optional, for development)

**Prerequisites:**
```bash
# Update package manager
sudo yum update
sudo yum install -y curl
```

**Installation:**
```bash
bash install.sh development
```

---

### Windows

#### Option A: WSL2 (Windows Subsystem for Linux)

```powershell
# Open PowerShell and enable WSL2
wsl --install -d Ubuntu-22.04

# Then run inside WSL terminal
bash install.sh development
```

#### Option B: Manual Installation

See [Manual Installation](#method-2-manual-installation) section below.

---

## Method 2: Web-Based Installer

For users who prefer a graphical interface or don't have access to terminal.

### Quick Start:

```bash
# macOS/Linux:
bash setup-wizard-start.sh

# Windows:
setup-wizard-start.bat

# Or manually with Python/Node:
python3 -m http.server 8000
# Visit http://localhost:8000 and open setup-wizard.html
```

### Features:
- ✅ Interactive 8-step wizard
- ✅ Real-time form validation
- ✅ Cryptographic secret generation
- ✅ Download or auto-save configuration
- ✅ Beautiful, responsive UI
- ✅ No dependencies required (pure HTML/CSS/JS)

See [SETUP_WIZARD_GUIDE.md](./SETUP_WIZARD_GUIDE.md) for detailed instructions.

---

## Method 3: Manual Installation

If you prefer to install and configure everything manually:

### 1. Install Prerequisites

**Node.js 18.x:**
```bash
# macOS
brew install node@18

# Ubuntu/Debian
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs
```

**npm:**
```bash
npm install -g npm@latest
```

**Git:**
```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt-get install git

# CentOS/RHEL
sudo yum install git
```

**MongoDB (Optional, for development):**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
# Add MongoDB repository and install
# See: https://docs.mongodb.com/manual/installation/

# CentOS/RHEL
# Add MongoDB repository and install
# See: https://docs.mongodb.com/manual/installation/
```

### 2. Backend Configuration

```bash
cd server

# Create .env file with your values
cat > .env << 'EOF'
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/waba_gupshup

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here

# Gupshup Configuration
GUPSHUP_API_KEY=your-api-key-here
GUPSHUP_APP_ID=your-app-id-here
GUPSHUP_API_BASE_URL=https://api.gupshup.io/wa

# Webhook
WEBHOOK_TOKEN=your-webhook-token-here
WEBHOOK_URL=https://yourdomain.com/api/webhooks

# CORS
CORS_ORIGIN=http://localhost:3000

# Session
SESSION_SECRET=your-session-secret-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Analytics
ANALYTICS_RETENTION_DAYS=90
ENABLE_ANALYTICS=true
EOF

# Install dependencies
npm install --legacy-peer-deps

# Create uploads directory
mkdir -p uploads
```

### 3. Frontend Configuration

```bash
cd client

# Create .env file with your values
cat > .env << 'EOF'
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Features
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_DEBUG=true

# Gupshup
REACT_APP_GUPSHUP_APP_ID=your-app-id-here

# App Info
REACT_APP_VERSION=1.0.0
REACT_APP_NAME=WABA Gupshup
REACT_APP_ENV=development
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_LOG_LEVEL=debug
EOF

# Install dependencies
npm install --legacy-peer-deps
```

### 4. Start the Application

**Terminal 1 - Start MongoDB:**
```bash
mongod
```

**Terminal 2 - Start Backend:**
```bash
cd server
npm run dev
```

**Terminal 3 - Start Frontend:**
```bash
cd client
npm start
```

---

## Configuration

### Environment Variables

The installer automatically creates `.env` files with sensible defaults. You can customize them:

#### Backend (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development/production |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/waba_gupshup |
| JWT_SECRET | JWT signing secret | Generated |
| JWT_EXPIRY | JWT expiration time | 7d |
| REFRESH_TOKEN_SECRET | Refresh token secret | Generated |
| GUPSHUP_API_KEY | Gupshup API key | From user input |
| GUPSHUP_APP_ID | Gupshup app ID | From user input |
| GUPSHUP_API_BASE_URL | Gupshup API endpoint | https://api.gupshup.io/wa |
| WEBHOOK_TOKEN | Webhook authentication token | Generated |
| CORS_ORIGIN | Frontend origin for CORS | http://localhost:3000 |
| SESSION_SECRET | Session signing secret | Generated |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 (15 min) |
| RATE_LIMIT_MAX_REQUESTS | Requests per window | 100 (dev), 1000 (prod) |

#### Frontend (`client/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_BASE_URL | Backend API endpoint | http://localhost:5000/api |
| REACT_APP_SOCKET_URL | WebSocket endpoint | http://localhost:5000 |
| REACT_APP_ENABLE_ANALYTICS | Enable analytics | true |
| REACT_APP_ENABLE_DEBUG | Debug mode | true (dev), false (prod) |
| REACT_APP_GUPSHUP_APP_ID | Gupshup app ID | From user input |
| REACT_APP_VERSION | App version | 1.0.0 |
| REACT_APP_ENV | Environment | development/production |
| REACT_APP_MAX_FILE_SIZE | Max upload size | 5242880 (5MB) |
| REACT_APP_LOG_LEVEL | Log level | debug (dev), info (prod) |

---

## Starting the Application

### Development Mode

```bash
# Terminal 1 - Start MongoDB
mongod

# Terminal 2 - Start Backend
cd server
npm run dev

# Terminal 3 - Start Frontend
cd client
npm start
```

### Production Mode

```bash
# Build frontend
cd client
npm run build

# Start backend in production
cd server
NODE_ENV=production npm start
```

### Using npm Scripts

```bash
# From project root
npm run dev          # Start all services
npm run dev:server   # Start only backend
npm run dev:client   # Start only frontend
npm run build        # Build frontend
npm run test         # Run tests
npm run lint         # Lint code
```

---

## Troubleshooting

### Issue: Node.js Installation Failed

**Symptoms:**
```
✗ Node.js installation failed
```

**Solutions:**

1. **macOS - Homebrew Issues:**
```bash
# Reinstall Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then retry installation
bash install.sh development
```

2. **Ubuntu/Debian - Repository Issues:**
```bash
# Add NodeSource repository manually
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Then retry installation
bash install.sh development
```

3. **CentOS/RHEL - Repository Issues:**
```bash
# Add RPM NodeSource repository manually
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs

# Then retry installation
bash install.sh development
```

### Issue: npm install Hangs or Fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm WARN ERESOLVE unable to resolve dependency tree
```

**Solutions:**

```bash
# Clear npm cache
npm cache clean --force

# Retry with legacy peer deps flag
npm install --legacy-peer-deps

# Or use npm 7+ --force flag
npm install --force
```

### Issue: MongoDB Connection Failed

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

1. **Verify MongoDB is Running:**
```bash
# macOS
brew services list | grep mongodb

# Ubuntu/Debian
systemctl status mongod

# CentOS/RHEL
sudo systemctl status mongod
```

2. **Start MongoDB:**
```bash
# macOS
brew services start mongodb-community
mongod  # Or start manually

# Ubuntu/Debian
sudo systemctl start mongod

# CentOS/RHEL
sudo systemctl start mongod
```

3. **Check Connection String:**
```bash
# Default local connection
MONGODB_URI=mongodb://localhost:27017/waba_gupshup

# Verify MongoDB is listening
netstat -an | grep 27017
```

### Issue: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

1. **Change Port in .env:**
```bash
cd server
# Edit .env and change PORT to 5001, 5002, etc.
nano .env
```

2. **Kill Process Using Port:**
```bash
# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Windows (PowerShell)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: CORS Errors in Frontend

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

1. **Update CORS_ORIGIN in Backend:**
```bash
cd server
# Edit .env
CORS_ORIGIN=http://localhost:3000
```

2. **Update API URL in Frontend:**
```bash
cd client
# Edit .env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

3. **Ensure Ports Match:**
- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`

### Issue: Database Initialization Failed

**Symptoms:**
```
Error: Failed to create database
```

**Solutions:**

```bash
# Drop and recreate database
mongo
> use waba_gupshup
> db.dropDatabase()
> exit

# Restart backend to reinitialize
npm run dev
```

---

## Next Steps

After successful installation:

1. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - MongoDB: localhost:27017

2. **Configure Gupshup Webhook:**
   - Set webhook URL in Gupshup dashboard
   - Use: `https://yourdomain.com/api/webhooks`
   - Use webhook token from `WEBHOOK_TOKEN` in `.env`

3. **Deploy to Production:**
   - See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
   - Configure environment for production
   - Set up MongoDB Atlas or cloud database
   - Deploy with Docker or traditional hosting

4. **Additional Configuration:**
   - Enable email notifications (optional)
   - Configure analytics retention
   - Set up monitoring and logging
   - Configure SSL/TLS certificates

---

## Support

For additional help:

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Review error messages carefully
- Check logs in `server/logs/` directory
- Consult [SETUP_WIZARD_GUIDE.md](./SETUP_WIZARD_GUIDE.md) for web installer

---

## Summary

The WABA BSP Platform installation is now **fully automated**. Whether you choose:

- **Automated Script**: `bash install.sh development` - Complete setup in 5-10 minutes
- **Web Wizard**: `bash setup-wizard-start.sh` - Interactive configuration with GUI
- **Manual Setup**: Follow the manual installation steps - Full control and understanding

All three methods result in a working installation with all dependencies configured and ready to run.

**Start coding in minutes, not hours!**
