# Troubleshooting Guide - WABA BSP Platform

## Table of Contents

1. [Development Issues](#development-issues)
2. [Deployment Issues](#deployment-issues)
3. [Runtime Issues](#runtime-issues)
4. [Database Issues](#database-issues)
5. [API Integration Issues](#api-integration-issues)
6. [Frontend Issues](#frontend-issues)
7. [Security Issues](#security-issues)
8. [Performance Issues](#performance-issues)

---

## Development Issues

### Node.js Installation Issues

**Problem**: Node.js not found or wrong version

```bash
# Check version
node -v
npm -v

# Expected: v18.x or higher
```

**Solution**:
```bash
# Install NVM (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node -v  # Should be v18.x.x
```

---

### Port Already in Use

**Problem**: Port 5000 or 3000 already in use

**Solution - Windows**:
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port
set PORT=5001
npm run dev
```

**Solution - Linux/Mac**:
```bash
# Find process
lsof -i :5000

# Kill process (replace PID)
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

---

### MongoDB Connection Failed

**Problem**: Cannot connect to MongoDB

**Error Message**:
```
MongoServerError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**:

1. **Check if MongoDB is running**:
   ```bash
   # Windows
   net start MongoDB
   
   # Linux
   sudo systemctl status mongod
   sudo systemctl start mongod
   
   # Mac (with Homebrew)
   brew services start mongodb-community
   ```

2. **Check connection string**:
   ```bash
   # Verify .env file has correct MONGODB_URI
   MONGODB_URI=mongodb://localhost:27017/waba-bsp
   ```

3. **Test connection**:
   ```bash
   mongosh "mongodb://localhost:27017/waba-bsp"
   ```

4. **Reset database**:
   ```bash
   mongosh
   > use waba-bsp
   > db.dropDatabase()
   > exit
   ```

---

### Dependencies Installation Issues

**Problem**: npm install fails or missing dependencies

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still issues, update npm
npm install -g npm@latest

# Try again
npm install
```

---

### Environment Variables Not Loading

**Problem**: .env file not found or variables not working

**Solution**:
```bash
# 1. Check .env file exists
ls -la .env  # Linux/Mac
dir .env     # Windows

# 2. Copy from example if missing
cp .env.example .env

# 3. Restart Node.js
npm run dev

# 4. Verify in code
console.log(process.env.PORT);  // Should print 5000
```

---

## Deployment Issues

### Permission Denied Errors

**Problem**: Cannot access files or directories during deployment

**Solution**:
```bash
# Give permissions to app directory
sudo chown -R $USER:$USER /var/www/waba-bsp

# Make scripts executable
sudo chmod +x /var/www/waba-bsp/scripts/*.sh

# Give MongoDB access
sudo chown -R mongodb:mongodb /var/lib/mongodb
```

---

### MongoDB Connection on Server

**Problem**: Backend cannot connect to MongoDB on production

**Solution**:

1. **Check MongoDB is running**:
   ```bash
   sudo systemctl status mongod
   ```

2. **Check firewall allows MongoDB**:
   ```bash
   # Port 27017
   sudo ufw allow 27017/tcp
   ```

3. **Update connection string for remote DB**:
   ```env
   # For MongoDB Atlas
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/waba-bsp
   ```

4. **Test connection from server**:
   ```bash
   mongosh "mongodb://localhost:27017/waba-bsp"
   ```

---

### Nginx 502 Bad Gateway

**Problem**: Nginx returns 502 error

**Error**:
```
502 Bad Gateway
```

**Solution**:

1. **Check if backend is running**:
   ```bash
   pm2 list
   pm2 logs waba-bsp-api
   ```

2. **Check backend port**:
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Fix Nginx configuration**:
   ```bash
   # Check syntax
   sudo nginx -t
   
   # Restart if OK
   sudo systemctl restart nginx
   ```

4. **Update upstream in Nginx**:
   ```nginx
   upstream waba_api {
       server localhost:5000;  # Change port if different
   }
   ```

5. **Restart services**:
   ```bash
   pm2 restart waba-bsp-api
   sudo systemctl restart nginx
   ```

---

### SSL Certificate Issues

**Problem**: SSL certificate errors or expired

**Solution**:

1. **Check certificate status**:
   ```bash
   sudo certbot certificates
   ```

2. **Renew certificate**:
   ```bash
   sudo certbot renew
   
   # Force renewal
   sudo certbot renew --force-renewal
   ```

3. **Test auto-renewal**:
   ```bash
   sudo certbot renew --dry-run
   ```

4. **Check certificate dates**:
   ```bash
   openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout | grep -A2 Validity
   ```

---

### PM2 Process Not Starting

**Problem**: PM2 fails to start application

**Solution**:

1. **Check process status**:
   ```bash
   pm2 list
   pm2 logs waba-bsp-api
   ```

2. **Restart PM2**:
   ```bash
   pm2 restart waba-bsp-api
   ```

3. **Kill and restart**:
   ```bash
   pm2 kill
   pm2 start ecosystem.config.js --env production
   ```

4. **Check memory**:
   ```bash
   free -h
   pm2 monit
   ```

5. **Enable on startup**:
   ```bash
   pm2 startup
   pm2 save
   ```

---

## Runtime Issues

### Application Crashes

**Problem**: App crashes unexpectedly

**Solution**:

1. **Check logs**:
   ```bash
   pm2 logs waba-bsp-api
   tail -f /var/log/waba-bsp/combined.log
   ```

2. **Common causes**:
   - Database connection lost
   - Memory leak
   - Unhandled exception
   - Missing environment variable

3. **Fix by restarting**:
   ```bash
   pm2 restart waba-bsp-api
   ```

4. **Monitor for stability**:
   ```bash
   pm2 monit
   ```

---

### High Memory Usage

**Problem**: Application using too much memory

**Solution**:

1. **Check memory**:
   ```bash
   ps aux | grep node
   free -h
   ```

2. **Set memory limit in PM2**:
   ```javascript
   // ecosystem.config.js
   {
     max_memory_restart: '512M',  // Restart if > 512MB
   }
   ```

3. **Find memory leaks**:
   ```bash
   # Enable heap snapshots
   node --expose-gc app.js
   ```

4. **Restart periodically**:
   ```bash
   # Add to ecosystem.config.js
   {
     cron_restart: '0 0 * * *',  // Daily at midnight
   }
   ```

---

### Slow API Responses

**Problem**: API endpoints respond slowly

**Solution**:

1. **Check response times**:
   ```bash
   # Add timing to logs
   console.time('query');
   const data = await Model.find();
   console.timeEnd('query');
   ```

2. **Check database queries**:
   ```bash
   # Enable MongoDB profiling
   mongosh
   > db.setProfilingLevel(1)
   > db.system.profile.find().pretty()
   ```

3. **Optimize queries**:
   ```javascript
   // Use lean() for read-only
   const data = await Model.find().lean();
   
   // Use select() to limit fields
   const data = await Model.find().select('field1 field2');
   
   // Add indexes
   db.models.createIndex({ fieldName: 1 })
   ```

4. **Check server resources**:
   ```bash
   htop
   iostat
   ```

---

## Database Issues

### Database Connection Pool Exhausted

**Problem**: "Connection pool exhausted" error

**Solution**:

```javascript
// Increase pool size in connection options
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
});
```

---

### Duplicate Key Error

**Problem**: Cannot insert - duplicate key

**Error**:
```
E11000 duplicate key error collection: waba-bsp.users index: email_1 dup key
```

**Solution**:

1. **Check for duplicates**:
   ```bash
   mongosh
   > use waba-bsp
   > db.users.find({ email: "duplicate@example.com" })
   ```

2. **Remove duplicates**:
   ```bash
   > db.users.deleteOne({ email: "duplicate@example.com", _id: ObjectId("...") })
   ```

3. **Rebuild indexes**:
   ```bash
   > db.users.dropIndex("email_1")
   > db.users.createIndex({ email: 1 }, { unique: true })
   ```

---

### Database Corruption

**Problem**: Cannot query collections or data is corrupted

**Solution**:

1. **Backup first**:
   ```bash
   mongodump --uri="mongodb://localhost:27017/waba-bsp" --out=backup
   ```

2. **Repair database**:
   ```bash
   mongosh
   > db.repairDatabase()
   ```

3. **Or restore from backup**:
   ```bash
   mongorestore --drop backup/waba-bsp
   ```

---

## API Integration Issues

### Gupshup API Not Working

**Problem**: Messages not sending through Gupshup

**Solution**:

1. **Verify API key**:
   ```javascript
   const service = new GupshupService(apiKey, appId);
   // Check console.log in service for actual request
   ```

2. **Check API credentials**:
   ```env
   GUPSHUP_API_KEY=your_actual_key_here
   GUPSHUP_API_BASE_URL=https://api.gupshup.io/sm/api/v1
   ```

3. **Test with cURL**:
   ```bash
   curl -X POST https://api.gupshup.io/sm/api/v1/msg/send \
     -H "Authorization: Bearer YOUR_KEY" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "phone=919999999999&text=test&format=json"
   ```

4. **Check sandbox vs production**:
   - Sandbox: Can only send to test numbers
   - Production: Requires full setup

---

### Webhook Not Receiving Messages

**Problem**: Gupshup webhooks not hitting your endpoint

**Solution**:

1. **Verify webhook URL**:
   ```bash
   # Should be accessible from internet
   curl https://yourdomain.com/api/webhooks/message
   ```

2. **Check Gupshup dashboard**:
   - Webhook URL configured
   - Webhook verification token set
   - Enable webhooks

3. **Test webhook locally**:
   ```bash
   # Use ngrok for local testing
   ngrok http 5000
   # Copy ngrok URL to Gupshup dashboard
   ```

4. **Check logs**:
   ```bash
   tail -f logs/combined.log | grep webhook
   pm2 logs | grep webhook
   ```

5. **Verify token**:
   ```javascript
   // In webhookRoutes.js
   const token = req.headers['x-gupshup-signature'];
   console.log('Received token:', token);
   console.log('Expected token:', process.env.GUPSHUP_WEBHOOK_TOKEN);
   ```

---

### Template Approval Issues

**Problem**: Templates stuck in PENDING status

**Solution**:

1. **Check Gupshup dashboard** for rejection reason
2. **Common issues**:
   - Too many variables (>4)
   - Variables not matching placeholders
   - Inappropriate content
   - Typos or grammar issues

3. **Fix and resubmit**:
   ```bash
   # Delete old template
   DELETE /templates/{templateId}
   
   # Create corrected version
   POST /templates
   ```

---

## Frontend Issues

### Authentication Token Expired

**Problem**: "Token expired" error

**Solution**:

1. **Clear localStorage**:
   ```javascript
   localStorage.clear()
   // Refresh page
   ```

2. **Login again**:
   - Token is valid for 7 days
   - User will be redirected to login on expiry

3. **Implement refresh token** (optional):
   - Store refresh token in httpOnly cookie
   - Auto-refresh before expiry

---

### API Calls Not Working

**Problem**: Frontend cannot reach backend API

**Solution**:

1. **Check API URL**:
   ```env
   # In client/.env
   REACT_APP_API_URL=http://localhost:5000/api  # Development
   REACT_APP_API_URL=https://yourdomain.com/api # Production
   ```

2. **Check CORS headers**:
   ```bash
   # Backend should return CORS headers
   curl -I http://localhost:5000/api/health
   # Should show: Access-Control-Allow-Origin
   ```

3. **Update CORS in backend**:
   ```env
   CORS_ORIGIN=http://localhost:3000  # Development
   CORS_ORIGIN=https://yourdomain.com # Production
   ```

4. **Test API from frontend console**:
   ```javascript
   fetch('http://localhost:5000/api/health')
     .then(r => r.json())
     .then(data => console.log(data))
   ```

---

### Build Errors

**Problem**: React build fails

**Solution**:

1. **Check for syntax errors**:
   ```bash
   npm run build
   # Shows errors
   ```

2. **Clear cache**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check environment**:
   ```bash
   # Make sure .env is correct
   cat .env
   ```

---

## Security Issues

### Suspicious Activity

**Problem**: Detecting security issues

**Solution**:

1. **Check authentication logs**:
   ```bash
   grep "login" /var/log/waba-bsp/*.log
   ```

2. **Check rate limiting**:
   ```javascript
   // Should be active
   app.use(limiter);
   ```

3. **Review failed attempts**:
   ```bash
   grep "401\|403\|unauthorized" logs/*.log
   ```

---

### SSL Certificate Issues

**Problem**: Browser shows security warning

**Solution**:

1. **Check certificate**:
   ```bash
   openssl s_client -connect yourdomain.com:443
   ```

2. **Renew if expired**:
   ```bash
   sudo certbot renew --force-renewal
   ```

3. **Verify in browser**:
   - Click lock icon
   - Certificate should be valid

---

## Performance Issues

### Database Too Slow

**Problem**: Queries taking too long

**Solution**:

1. **Check indexes**:
   ```bash
   mongosh
   > use waba-bsp
   > db.messages.getIndexes()
   ```

2. **Add missing indexes**:
   ```bash
   > db.messages.createIndex({ appId: 1, createdAt: -1 })
   ```

3. **Check query performance**:
   ```bash
   > db.setProfilingLevel(1)
   > db.system.profile.find({ millis: { $gt: 100 } })
   ```

---

### API Rate Limiting Too Strict

**Problem**: Getting 429 Too Many Requests

**Solution**:

```bash
# Increase limits in .env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=1000   # Increase from 100

# Restart app
pm2 restart waba-bsp-api
```

---

### High CPU Usage

**Problem**: CPU constantly at 100%

**Solution**:

1. **Check processes**:
   ```bash
   top
   ps aux | grep node
   ```

2. **Find infinite loop**:
   ```bash
   # Check recent changes
   pm2 logs waba-bsp-api
   ```

3. **Restart and monitor**:
   ```bash
   pm2 restart waba-bsp-api
   pm2 monit
   ```

---

## General Debugging Steps

### Enable Debug Logging

```javascript
// In server.js
if (process.env.DEBUG) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

Run with:
```bash
DEBUG=* npm run dev
```

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Check token/credentials |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Check URL/resource |
| 429 | Too Many Requests | Wait or increase limit |
| 500 | Server Error | Check logs |
| 502 | Bad Gateway | Check backend/Nginx |
| 503 | Service Unavailable | Server is down |

---

## Emergency Recovery

### Quick Restart

```bash
# If everything is broken
pm2 kill
pm2 start ecosystem.config.js --env production
sudo systemctl restart nginx
```

### Rollback Changes

```bash
# If recent change broke things
git log --oneline
git revert <commit_hash>
npm install
npm start
```

### Emergency Reset

```bash
# Clear all data and restart (CAUTION!)
mongosh
> use waba-bsp
> db.dropDatabase()
> exit

# Restart app
pm2 restart waba-bsp-api
```

---

## Getting Help

1. **Check logs first**:
   ```bash
   pm2 logs
   tail -f /var/log/waba-bsp/*
   ```

2. **Review this guide** for similar issues

3. **Check documentation**:
   - DEPLOYMENT_GUIDE.md
   - API_DOCUMENTATION.md
   - CONFIGURATION_GUIDE.md

4. **Community resources**:
   - [Stack Overflow](https://stackoverflow.com)
   - [GitHub Issues](https://github.com)

---

**Last Updated**: January 2024  
**Troubleshooting Version**: 1.0  
**Most Common Issue**: MongoDB connection / Environment variables
