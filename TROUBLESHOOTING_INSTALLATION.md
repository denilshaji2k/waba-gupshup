# WABA BSP Installation - Troubleshooting Guide

## Common Installation Issues & Solutions

---

## 🔴 Installation Script Errors

### Error: "Project structure validation failed"

**Symptoms:**
```
✗ Backend package.json not found in /path/to/server
✗ Frontend package.json not found in /path/to/client
```

**Causes:**
- Project directories are not set up correctly
- Files were deleted or moved
- Wrong directory when running install script

**Solutions:**

1. **Verify Directory Structure:**
```bash
# From project root
ls -la
# Should show:
# drwxr-xr-x  server/
# drwxr-xr-x  client/
# -rw-r--r--  package.json
```

2. **Verify package.json Files:**
```bash
# Backend
ls -la server/package.json

# Frontend
ls -la client/package.json
```

3. **Recreate Missing Files:**
If package.json is missing, restore from git:
```bash
git checkout server/package.json
git checkout client/package.json
```

4. **Verify Script Location:**
```bash
# Run script from project root
cd /path/to/WABA-GUPSHUP
pwd  # Should show project root
ls install.sh  # Should find it
```

---

## 🔴 Node.js Installation Errors

### Error: "Node.js installation failed"

**Symptoms:**
```
✗ Node.js installation failed or not available
Command 'node' not found after installation
node -v returns command not found
```

**Causes:**
- Package manager issue
- Network connectivity problem
- Missing system dependencies
- Permission denied errors

**Solutions:**

#### Solution 1: macOS - Homebrew Issues

```bash
# Verify Homebrew is installed
brew --version

# If not installed:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Update Homebrew
brew update

# Try installing Node.js again
brew install node@18
brew link node@18

# Verify installation
node -v
npm -v
```

#### Solution 2: Ubuntu/Debian - Repository Issues

```bash
# Update package manager
sudo apt-get update
sudo apt-get upgrade

# Remove any existing Node.js
sudo apt-get remove nodejs npm

# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v
```

#### Solution 3: CentOS/RHEL - Repository Issues

```bash
# Update package manager
sudo yum update

# Remove any existing Node.js
sudo yum remove nodejs npm

# Add RPM NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Install Node.js
sudo yum install nodejs

# Verify installation
node -v
npm -v
```

#### Solution 4: Manual Node.js Installation

If package managers fail:

```bash
# Download Node.js directly
cd /tmp
curl -O https://nodejs.org/dist/v18.17.0/node-v18.17.0-linux-x64.tar.xz

# Extract
tar xf node-v18.17.0-linux-x64.tar.xz

# Add to PATH
mkdir -p ~/.local/bin
ln -s /tmp/node-v18.17.0-linux-x64/bin/node ~/.local/bin/
ln -s /tmp/node-v18.17.0-linux-x64/bin/npm ~/.local/bin/

# Verify
node -v
npm -v

# Run installer
bash install.sh development
```

---

## 🔴 npm Install Errors

### Error: "Failed to install backend/frontend dependencies"

**Symptoms:**
```
npm ERR! code ERESOLVE
npm WARN ERESOLVE unable to resolve dependency tree
npm ERR! ERESOLVE unable to resolve dependency tree
npm install hangs indefinitely
npm install: connection timeout
```

**Causes:**
- Network connectivity issues
- npm cache corruption
- Conflicting package versions
- npm registry problems

**Solutions:**

#### Solution 1: Clear npm Cache

```bash
# Clear cache
npm cache clean --force

# Verify cache is cleared
npm cache verify

# Retry installation
cd server
npm install --legacy-peer-deps

cd ../client
npm install --legacy-peer-deps
```

#### Solution 2: Update npm to Latest

```bash
# Update npm
npm install -g npm@latest

# Verify
npm -v

# Retry installation
npm install --legacy-peer-deps
```

#### Solution 3: Use --force Flag

```bash
# If legacy-peer-deps doesn't work, try force
npm install --legacy-peer-deps --force

# Or in newer npm versions:
npm install --force
```

#### Solution 4: Check Network Connectivity

```bash
# Test npm registry connection
npm ping

# If fails, configure npm registry
npm config set registry https://registry.npmjs.org/

# Or use alternative registry:
npm config set registry https://registry.taobao.org  # For China
npm config set registry https://mirrors.aliyun.com/npm/aliyun  # Aliyun mirror

# Retry installation
npm install --legacy-peer-deps
```

#### Solution 5: Manual Dependency Installation

```bash
cd server

# Install specific packages
npm install express mongoose jsonwebtoken bcryptjs cors dotenv

# Then try full install
npm install --legacy-peer-deps

# If still fails, check package.json for issues
cat package.json  # Review dependencies
```

#### Solution 6: Increase npm Timeout

```bash
# Increase network timeout
npm config set fetch-timeout 120000  # 2 minutes

# Retry
npm install --legacy-peer-deps
```

---

## 🔴 MongoDB Connection Errors

### Error: "MONGODB_URI connection failed" or "connect ECONNREFUSED"

**Symptoms:**
```
MongooseError: connect ECONNREFUSED 127.0.0.1:27017
Error: Unable to connect to MongoDB
Connection timeout on localhost:27017
```

**Causes:**
- MongoDB not installed
- MongoDB not running
- Wrong connection string
- Firewall blocking connection
- MongoDB listening on different port

**Solutions:**

#### Solution 1: Verify MongoDB is Installed

```bash
# Check if MongoDB is installed
which mongod
mongod --version

# If not installed, run installer with MongoDB auto-install
bash install.sh development
# Choose 'yes' when prompted for MongoDB installation
```

#### Solution 2: Start MongoDB

```bash
# macOS - with Homebrew
brew services start mongodb-community
# Or manually
mongod

# Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl status mongod

# CentOS/RHEL
sudo systemctl start mongod
sudo systemctl status mongod

# Verify it's running
netstat -an | grep 27017
# Should show something like: tcp 0 0 127.0.0.1:27017 0.0.0.0:* LISTEN
```

#### Solution 3: Check Connection String

```bash
# Verify in server/.env
cat server/.env | grep MONGODB_URI

# Should be one of:
# MongoDB_URI=mongodb://localhost:27017/waba_gupshup  # Local
# MongoDB_URI=mongodb+srv://user:pass@cluster.mongodb.net/waba_gupshup  # MongoDB Atlas
```

#### Solution 4: Test Connection Manually

```bash
# Test connection with mongo shell
mongosh  # MongoDB 5.0+
# or
mongo    # MongoDB < 5.0

# Once connected, try:
> use admin
> db.adminCommand({ping: 1})

# Should see: { ok: 1 }

# If not installed:
brew install mongodb-community  # macOS
sudo apt-get install mongodb-clients  # Ubuntu
sudo yum install mongodb-database-tools  # CentOS
```

#### Solution 5: Configure MongoDB if Wrong Port

```bash
# If MongoDB is on different port (e.g., 27018):
cd server
nano .env

# Change:
# MONGODB_URI=mongodb://localhost:27018/waba_gupshup

# Or restart MongoDB on default port
sudo mongod --port 27017
```

#### Solution 6: MongoDB Cloud (MongoDB Atlas)

```bash
# For cloud-hosted MongoDB:

# 1. Get connection string from MongoDB Atlas dashboard
# 2. Update server/.env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/waba_gupshup?retryWrites=true&w=majority

# 3. Ensure you've added IP address to Atlas network access
# 4. Verify credentials are correct
```

---

## 🔴 Port Conflicts

### Error: "Port 5000 already in use" or "EADDRINUSE"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
Error: address already in use :::3000
```

**Causes:**
- Another application using the port
- Previous instance still running
- Port restrictions
- Zombie processes

**Solutions:**

#### Solution 1: Find Process Using Port

**macOS/Linux:**
```bash
# Find process on port 5000
lsof -i :5000
# Output shows PID and process name

# Kill the process
kill -9 <PID>

# Verify port is free
lsof -i :5000
# Should show no results
```

**Windows (PowerShell):**
```powershell
# Find process on port 5000
netstat -ano | findstr :5000
# Shows PID in last column

# Kill the process
taskkill /PID <PID> /F

# Verify port is free
netstat -ano | findstr :5000
# Should show no results
```

#### Solution 2: Change Port Number

```bash
# Edit server/.env
cd server
nano .env

# Change PORT value:
# PORT=5001  # Instead of 5000

# Also update frontend
cd ../client
nano .env

# Update API URL:
# REACT_APP_API_BASE_URL=http://localhost:5001/api

# Restart services
npm run dev
```

#### Solution 3: Check for Zombie Processes

```bash
# Find all Node.js processes
ps aux | grep node

# Kill all Node processes (careful!)
killall node

# On Windows:
taskkill /F /IM node.exe
```

---

## 🔴 CORS & API Errors

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Symptoms:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Causes:**
- Incorrect CORS_ORIGIN in server/.env
- Frontend and backend on different domains
- Frontend making requests to wrong API URL
- CORS middleware not configured

**Solutions:**

#### Solution 1: Verify Configuration

```bash
# Check backend CORS setting
cat server/.env | grep CORS_ORIGIN
# Should match frontend origin

# Check frontend API URL
cat client/.env | grep REACT_APP_API_BASE_URL
# Should match backend URL

# For development:
# server/.env: CORS_ORIGIN=http://localhost:3000
# client/.env: REACT_APP_API_BASE_URL=http://localhost:5000/api
```

#### Solution 2: Update CORS_ORIGIN

```bash
# Edit server/.env
cd server
nano .env

# Change CORS_ORIGIN to match frontend:
# CORS_ORIGIN=http://localhost:3000  # For local development
# CORS_ORIGIN=https://yourdomain.com  # For production

# Restart backend
npm run dev
```

#### Solution 3: Update Frontend API URL

```bash
# Edit client/.env
cd client
nano .env

# Ensure API URL is correct:
# REACT_APP_API_BASE_URL=http://localhost:5000/api

# Restart frontend
npm start
```

#### Solution 4: Check Port Numbers

```bash
# Verify services are running on correct ports
lsof -i :3000   # Frontend should be here
lsof -i :5000   # Backend should be here

# If wrong ports, update .env files and restart
```

---

## 🔴 Gupshup Configuration Errors

### Error: "Invalid Gupshup API credentials"

**Symptoms:**
```
Error: Unauthorized - Invalid API key
Error: API response 401 Unauthorized
Error: Gupshup connection failed
```

**Causes:**
- Invalid API key in .env
- API key expired or revoked
- Wrong API endpoint
- Network connectivity to Gupshup

**Solutions:**

#### Solution 1: Verify API Credentials

```bash
# Check credentials in server/.env
cat server/.env | grep GUPSHUP
# Should show:
# GUPSHUP_API_KEY=xxxxxxxxxxxx
# GUPSHUP_APP_ID=xxxxxxxxxxxx
# GUPSHUP_API_BASE_URL=https://api.gupshup.io/wa
```

#### Solution 2: Validate API Key Format

```bash
# API Key should be a long string (usually 32+ characters)
# App ID should be alphanumeric

# If empty or placeholder values, get from Gupshup:
# 1. Log in to Gupshup dashboard
# 2. Go to API Keys section
# 3. Copy your API key and App ID
# 4. Update server/.env
```

#### Solution 3: Update Credentials

```bash
# Edit server/.env
cd server
nano .env

# Update with correct values:
GUPSHUP_API_KEY=your-actual-api-key-here
GUPSHUP_APP_ID=your-actual-app-id-here
GUPSHUP_API_BASE_URL=https://api.gupshup.io/wa

# Restart backend
npm run dev
```

#### Solution 4: Test API Connectivity

```bash
# Test Gupshup API connection
curl -X GET https://api.gupshup.io/wa/api/v1/test \
  -H "Authorization: Bearer YOUR_API_KEY"

# Should return valid response, not 401 or connection error
```

---

## 🔴 Environment File Errors

### Error: ".env file not found" or "Environment variables not loaded"

**Symptoms:**
```
Error: Cannot find module '.env' or environment variables undefined
Gupshup API key is undefined
Database connection string is undefined
```

**Causes:**
- .env file not created
- .env file in wrong location
- Missing dotenv package
- Syntax errors in .env

**Solutions:**

#### Solution 1: Verify .env Files Exist

```bash
# Check backend .env
ls -la server/.env

# Check frontend .env
ls -la client/.env

# If missing, create them
# Run install script or create manually
bash install.sh development
```

#### Solution 2: Check .env Syntax

```bash
# .env files should have format:
# KEY=VALUE
# No spaces around =
# One entry per line

# Example:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/waba_gupshup
JWT_SECRET=your-secret-here

# Invalid:
PORT = 5000  # Extra spaces
PORT: 5000   # Wrong delimiter
PORT         # Missing value
```

#### Solution 3: Recreate .env Files

```bash
# Backend
cd server
cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/waba_gupshup
JWT_SECRET=generated-secret-here
# Add other required variables...
EOF

# Frontend
cd ../client
cat > .env << 'EOF'
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ENV=development
# Add other required variables...
EOF
```

#### Solution 4: Check dotenv Installation

```bash
# Verify dotenv is installed
cd server
npm list dotenv

# If not installed:
npm install dotenv

# Verify in code (should be first line):
# require('dotenv').config()
grep "dotenv" server.js  # or index.js
```

---

## 🟡 Performance Issues

### Issue: "npm install is very slow" or "Taking hours"

**Symptoms:**
- npm install runs for 1+ hours
- Network seems fine
- Disk usage is high
- No error messages

**Solutions:**

#### Solution 1: Check Disk Space

```bash
# Check available disk space
df -h
# Need at least 5GB free

# If low on space, clean up
npm cache clean --force
rm -rf node_modules  # Be careful!
rm package-lock.json
```

#### Solution 2: Use npm ci Instead

```bash
# If package-lock.json exists, use ci (faster)
npm ci --legacy-peer-deps

# Otherwise use install
npm install --legacy-peer-deps
```

#### Solution 3: Disable Optional Dependencies

```bash
# Skip optional dependencies to speed up
npm install --no-optional --legacy-peer-deps
```

#### Solution 4: Use Yarn Alternative

```bash
# Install yarn if available
npm install -g yarn

# Use yarn instead (sometimes faster)
yarn install
```

---

## 🟡 Permission Errors

### Error: "Permission denied" or "EACCES"

**Symptoms:**
```
EACCES: permission denied, mkdir
EACCES: permission denied, open '.env'
Error: EACCES: permission denied, access '...'
```

**Causes:**
- Running with insufficient permissions
- File ownership issues
- Directory permissions too restrictive
- Node.js modules installed with sudo

**Solutions:**

#### Solution 1: Fix npm Permissions (Recommended)

```bash
# Configure npm to use user directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Add to shell profile (e.g., ~/.bashrc or ~/.zshrc)
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Retry installation
npm install --legacy-peer-deps
```

#### Solution 2: Use sudo (Not Recommended)

```bash
# Only if user fix doesn't work
sudo npm install --legacy-peer-deps

# This creates permission issues later, avoid if possible
```

#### Solution 3: Fix Directory Permissions

```bash
# Fix node_modules permissions
sudo chown -R $USER:$USER node_modules

# Fix .npm cache
sudo chown -R $USER:$USER ~/.npm

# Retry installation
npm install --legacy-peer-deps
```

---

## 🟡 Database Initialization Errors

### Error: "Failed to initialize database" or "Schema validation failed"

**Symptoms:**
```
Error initializing database
ValidationError: Schema validation failed
MongoError: E11000 duplicate key error

Connection successful but collections don't exist
```

**Causes:**
- MongoDB permissions
- Schema conflicts
- Database already exists with different schema
- Index creation failed

**Solutions:**

#### Solution 1: Drop and Recreate Database

```bash
# Connect to MongoDB
mongosh  # or mongo

# Drop existing database
use waba_gupshup
db.dropDatabase()

# Exit and restart backend
exit
npm run dev
# Backend will recreate schema
```

#### Solution 2: Clear Collections

```bash
# If you want to keep database but clear collections:
mongosh

use waba_gupshup

# List collections
show collections

# Drop specific collection
db.users.deleteMany({})
db.messages.deleteMany({})
db.conversations.deleteMany({})

exit
```

#### Solution 3: Check MongoDB Compatibility

```bash
# Verify MongoDB version
mongod --version
# Should be 4.0 or higher

# Check backend MongoDB driver
cd server
npm list mongodb mongoose

# May need to update if too old
npm update mongoose mongodb
```

---

## 🟢 Getting Help

### When to Use Each Resource

| Issue Type | Resource |
|-----------|----------|
| Node.js/npm issues | npm official docs, stackoverflow |
| MongoDB issues | MongoDB docs, MongoDB community |
| CORS issues | MDN CORS documentation |
| Framework issues | Express/React documentation |
| Gupshup issues | Gupshup API documentation |
| Installation issues | INSTALLATION_COMPLETE.md |

### Collecting Information for Support

If you need help, provide:

```bash
# System info
uname -a
echo $SHELL

# Installed versions
node -v
npm -v
mongod --version
git --version

# Project structure
ls -la

# Error output (last 50 lines)
npm install 2>&1 | tail -50

# Configuration (remove sensitive data)
cat server/.env | grep -v GUPSHUP | grep -v JWT | head -20
cat client/.env | head -20
```

---

## ✅ Verification Steps

After fixing an issue, verify the installation:

```bash
# 1. Check prerequisites
node -v    # Should show v18.x.x
npm -v     # Should show 9.x.x or higher
git -v     # Should show git version 2.x.x

# 2. Verify project structure
ls -la server/package.json
ls -la client/package.json
ls -la server/node_modules  # Should exist
ls -la client/node_modules  # Should exist

# 3. Test database connection
mongosh
> use waba_gupshup
> db.adminCommand({ping: 1})
# Should return { ok: 1 }

# 4. Start services and test
cd server && npm run dev &
cd client && npm start &

# 5. Test API endpoint
curl http://localhost:5000/api/health
# Should return success response

# 6. Check frontend loads
# Visit http://localhost:3000 in browser
# Should see the application interface
```

---

## 📞 Support Contact

For persistent issues:
1. Check this guide again (most issues are covered)
2. Review error messages carefully
3. Check Stack Overflow for similar issues
4. Contact support with collected information

---

**Last Updated:** 2024
**Coverage:** 15+ common installation issues and solutions
**Version:** Compatible with install.sh automation
