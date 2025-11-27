# Setup Wizard - Quick Reference Card

## 🚀 Getting Started (Choose One)

### Option A: Standalone (No Backend)
```bash
# Linux/macOS
bash setup-wizard-start.sh

# Windows
setup-wizard-start.bat

# Any OS
open setup-wizard.html
```

### Option B: Integrated (With Backend)
```javascript
// In server.js
const { createSetupRouter } = require('./setup-wizard-handler');
app.use('/api', createSetupRouter());
app.get('/setup', (req, res) => {
    res.sendFile('setup-wizard.html');
});
```

Then visit: `http://localhost:5000/setup`

---

## 📋 8-Step Wizard Overview

| Step | Purpose | Required Fields | Time |
|------|---------|-----------------|------|
| 1 | Environment | Select dev/staging/prod | 30s |
| 2 | Database | Local or MongoDB Atlas | 1-2m |
| 3 | Server | Port, URLs, API URL | 1m |
| 4 | Secrets | Auto-generated tokens | 30s |
| 5 | Gupshup | API key, App ID, Webhook | 2-3m |
| 6 | Email | SMTP settings (optional) | 1-2m |
| 7 | Advanced | Rate limits, file size | 1m |
| 8 | Review | Confirm all settings | 1m |

**Total Time: 8-15 minutes**

---

## 🔑 Key Configuration Values

### Environment Selection
```
Development  → Local testing (localhost:3000)
Staging      → Remote testing (staging.yourdomain.com)
Production   → Live deployment (yourdomain.com)
```

### Database Options
```
Local MongoDB:
  Host: localhost
  Port: 27017
  Database: waba-bsp

MongoDB Atlas:
  URI: mongodb+srv://user:pass@cluster.mongodb.net/db
```

### Server Configuration
```
Port: 5000 (or custom)
Frontend URL: http://localhost:3000 (dev) or https://yourdomain.com (prod)
API URL: http://localhost:5000/api (dev) or https://yourdomain.com/api (prod)
```

### Auto-Generated Secrets
```
JWT Secret:           32 random characters
Refresh Token Secret: 32 random characters
Session Secret:       32 random characters
Webhook Token:        32 random characters

→ Click "Generate All Secrets" for all at once
```

### Gupshup Integration
```
API Key:   Get from Gupshup Dashboard → API Settings
App ID:    Get from Gupshup Dashboard → App Configuration
Webhook:   https://yourdomain.com/api/webhooks/gupshup (must be HTTPS)
```

### Email Configuration (Optional)
```
SMTP Host:    smtp.gmail.com (for Gmail)
SMTP Port:    587 (TLS)
Email:        your-email@gmail.com
Password:     App-specific password (not regular password)
Sender Email: noreply@yourdomain.com
```

### Advanced Settings
```
Rate Limit Window:    900000 ms (15 minutes)
Rate Limit Max:       1000 requests
Max File Size:        5242880 bytes (5 MB)
Analytics Retention:  90 days
```

---

## 📥 What Gets Created

### Backend File: server/.env
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
GUPSHUP_API_KEY=...
... 15+ more variables
```

### Frontend File: client/.env
```env
REACT_APP_ENV=production
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_LOG_LEVEL=info
```

---

## ✅ Setup Checklist

### Before Starting
- [ ] Gupshup account created
- [ ] MongoDB Atlas account (if using cloud DB)
- [ ] Gmail account (if enabling email)
- [ ] Domain name registered (if production)
- [ ] SSL certificate ready (if production)

### During Setup
- [ ] Fill all required fields
- [ ] Generate secrets (auto-done)
- [ ] Review configuration before finishing
- [ ] Download .env files (standalone) or confirm (integrated)

### After Setup
- [ ] Place .env files in correct directories
- [ ] Verify database connection
- [ ] Test API endpoints
- [ ] Check .env is in .gitignore
- [ ] Start application: `npm run dev`

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Wizard won't load | Check if HTML file exists, try different browser |
| Port already in use | Change port in wizard or kill existing process |
| Database connection fails | Verify connection string, check IP whitelist |
| Secrets not generating | Clear browser cache, try again |
| CORS errors | Check CORS_ORIGIN matches frontend URL exactly |
| Gupshup not working | Verify API key and App ID are correct |

---

## 🔐 Security Tips

1. **Don't Commit .env to Git**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use Strong Secrets**
   - Click "Generate All Secrets"
   - Don't use simple passwords

3. **Use HTTPS in Production**
   - Webhook URL must be HTTPS
   - Set up SSL certificate

4. **Rotate Secrets Regularly**
   - Change JWT_SECRET every 90 days
   - Update Gupshup API key yearly

5. **Back Up Configuration**
   - Save .env files securely
   - Use backup script: included automatically

---

## 📚 Documentation Files

| File | Purpose | For Whom |
|------|---------|----------|
| SETUP_WIZARD_GUIDE.md | Step-by-step instructions | Users |
| SETUP_WIZARD_INTEGRATION.md | How to integrate | Developers |
| SETUP_WIZARD_SUMMARY.md | Complete overview | Everyone |
| ENV_SETUP_GUIDE.md | Environment variables | Reference |
| CONFIGURATION_GUIDE.md | Advanced settings | DevOps |

---

## 🎯 Common Scenarios

### Scenario 1: Local Development
```
Environment: Development
Database: Local MongoDB
Port: 5000
Frontend: http://localhost:3000
Email: Skip
→ Takes 5 minutes
```

### Scenario 2: Staging Server
```
Environment: Staging
Database: MongoDB Atlas
Port: 5000
Frontend: https://staging.yourdomain.com
Email: Configure
→ Takes 10 minutes
```

### Scenario 3: Production Server
```
Environment: Production
Database: MongoDB Atlas
Port: 5000
Frontend: https://yourdomain.com
Email: Configure with SMTP
→ Takes 15 minutes
```

### Scenario 4: Docker Deployment
```
Environment: Production
Database: MongoDB Atlas
Port: 5000
Frontend: https://yourdomain.com
Use env variables for secrets
→ Takes 15 minutes
```

---

## 💾 File Locations

```
Your Project/
├── setup-wizard.html           ← Start here
├── setup-wizard-handler.js     ← Backend (if integrated)
├── setup-wizard-start.sh       ← Linux/Mac launcher
├── setup-wizard-start.bat      ← Windows launcher
├── server/
│   ├── .env                    ← Auto-created
│   ├── .env.backup.2024-01-15  ← Auto-backed up
│   └── server.js
└── client/
    ├── .env                    ← Auto-created
    └── ...
```

---

## 🚨 Important Notes

1. **Copy the whole setup-wizard.html file** - It has CSS and JS inline
2. **Place in project root** - Not in subdirectories
3. **.env files are NOT committed to Git** - Add to .gitignore
4. **Secrets are generated locally** - Never sent anywhere
5. **Webhook URL must be HTTPS** - Not HTTP
6. **Backup your .env files** - Wizard does this automatically

---

## 🔗 Quick Links

- **Start Wizard**: `setup-wizard.html`
- **Backend Handler**: `setup-wizard-handler.js`
- **User Guide**: `SETUP_WIZARD_GUIDE.md`
- **Integration Guide**: `SETUP_WIZARD_INTEGRATION.md`
- **This Card**: `SETUP_WIZARD_QUICK_REFERENCE.md`

---

## 🎓 Learning Path

1. **New User**: Read SETUP_WIZARD_GUIDE.md
2. **Setup First Time**: Open setup-wizard.html
3. **Developer**: Read SETUP_WIZARD_INTEGRATION.md
4. **Advanced**: Check CONFIGURATION_GUIDE.md
5. **Troubleshooting**: See TROUBLESHOOTING.md

---

## 📞 Support Scenarios

**"I can't find where to put the .env files"**
→ Read: SETUP_WIZARD_GUIDE.md section "Installation"

**"My database won't connect"**
→ Read: ENV_SETUP_GUIDE.md section "Troubleshooting"

**"How do I integrate with my backend?"**
→ Read: SETUP_WIZARD_INTEGRATION.md

**"What is each environment variable for?"**
→ Read: ENV_SETUP_GUIDE.md section "Detailed Explanations"

---

**Version**: 1.0  
**Last Updated**: November 2024  
**Status**: Production Ready ✅

Ready to get started? Open `setup-wizard.html` in your browser!
