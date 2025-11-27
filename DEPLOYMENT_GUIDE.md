# WABA BSP Panel - Linux SSH Server Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Nginx Configuration](#nginx-configuration)
8. [SSL/TLS Setup](#ssltls-setup)
9. [Process Management](#process-management)
10. [Monitoring & Logs](#monitoring--logs)
11. [Maintenance](#maintenance)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- Linux server (Ubuntu 20.04 LTS or newer recommended)
- 2+ CPU cores
- 4GB+ RAM
- 20GB+ disk space
- Root or sudo access
- Domain name (for SSL)

### Required Software
- Node.js 18.x or higher
- npm or yarn
- MongoDB 5.x or higher
- Nginx
- Git
- OpenSSL
- Curl

---

## Server Setup

### 1. Initial System Update

```bash
# Connect to your server
ssh root@your_server_ip

# Update system packages
sudo apt update
sudo apt upgrade -y

# Install essential tools
sudo apt install -y build-essential curl wget git nano htop
```

### 2. Install Node.js

```bash
# Add NodeSource repository
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install MongoDB

```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Update and install
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### 4. Install Nginx

```bash
sudo apt install -y nginx

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Verify Nginx is running
sudo systemctl status nginx
```

### 5. Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Install PM2 startup hook
sudo pm2 startup systemd -u root --hp /root

# Save PM2 process list
pm2 save
```

### 6. Create Application Directory

```bash
# Create directory structure
mkdir -p /var/www/waba-bsp
cd /var/www/waba-bsp

# Create app user (optional but recommended)
sudo useradd -m -s /bin/bash waba-user
sudo chown -R waba-user:waba-user /var/www/waba-bsp
sudo -u waba-user -i
```

---

## Environment Configuration

### 1. Clone Repository

```bash
cd /var/www/waba-bsp

# Clone your repository (replace with your repo URL)
git clone https://github.com/yourusername/waba-bsp.git .

# Navigate to project
cd server
```

### 2. Configure Backend Environment

```bash
# Copy example env file
cp .env.example .env

# Edit with production values
nano .env
```

**Production .env Example:**

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/waba-bsp
MONGODB_USER=waba_user
MONGODB_PASS=your_secure_password

# JWT
JWT_SECRET=your_very_long_random_secret_key_change_this
JWT_EXPIRE=7d

# Gupshup API Configuration
GUPSHUP_API_KEY=your_gupshup_api_key
GUPSHUP_APP_ID=your_gupshup_app_id
GUPSHUP_BASE_URL=https://api.gupshup.io/wa

# Webhook Configuration
WEBHOOK_URL=https://yourdomain.com/api/webhooks/message
WEBHOOK_TOKEN=your_secure_webhook_token

# Email Configuration (for password reset, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
SENDER_EMAIL=noreply@wababsp.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/var/www/waba-bsp/uploads

# CORS
CORS_ORIGIN=https://yourdomain.com

# Session
SESSION_SECRET=your_secure_session_secret

# Analytics
ENABLE_ANALYTICS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. MongoDB User Setup

```bash
# Open MongoDB shell
mongo

# Inside mongo shell:
use admin
db.createUser({
  user: "waba_user",
  pwd: "your_secure_password",
  roles: ["root"]
})

# Create database and user
use waba-bsp
db.createUser({
  user: "waba_user",
  pwd: "your_secure_password",
  roles: ["readWrite", "dbAdmin"]
})

exit
```

### 4. Enable MongoDB Authentication

```bash
# Edit MongoDB config
sudo nano /etc/mongod.conf

# Find and uncomment security section:
# security:
#   authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod
```

---

## Database Setup

### 1. Create Database Indexes

```bash
# Connect to MongoDB with authentication
mongo -u waba_user -p --authenticationDatabase admin localhost:27017/waba-bsp

# Create collections and indexes
db.createCollection("users")
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ createdAt: 1 })

db.createCollection("apps")
db.apps.createIndex({ userId: 1 })
db.apps.createIndex({ gupshupAppId: 1 }, { unique: true })

db.createCollection("templates")
db.templates.createIndex({ appId: 1, name: 1 }, { unique: true })
db.templates.createIndex({ appId: 1, status: 1 })

db.createCollection("journeys")
db.journeys.createIndex({ appId: 1, userId: 1 })
db.journeys.createIndex({ appId: 1, status: 1 })

db.createCollection("messages")
db.messages.createIndex({ appId: 1, createdAt: -1 })
db.messages.createIndex({ messageId: 1 }, { unique: true })
db.messages.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 })

db.createCollection("wallettransactions")
db.wallettransactions.createIndex({ userId: 1, createdAt: -1 })
```

### 2. Backup Strategy

```bash
# Create backup directory
mkdir -p /var/backups/mongodb

# Create backup script
sudo nano /usr/local/bin/backup-mongodb.sh
```

**Backup Script Content:**

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mongodump -u waba_user -p'your_password' \
  --authenticationDatabase admin \
  --out $BACKUP_DIR/dump_$TIMESTAMP

# Keep only last 7 days of backups
find $BACKUP_DIR -name "dump_*" -mtime +7 -exec rm -rf {} \;

echo "MongoDB backup completed at $(date)"
```

```bash
# Make script executable
sudo chmod +x /usr/local/bin/backup-mongodb.sh

# Add to crontab for daily backups
sudo crontab -e
# Add line: 0 2 * * * /usr/local/bin/backup-mongodb.sh
```

---

## Backend Deployment

### 1. Install Dependencies

```bash
cd /var/www/waba-bsp/server

# Install npm dependencies
npm install

# Verify installation
npm list | head -20
```

### 2. Create PM2 Config File

```bash
# Create pm2 config
nano /var/www/waba-bsp/ecosystem.config.js
```

**ecosystem.config.js Content:**

```javascript
module.exports = {
  apps: [
    {
      name: 'waba-bsp-server',
      script: './server.js',
      cwd: '/var/www/waba-bsp/server',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/var/log/pm2/waba-server-error.log',
      out_file: '/var/log/pm2/waba-server-out.log',
      log_file: '/var/log/pm2/waba-server-combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=512',
    },
  ],
};
```

### 3. Start Backend with PM2

```bash
cd /var/www/waba-bsp

# Start application
pm2 start ecosystem.config.js

# Save process list
pm2 save

# Verify it's running
pm2 list
pm2 status waba-bsp-server

# View logs
pm2 logs waba-bsp-server
```

### 4. Create Log Rotation

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/waba-bsp
```

**Logrotate Config:**

```
/var/log/pm2/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
```

---

## Frontend Deployment

### 1. Build React Application

```bash
cd /var/www/waba-bsp/client

# Install dependencies
npm install

# Create production build
npm run build

# Verify build
ls -la build/
```

### 2. Setup Static File Serving

```bash
# Create directory for frontend
sudo mkdir -p /var/www/waba-bsp-frontend

# Copy build files
sudo cp -r build/* /var/www/waba-bsp-frontend/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/waba-bsp-frontend
sudo chmod -R 755 /var/www/waba-bsp-frontend
```

---

## Nginx Configuration

### 1. Create Nginx Config

```bash
# Create Nginx config file
sudo nano /etc/nginx/sites-available/waba-bsp
```

**Nginx Configuration:**

```nginx
# Upstream backend
upstream waba_backend {
    least_conn;
    server localhost:5000 max_fails=3 fail_timeout=30s;
    keepalive 64;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be set up by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # Root directory
    root /var/www/waba-bsp-frontend;

    # Frontend - React app
    location / {
        try_files $uri /index.html;
        expires -1;
        add_header Cache-Control "public, max-age=3600";
    }

    # Static files (JS, CSS, images)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://waba_backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Webhook endpoint (public)
    location /api/webhooks/ {
        proxy_pass http://waba_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Access and error logs
    access_log /var/log/nginx/waba-bsp-access.log combined;
    error_log /var/log/nginx/waba-bsp-error.log warn;
}
```

### 2. Enable Nginx Config

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/waba-bsp /etc/nginx/sites-enabled/

# Remove default config if exists
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

# If all is well, restart Nginx
sudo systemctl restart nginx
```

### 3. Nginx Maintenance

```bash
# Monitor Nginx status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/waba-bsp-access.log

# View error logs
sudo tail -f /var/log/nginx/waba-bsp-error.log

# Reload config without downtime
sudo nginx -s reload
```

---

## SSL/TLS Setup

### 1. Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

### 2. Obtain SSL Certificate

```bash
# Get SSL certificate for your domain
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Choose option 1 for new certificate
# Agree to terms
# Choose to share email (optional)

# Verify certificate
sudo certbot certificates
```

### 3. Setup Auto-Renewal

```bash
# Enable certbot renewal timer
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run

# View renewal status
sudo systemctl status certbot.timer
```

### 4. SSL Testing

```bash
# Test SSL configuration
curl -I https://yourdomain.com

# Test with detailed info
openssl s_client -connect yourdomain.com:443

# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout
```

---

## Process Management

### 1. PM2 Commands Reference

```bash
# Start application
pm2 start ecosystem.config.js

# List all processes
pm2 list

# Show details of a process
pm2 show waba-bsp-server

# View logs
pm2 logs waba-bsp-server

# Real-time monitoring
pm2 monit

# Restart application
pm2 restart waba-bsp-server

# Stop application
pm2 stop waba-bsp-server

# Delete application
pm2 delete waba-bsp-server

# Save process list (important!)
pm2 save

# Restore processes on reboot
pm2 startup systemd
```

### 2. System Health Check

```bash
# Create health check script
nano /usr/local/bin/health-check.sh
```

**Health Check Script:**

```bash
#!/bin/bash

# Check if backend is responding
echo "Checking backend health..."
curl -s http://localhost:5000/api/health | grep -q "healthy"
if [ $? -eq 0 ]; then
    echo "✓ Backend is healthy"
else
    echo "✗ Backend is down"
fi

# Check if MongoDB is running
echo "Checking MongoDB..."
systemctl is-active --quiet mongod && echo "✓ MongoDB is running" || echo "✗ MongoDB is down"

# Check if Nginx is running
echo "Checking Nginx..."
systemctl is-active --quiet nginx && echo "✓ Nginx is running" || echo "✗ Nginx is down"

# Check disk space
echo "Checking disk space..."
df -h / | tail -1

# Check memory
echo "Checking memory..."
free -h | grep Mem

# Check CPU load
echo "Checking CPU load..."
uptime
```

```bash
chmod +x /usr/local/bin/health-check.sh

# Run health check
/usr/local/bin/health-check.sh

# Add to cron for periodic checks
crontab -e
# Add: 0 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log 2>&1
```

---

## Monitoring & Logs

### 1. Setup Log Files

```bash
# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
```

### 2. Monitor Application

```bash
# Real-time PM2 monitoring
pm2 monit

# Follow backend logs
pm2 logs waba-bsp-server --follow

# View error logs
pm2 logs waba-bsp-server --err

# Check system resources
htop

# Monitor network
iftop

# Monitor disk I/O
iostat -x 1
```

### 3. Setup Monitoring Dashboard (Optional)

```bash
# Install PM2 Plus (optional, provides monitoring)
pm2 plus

# Or setup custom monitoring with tools like:
# - Datadog
# - New Relic
# - Prometheus + Grafana
```

---

## Maintenance

### 1. Update Dependencies

```bash
# Check for outdated packages
cd /var/www/waba-bsp/server
npm outdated

# Update packages
npm update

# For security updates only
npm audit
npm audit fix

# Commit changes
git add package*.json
git commit -m "Update dependencies"
```

### 2. Deploy Updates

```bash
# Pull latest changes
cd /var/www/waba-bsp
git pull origin main

# Update server dependencies
cd server
npm install

# Update frontend dependencies
cd ../client
npm install
npm run build

# Copy new build
sudo cp -r build/* /var/www/waba-bsp-frontend/

# Restart backend
pm2 restart waba-bsp-server

# Clear browser cache (notify users)
```

### 3. Regular Maintenance Tasks

```bash
# Weekly: Check logs for errors
tail -n 100 /var/log/pm2/waba-server-error.log

# Weekly: Check disk usage
du -sh /var/www/waba-bsp/*

# Monthly: Clean old backups
ls -la /var/backups/mongodb/

# Monthly: Update system
sudo apt update && sudo apt upgrade -y

# Monthly: Review MongoDB performance
mongo --eval "db.serverStatus()" -u waba_user -p
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Backend Won't Start

```bash
# Check error logs
pm2 logs waba-bsp-server --err

# Check if port 5000 is in use
sudo lsof -i :5000

# Check Node.js version
node --version

# Check environment variables
cat /var/www/waba-bsp/server/.env

# Manually test startup
cd /var/www/waba-bsp/server
node server.js
```

#### 2. MongoDB Connection Error

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Verify credentials
mongo -u waba_user -p --authenticationDatabase admin

# Check MongoDB port
sudo netstat -tlnp | grep mongo
```

#### 3. Nginx 502 Bad Gateway

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check Nginx config
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/waba-bsp-error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Verify certificate
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout

# Renew certificate
sudo certbot renew --force-renewal

# Check renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

#### 5. High Memory Usage

```bash
# Check what's using memory
ps aux --sort=-%mem | head -10

# Check Node.js process
pm2 show waba-bsp-server

# Check MongoDB size
mongo -u waba_user -p --authenticationDatabase admin --eval "db.stats()"

# Restart application to free memory
pm2 restart waba-bsp-server
```

#### 6. Slow API Response

```bash
# Check system load
uptime
top

# Check database queries
mongo -u waba_user -p --authenticationDatabase admin --eval "db.currentOp()"

# Check network latency
ping yourdomain.com
traceroute yourdomain.com

# Check Nginx performance
sudo systemctl status nginx
tail -f /var/log/nginx/waba-bsp-access.log
```

### Debug Commands

```bash
# Test API endpoint
curl -X GET http://localhost:5000/api/health

# Test with authentication
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer your_token"

# Test webhook endpoint
curl -X POST http://localhost:5000/api/webhooks/message \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: your_token" \
  -d '{}'

# Check all listening ports
sudo netstat -tlnp

# Check firewall
sudo ufw status
```

---

## Production Checklist

- [ ] Update all environment variables in .env
- [ ] Set strong passwords for MongoDB and JWT
- [ ] Enable SSL/TLS with Let's Encrypt
- [ ] Configure firewall rules
- [ ] Setup regular backups
- [ ] Configure log rotation
- [ ] Enable process monitoring (PM2)
- [ ] Setup uptime monitoring (Pingdom, etc.)
- [ ] Configure email notifications for errors
- [ ] Document your setup and credentials (securely)
- [ ] Test disaster recovery
- [ ] Setup rate limiting
- [ ] Enable CORS only for your domain
- [ ] Configure security headers
- [ ] Setup proper logging
- [ ] Test webhook integration
- [ ] Load test the application
- [ ] Setup CI/CD pipeline
- [ ] Document deployment procedure
- [ ] Create runbooks for common tasks
- [ ] Schedule regular security audits

---

## Performance Optimization Tips

```bash
# Increase file descriptors
ulimit -n 65535

# Optimize MongoDB indexes
# Already configured in Database Setup section

# Enable caching
# Configure Redis for sessions and caching
sudo apt install redis-server

# Monitor performance
node --prof server.js
node --prof-process isolate-*.log > profile.txt
```

---

## Backup & Recovery

### Backup Strategy

```bash
# Daily database backups
0 2 * * * /usr/local/bin/backup-mongodb.sh

# Weekly application backups
0 3 * * 0 tar -czf /var/backups/app/app-$(date +\%Y\%m\%d).tar.gz /var/www/waba-bsp

# Upload to cloud storage (S3, Google Cloud, etc.)
0 4 * * * aws s3 cp /var/backups/mongodb/ s3://your-bucket/backups/ --recursive
```

### Recovery Procedure

```bash
# Restore MongoDB
mongorestore -u waba_user -p --authenticationDatabase admin /var/backups/mongodb/dump_YYYYMMDD_HHMMSS/

# Restore application files
cd /var/www
tar -xzf /var/backups/app/app-YYYYMMDD.tar.gz

# Restart services
pm2 restart waba-bsp-server
sudo systemctl restart nginx
```

---

## Support & Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Gupshup API Docs](https://docs.gupshup.io/)
- [Let's Encrypt](https://letsencrypt.org/)
- [PM2 Documentation](https://pm2.keymetrics.io/)

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: November 2025  
**Tested On**: Ubuntu 20.04 LTS, Node.js 18.x, MongoDB 5.x
