# Environment Variables Setup Guide

Complete guide for configuring `.env` files to deploy the WABA BSP platform on your SSH server.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Environment Variables](#backend-environment-variables)
3. [Frontend Environment Variables](#frontend-environment-variables)
4. [SSH Server Deployment](#ssh-server-deployment)
5. [Environment-Specific Configurations](#environment-specific-configurations)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up environment variables, ensure you have:

- SSH access to your server
- Node.js 18.x or higher installed on the server
- MongoDB 5.x (local or MongoDB Atlas)
- npm or yarn package manager
- Git (optional but recommended)

### Check Server Requirements

```bash
# SSH into your server
ssh user@your-server-ip

# Check Node.js version
node --version     # Should be v18.x or higher

# Check npm version
npm --version      # Should be v9.x or higher

# Check if MongoDB is accessible
mongosh --version  # If using local MongoDB
```

---

## Backend Environment Variables

The backend server requires a `.env` file in the `server/` directory with the following variables:

### File Location
```
server/.env
```

### Basic Template

Create the file with these essential variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/waba-bsp?retryWrites=true&w=majority

# JWT Secrets (Generate using: openssl rand -base64 32)
JWT_SECRET=your-generated-random-secret-here
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=your-generated-refresh-secret-here

# Gupshup Configuration
GUPSHUP_API_KEY=your-gupshup-api-key
GUPSHUP_APP_ID=your-gupshup-app-id
GUPSHUP_API_BASE_URL=https://api.gupshup.io/wa

# Webhook Configuration
WEBHOOK_TOKEN=your-webhook-token
WEBHOOK_URL=https://your-domain.com/api/webhooks/gupshup

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# Session Management
SESSION_SECRET=your-generated-session-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Analytics
ANALYTICS_RETENTION_DAYS=90
ENABLE_ANALYTICS=true

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SENDER_EMAIL=noreply@your-domain.com
```

### Detailed Variable Explanations

#### Server Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port number for backend API | `5000` |
| `NODE_ENV` | Environment mode | `production` or `development` |

#### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |

**MongoDB Atlas Setup:**
```
mongodb+srv://username:password@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority
```

**Local MongoDB:**
```
mongodb://localhost:27017/waba-bsp
```

#### JWT & Authentication

| Variable | Description | How to Generate |
|----------|-------------|-----------------|
| `JWT_SECRET` | Secret key for JWT tokens | `openssl rand -base64 32` |
| `JWT_EXPIRY` | Token expiration time | `7d`, `24h`, `7200s` |
| `REFRESH_TOKEN_SECRET` | Secret for refresh tokens | `openssl rand -base64 32` |

#### Gupshup Configuration

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `GUPSHUP_API_KEY` | Your Gupshup API key | Gupshup Dashboard > API Settings |
| `GUPSHUP_APP_ID` | Gupshup application ID | Gupshup Dashboard > App Configuration |
| `GUPSHUP_API_BASE_URL` | Gupshup API endpoint | `https://api.gupshup.io/wa` |

#### Webhook Configuration

| Variable | Description | Format |
|----------|-------------|--------|
| `WEBHOOK_TOKEN` | Secret token for webhook validation | Generate: `openssl rand -base64 32` |
| `WEBHOOK_URL` | Webhook endpoint URL | `https://your-domain.com/api/webhooks/gupshup` |

#### CORS & Security

| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ORIGIN` | Allowed frontend origin | `https://your-domain.com` |
| `SESSION_SECRET` | Secret for session management | `openssl rand -base64 32` |

#### Rate Limiting

| Variable | Description | Value |
|----------|-------------|-------|
| `RATE_LIMIT_WINDOW_MS` | Time window in milliseconds | `900000` (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `1000` for production |

#### File Upload

| Variable | Description | Value |
|----------|-------------|-------|
| `MAX_FILE_SIZE` | Maximum file size in bytes | `5242880` (5MB) |
| `UPLOAD_DIR` | Directory for uploaded files | `./uploads` |

#### Email Configuration (Optional)

Use this if you want to enable email notifications:

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server address | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email account for sending | `your-email@gmail.com` |
| `SMTP_PASS` | Email password or app password | App-specific password |
| `SENDER_EMAIL` | Email display address | `noreply@your-domain.com` |

---

## Frontend Environment Variables

The frontend React application requires a `.env` file in the `client/` directory.

### File Location
```
client/.env
```

### Basic Template

```bash
# Environment Configuration
REACT_APP_ENV=production
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_LOG_LEVEL=info
```

### Detailed Explanations

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_ENV` | Frontend environment | `production` or `development` |
| `REACT_APP_API_URL` | Backend API base URL | `https://your-domain.com/api` |
| `REACT_APP_MAX_FILE_SIZE` | Max file upload size | `5242880` (5MB) |
| `REACT_APP_LOG_LEVEL` | Console log level | `info`, `debug`, `warn`, `error` |

### Important Notes

- React only exposes variables prefixed with `REACT_APP_`
- Frontend doesn't store sensitive secrets (API keys are on backend)
- API URL must be accessible from client browser

---

## SSH Server Deployment

### Step 1: Connect to Your Server

```bash
ssh user@your-server-ip
```

### Step 2: Navigate to Project Directory

```bash
cd /path/to/your/waba-gupshup
```

### Step 3: Create Backend .env File

```bash
# Using nano editor
nano server/.env

# OR using vim editor
vim server/.env
```

**Paste this template and fill in your values:**

```bash
PORT=5000
NODE_ENV=production

MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/waba-bsp?retryWrites=true&w=majority

JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)

GUPSHUP_API_KEY=your-actual-gupshup-key
GUPSHUP_APP_ID=your-actual-gupshup-app-id
GUPSHUP_API_BASE_URL=https://api.gupshup.io/wa

WEBHOOK_TOKEN=$(openssl rand -base64 32)
WEBHOOK_URL=https://your-domain.com/api/webhooks/gupshup

CORS_ORIGIN=https://your-domain.com
SESSION_SECRET=$(openssl rand -base64 32)

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

ANALYTICS_RETENTION_DAYS=90
ENABLE_ANALYTICS=true

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SENDER_EMAIL=noreply@your-domain.com
```

**Save and exit:**
- Nano: Press `Ctrl + X`, then `Y`, then `Enter`
- Vim: Press `Esc`, type `:wq`, press `Enter`

### Step 4: Create Frontend .env File

```bash
nano client/.env
```

**Paste this content:**

```bash
REACT_APP_ENV=production
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_LOG_LEVEL=info
```

**Save and exit:** Follow instructions above

### Step 5: Verify Files Were Created

```bash
# Check backend .env
cat server/.env

# Check frontend .env
cat client/.env
```

### Step 6: Secure the .env Files

```bash
# Change permissions to 600 (only owner can read/write)
chmod 600 server/.env
chmod 600 client/.env

# Verify permissions
ls -la server/.env client/.env
```

---

## Environment-Specific Configurations

### Development Environment

**server/.env:**
```bash
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/waba-bsp-dev
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX_REQUESTS=100
```

**client/.env:**
```bash
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_LOG_LEVEL=debug
```

### Staging Environment

**server/.env:**
```bash
PORT=5000
NODE_ENV=staging
MONGODB_URI=mongodb+srv://username:password@cluster-staging.mongodb.net/waba-bsp-staging
CORS_ORIGIN=https://staging.your-domain.com
RATE_LIMIT_MAX_REQUESTS=500
```

**client/.env:**
```bash
REACT_APP_ENV=staging
REACT_APP_API_URL=https://staging.your-domain.com/api
REACT_APP_LOG_LEVEL=warn
```

### Production Environment

**server/.env:**
```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster-prod.mongodb.net/waba-bsp
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_MAX_REQUESTS=1000
```

**client/.env:**
```bash
REACT_APP_ENV=production
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_LOG_LEVEL=info
```

---

## Setting Up on SSH Server - Automated Script

If you prefer automated setup, use the provided installation script:

### Using Bash Script (Linux/macOS/WSL)

```bash
# Copy script to server (from your local machine)
scp install.sh user@your-server-ip:/path/to/waba-gupshup/

# SSH into server
ssh user@your-server-ip

# Navigate to project
cd /path/to/waba-gupshup

# Run installation script
bash install.sh production

# Follow the interactive prompts to enter your credentials
```

### Using PowerShell Script (Windows)

```powershell
# Copy script to server
scp install.ps1 user@your-server-ip:/path/to/waba-gupshup/

# SSH into server
ssh user@your-server-ip

# Navigate to project
cd /path/to/waba-gupshup

# Run installation script
pwsh install.ps1 -Environment production

# Follow the interactive prompts
```

---

## Generating Secure Secrets

### Generate JWT Secrets

```bash
openssl rand -base64 32
```

**Output example:**
```
xJ8kL9mN2pQ4rS6tU8vW0xY2zA3bC4dE5fG6hI7jK8lM=
```

### Generate Multiple Secrets at Once

```bash
# Create a script to generate all secrets
cat << 'EOF' > generate_secrets.sh
#!/bin/bash
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)"
echo "SESSION_SECRET=$(openssl rand -base64 32)"
echo "WEBHOOK_TOKEN=$(openssl rand -base64 32)"
EOF

chmod +x generate_secrets.sh
./generate_secrets.sh
```

---

## MongoDB Atlas Connection

### Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new cluster

### Step 2: Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Add your server IP address (or `0.0.0.0/0` for development)

### Step 3: Create Database User

1. Go to "Database Access"
2. Click "Add New Database User"
3. Create username and password
4. Assign appropriate roles

### Step 4: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" driver
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<database>` with your values

**Example:**
```
mongodb+srv://myuser:mypassword@cluster0.mongodb.net/waba-bsp?retryWrites=true&w=majority
```

---

## Gupshup Configuration

### Step 1: Create Gupshup Account

1. Go to [gupshup.io](https://www.gupshup.io)
2. Sign up or log in
3. Create a new WhatsApp application

### Step 2: Get API Credentials

1. Navigate to "Integrations" or "API Settings"
2. Find your `API Key`
3. Find your `App ID`
4. Create a `Webhook URL` (use `/api/webhooks/gupshup` endpoint)

### Step 3: Set Webhook Token

1. In Gupshup dashboard, go to Webhook settings
2. Generate or create a security token
3. Save this token as `WEBHOOK_TOKEN` in `.env`

---

## Gmail SMTP Configuration (Optional Email)

### Step 1: Enable 2-Factor Authentication

1. Go to myaccount.google.com
2. Navigate to "Security"
3. Enable "2-Step Verification"

### Step 2: Create App Password

1. In Security settings, find "App passwords"
2. Select "Mail" and "Windows Computer"
3. Generate an app password
4. Google will show a 16-character password

### Step 3: Configure .env

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # 16-character app password
SENDER_EMAIL=noreply@your-domain.com
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot find module" error

**Problem:** Application starts but crashes with missing dependencies

**Solution:**
```bash
cd server
npm install --legacy-peer-deps
cd ../client
npm install --legacy-peer-deps
```

#### 2. MongoDB Connection Fails

**Problem:** `MongoNetworkError` or timeout

**Solutions:**
- Verify MongoDB Atlas IP whitelist includes your server IP
- Check credentials are correct: `mongodb+srv://user:password@...`
- Ensure MongoDB URI includes database name
- Test connection: `mongosh "your-connection-string"`

#### 3. CORS Error

**Problem:** Frontend gets CORS blocked response

**Solution:**
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Ensure it includes protocol: `https://domain.com` (not `domain.com`)
- Check for trailing slashes: `https://domain.com` (not `https://domain.com/`)

```bash
# Example fix
CORS_ORIGIN=https://your-domain.com
```

#### 4. Gupshup Webhook Not Receiving Messages

**Problem:** Messages not coming through webhook

**Solutions:**
- Verify `WEBHOOK_URL` is publicly accessible
- Check `WEBHOOK_TOKEN` matches in Gupshup dashboard
- Ensure backend is running: `pm2 status`
- Check logs: `pm2 logs`
- Verify webhook endpoint: `curl https://your-domain.com/api/webhooks/gupshup`

#### 5. File Upload Fails

**Problem:** File upload returns 413 error

**Solution:**
- Increase `MAX_FILE_SIZE`: `52428800` (50MB)
- Check Nginx config if using reverse proxy:
  ```nginx
  client_max_body_size 50M;
  ```

#### 6. JWT Token Expires Too Quickly

**Problem:** Users get logged out frequently

**Solution:**
- Adjust `JWT_EXPIRY` in server/.env
- Examples: `7d`, `14d`, `30d`, `3600s`
- Ensure `REFRESH_TOKEN_SECRET` is also configured

---

## Verification Checklist

After setting up environment variables, verify everything:

```bash
# 1. Check .env files exist
ls -la server/.env client/.env

# 2. Verify file permissions (should be 600)
ls -la server/.env | grep -o "^-.*"

# 3. Test MongoDB connection
npm run test:db  # (if available)

# 4. Check all required variables are set
grep -E "^[A-Z_]+=.+" server/.env | wc -l

# 5. Verify no secrets are exposed
git status  # .env should not be listed

# 6. Test API connectivity
curl -I https://your-domain.com/api/health

# 7. Check logs for errors
pm2 logs
```

---

## Security Best Practices

1. **Never commit .env to Git**
   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep ".env"
   ```

2. **Use strong, random secrets**
   ```bash
   # Always use openssl to generate secrets
   openssl rand -base64 32
   ```

3. **Restrict .env file permissions**
   ```bash
   chmod 600 server/.env client/.env
   ```

4. **Use environment variables for CI/CD**
   ```bash
   # Don't pass secrets in command line
   # Use CI/CD platform's secret manager
   ```

5. **Rotate secrets periodically**
   - Change JWT_SECRET every 90 days
   - Update Gupshup API key regularly
   - Refresh SMTP password annually

6. **Monitor access to .env**
   ```bash
   # Check who accessed the file
   stat server/.env
   ```

---

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Gupshup WhatsApp API Docs](https://www.gupshup.io/developer/docs)
- [Node.js Environment Variables](https://nodejs.org/en/knowledge/file-system/how-to-use-the-fs-module/)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## Quick Reference

### Backend .env Template for Copy-Paste

```bash
cat > server/.env << 'EOF'
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/waba-bsp?retryWrites=true&w=majority
JWT_SECRET=your-secret-here
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=your-refresh-secret-here
GUPSHUP_API_KEY=your-gupshup-api-key
GUPSHUP_APP_ID=your-gupshup-app-id
GUPSHUP_API_BASE_URL=https://api.gupshup.io/wa
WEBHOOK_TOKEN=your-webhook-token
WEBHOOK_URL=https://your-domain.com/api/webhooks/gupshup
CORS_ORIGIN=https://your-domain.com
SESSION_SECRET=your-session-secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
ANALYTICS_RETENTION_DAYS=90
ENABLE_ANALYTICS=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SENDER_EMAIL=noreply@your-domain.com
EOF
```

### Frontend .env Template for Copy-Paste

```bash
cat > client/.env << 'EOF'
REACT_APP_ENV=production
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_LOG_LEVEL=info
EOF
```

---

**Last Updated:** November 2024  
**Version:** 1.0  
**Support:** For issues, check TROUBLESHOOTING.md or contact support
