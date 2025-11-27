# Configuration Guide - WABA BSP Platform

## Overview

This guide covers all configuration aspects of the WABA BSP platform, from development to production.

## Table of Contents

1. [Backend Configuration](#backend-configuration)
2. [Frontend Configuration](#frontend-configuration)
3. [Database Configuration](#database-configuration)
4. [Gupshup Integration](#gupshup-integration)
5. [Nginx Configuration](#nginx-configuration)
6. [SSL/TLS Setup](#ssltls-setup)
7. [Environment Variables](#environment-variables)
8. [Security Configuration](#security-configuration)

---

## Backend Configuration

### Node.js Environment

#### Development (.env)

```env
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/waba-bsp
DB_NAME=waba-bsp

# JWT
JWT_SECRET=your-super-secret-key-here-min-32-chars
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=refresh-secret-key-here-min-32-chars

# Gupshup
GUPSHUP_API_KEY=your_gupshup_api_key
GUPSHUP_API_BASE_URL=https://api.gupshup.io/sm/api/v1
GUPSHUP_WEBHOOK_TOKEN=your_webhook_verification_token

# CORS
CORS_ORIGIN=http://localhost:3000

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@waba-bsp.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session
SESSION_SECRET=session-secret-key-here
COOKIE_MAX_AGE=604800000

# Analytics
ANALYTICS_RETENTION_DAYS=90

# Logging
LOG_LEVEL=debug
LOG_DIR=./logs
```

#### Production (.env.production)

```env
# Server
NODE_ENV=production
PORT=5000
API_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/waba-bsp?retryWrites=true&w=majority
DB_NAME=waba-bsp

# JWT
JWT_SECRET=your-production-super-secret-key-here-min-32-chars
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=production-refresh-secret-key-min-32-chars

# Gupshup
GUPSHUP_API_KEY=production_gupshup_api_key
GUPSHUP_API_BASE_URL=https://api.gupshup.io/sm/api/v1
GUPSHUP_WEBHOOK_TOKEN=production_webhook_verification_token

# CORS
CORS_ORIGIN=https://yourdomain.com

# Email (SendGrid recommended)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=/var/www/waba-bsp/uploads
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx

# Rate Limiting (stricter)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Session
SESSION_SECRET=production-session-secret-key-very-secure
COOKIE_MAX_AGE=604800000

# Analytics
ANALYTICS_RETENTION_DAYS=365

# Logging
LOG_LEVEL=info
LOG_DIR=/var/log/waba-bsp

# Optional: Sentry for error tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# SSL/TLS
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'waba-bsp-api',
      script: './server.js',
      cwd: './server',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '512M',
      watch: ['server'],
      ignore_watch: ['node_modules', 'logs'],
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true
    }
  ]
};
```

Start with PM2:

```bash
# Development
pm2 start ecosystem.config.js --env development

# Production
pm2 start ecosystem.config.js --env production

# Monitor
pm2 monit

# View logs
pm2 logs waba-bsp-api
```

---

## Frontend Configuration

### React Environment

#### Development (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
REACT_APP_LOG_LEVEL=debug
REACT_APP_MAX_FILE_SIZE=5242880
```

#### Production (.env.production)

```env
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_ENV=production
REACT_APP_LOG_LEVEL=info
REACT_APP_MAX_FILE_SIZE=5242880
```

### Tailwind CSS Configuration

Create `client/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#25D366',
        secondary: '#128C7E',
        dark: '#075E54',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
};
```

### PostCSS Configuration

Create `client/postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Build Configuration (Vite)

Create `client/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
});
```

---

## Database Configuration

### MongoDB Connection

#### Local Development

```javascript
// In server.js
mongoose.connect('mongodb://localhost:27017/waba-bsp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

#### MongoDB Atlas (Cloud)

```javascript
mongoose.connect(
  'mongodb+srv://username:password@cluster.mongodb.net/waba-bsp?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
```

### Database Indexes

Indexes are automatically created by Mongoose models. Key indexes:

```javascript
// User Model
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 })
db.users.createIndex({ createdAt: 1 })

// App Model
db.apps.createIndex({ userId: 1 })
db.apps.createIndex({ status: 1 })
db.apps.createIndex({ createdAt: -1 })

// Message Model
db.messages.createIndex({ appId: 1, createdAt: -1 })
db.messages.createIndex({ conversationId: 1 })
db.messages.createIndex({ messageId: 1 }, { unique: true })
db.messages.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }) // TTL

// Template Model
db.templates.createIndex({ appId: 1, status: 1 })
db.templates.createIndex({ gupshupTemplateId: 1 })

// Journey Model
db.journeys.createIndex({ appId: 1, status: 1 })
db.journeys.createIndex({ userId: 1 })
```

### Database Backup Strategy

#### Automated Backup Script

Create `server/scripts/backup-db.sh`:

```bash
#!/bin/bash

# MongoDB Backup Script
BACKUP_DIR="/var/backups/mongodb"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/waba-bsp_${TIMESTAMP}.dump"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mongodump \
  --uri="mongodb+srv://username:password@cluster.mongodb.net/waba-bsp" \
  --out=$BACKUP_FILE

# Compress
tar -czf "${BACKUP_FILE}.tar.gz" -C $BACKUP_DIR ${TIMESTAMP}

# Remove uncompressed backup
rm -rf $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.tar.gz"
```

#### Schedule with Cron

```bash
# Run backup daily at 2 AM
0 2 * * * /usr/local/bin/backup-db.sh

# Add to crontab
crontab -e
```

---

## Gupshup Integration

### API Key Setup

1. Sign up at [Gupshup](https://www.gupshup.io)
2. Create an app in your dashboard
3. Copy API key from settings
4. Add to `.env` as `GUPSHUP_API_KEY`

### Webhook Configuration

#### Set Webhook URL

1. Go to Gupshup Dashboard → App Settings
2. Set Webhook URL: `https://yourdomain.com/api/webhooks/message`
3. Copy Webhook Token
4. Add to `.env` as `GUPSHUP_WEBHOOK_TOKEN`

#### Webhook Verification

Gupshup sends requests with verification header:

```javascript
// In your webhook handler
const token = req.headers['x-gupshup-signature'];
const expectedToken = process.env.GUPSHUP_WEBHOOK_TOKEN;

if (token !== expectedToken) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### Message Templates

#### Template Submission Flow

1. Create template via API
2. Submit to Gupshup for approval
3. Wait for approval (24-48 hours)
4. Use in messages once approved

#### Template Variables

Use placeholders for variables:

```
Body: "Hi {{1}}, your order {{2}} is {{3}}"
Variables: ["userName", "orderId", "status"]
```

### Media Handling

#### Supported Formats

- **Images**: JPG, JPEG, PNG (max 5MB)
- **Videos**: MP4 (max 16MB)
- **Audio**: OGG, MP3, M4A (max 16MB)
- **Documents**: PDF, DOC, DOCX (max 100MB)

#### Upload Process

```javascript
// Upload media to Gupshup
const response = await gupshupService.uploadMedia(filePath, mediaType);
const mediaUrl = response.data.media.url;

// Use in message
await gupshupService.sendMediaMessage(phoneNumber, mediaUrl, mediaType);
```

---

## Nginx Configuration

### Basic Setup

Create `/etc/nginx/sites-available/waba-bsp`:

```nginx
upstream waba_api {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}

server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;
    gzip_min_length 1000;

    # Root directory for React static files
    root /var/www/waba-bsp/client/build;
    index index.html;

    # React Router fallback
    location / {
        try_files $uri /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://waba_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
}
```

Enable site:

```bash
ln -s /etc/nginx/sites-available/waba-bsp /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## SSL/TLS Setup

### Let's Encrypt with Certbot

#### Installation

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

#### Certificate Generation

```bash
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

#### Auto-Renewal

```bash
# Check renewal
sudo certbot renew --dry-run

# Enable auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Certificate Pinning (Optional)

For additional security in production:

```bash
# Generate pin
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem \
  -pubkey -noout | openssl pkey -pubin -outform der | \
  openssl dgst -sha256 -binary | base64
```

Add to Nginx:

```nginx
add_header Public-Key-Pins 'pin-sha256="[base64-pin]"; max-age=2592000; includeSubDomains';
```

---

## Environment Variables

### Development Variables

```bash
# .env (Development)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/waba-bsp
JWT_SECRET=dev-secret-key-min-32-chars
GUPSHUP_API_KEY=sandbox_key
CORS_ORIGIN=http://localhost:3000
```

### Production Variables

```bash
# .env.production (Production)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/waba-bsp
JWT_SECRET=prod-secret-key-very-secure-min-32-chars
GUPSHUP_API_KEY=production_key_here
CORS_ORIGIN=https://yourdomain.com
API_URL=https://yourdomain.com
```

### Variable Validation

```javascript
// Validate required env vars
const requiredVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'GUPSHUP_API_KEY',
  'CORS_ORIGIN'
];

requiredVars.forEach(variable => {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
});
```

---

## Security Configuration

### CORS Setup

```javascript
// In server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Helmet Security

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
}));
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

### JWT Configuration

```javascript
// JWT options
const jwtOptions = {
  algorithm: 'HS256',
  expiresIn: process.env.JWT_EXPIRY || '7d',
  issuer: 'waba-bsp',
  audience: 'waba-bsp-users',
};
```

### Password Hashing

```javascript
// bcryptjs configuration
const saltRounds = 12; // Higher for production

bcrypt.hash(password, saltRounds);
```

### Database Security

```javascript
// MongoDB connection security
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin', // Auth database
  ssl: true, // For MongoDB Atlas
  tlsAllowInvalidCertificates: false,
});
```

---

## Performance Optimization

### Caching Strategy

#### Redis Configuration

```env
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_secure_password
REDIS_DB=0
REDIS_TTL=3600
```

#### Implementation

```javascript
const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

// Cache middleware
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = `cache:${req.path}`;
    
    client.get(key, (err, data) => {
      if (data) {
        return res.json(JSON.parse(data));
      }
      
      res.sendResponse = res.json;
      res.json = (data) => {
        client.setex(key, duration, JSON.stringify(data));
        res.sendResponse(data);
      };
      next();
    });
  };
};
```

### Database Query Optimization

```javascript
// Use lean() for read-only queries
const templates = await Template.find({ status: 'APPROVED' })
  .lean()
  .limit(20);

// Use select() to exclude large fields
const users = await User.find()
  .select('-passwordHistory -loginHistory')
  .limit(100);

// Use pagination
const page = req.query.page || 1;
const limit = req.query.limit || 20;
const skip = (page - 1) * limit;

const data = await Model.find()
  .skip(skip)
  .limit(limit);
```

### Frontend Optimization

```javascript
// Code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));

// Lazy load components
<Suspense fallback={<LoadingSpinner />}>
  <DashboardPage />
</Suspense>
```

---

## Monitoring & Logging

### Logging Configuration

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'waba-bsp' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});
```

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# System resources
htop

# Nginx status
curl localhost:8080/nginx_status
```

---

## Troubleshooting Configuration

### Common Issues

1. **Port Already in Use**
   ```bash
   lsof -i :5000
   kill -9 <PID>
   ```

2. **Database Connection Failed**
   ```bash
   mongo --uri "mongodb://localhost:27017/waba-bsp"
   ```

3. **CORS Errors**
   - Check `CORS_ORIGIN` matches frontend URL
   - Verify Nginx proxy headers

4. **SSL Certificate Issues**
   ```bash
   certbot renew --force-renewal
   ```

---

**Last Updated**: January 2024
**Configuration Version**: 1.0
**Compatibility**: Node.js 18.x, MongoDB 5.x, Nginx 1.18+
