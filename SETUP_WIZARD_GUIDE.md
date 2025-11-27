# WABA BSP Setup Wizard

A beautiful, interactive web-based installer for the WABA BSP platform that makes initial configuration easy for both developers and clients.

## Features

✅ **Step-by-Step Wizard** - 8 interactive steps covering all configuration needs
✅ **Visual Progress Tracking** - Progress bar shows setup completion
✅ **Auto-Generated Secrets** - One-click secret generation for JWT, session, and webhook tokens
✅ **Smart Defaults** - Pre-filled values that adjust based on environment selection
✅ **Real-Time Validation** - Input validation prevents configuration errors
✅ **Download Configuration** - Export .env files directly from the wizard
✅ **Beautiful UI** - Modern, responsive design that works on desktop and mobile
✅ **Environment-Aware** - Different configurations for development, staging, and production

## Getting Started

### Quick Start

1. **Open the wizard in your browser:**
   ```bash
   # Simply open the file in your browser
   setup-wizard.html
   
   # Or serve it with a local server
   python -m http.server 8000
   # Then visit http://localhost:8000/setup-wizard.html
   ```

2. **Complete the 8 setup steps:**
   - Step 1: Select Environment (Development/Staging/Production)
   - Step 2: Configure Database (Local MongoDB or MongoDB Atlas)
   - Step 3: Server Settings (Port, Frontend URL, API URL)
   - Step 4: Security Secrets (Auto-generate JWT, Session, Webhook tokens)
   - Step 5: Gupshup Integration (API Key, App ID, Webhook URL)
   - Step 6: Email Configuration (Optional SMTP setup)
   - Step 7: Advanced Settings (Rate limiting, File size, Analytics)
   - Step 8: Review & Confirm

3. **Download .env files:**
   - At the end, download `server.env` and `client.env`
   - Rename them to `.env` and place in their respective directories

4. **Start the application:**
   ```bash
   npm run dev
   ```

## Setup Wizard Steps Explained

### Step 1: Environment Selection
Choose your deployment environment:
- **Development**: For local testing with auto-reload
- **Staging**: For testing on a remote server before production
- **Production**: For live deployment with optimized settings

### Step 2: Database Configuration
Two options:
1. **Local MongoDB**: For development on your machine
   - Host: localhost (default)
   - Port: 27017 (default)
   - Database: waba-bsp (default)

2. **MongoDB Atlas**: For cloud-hosted database
   - Get connection string from MongoDB Atlas dashboard
   - Supports authentication and network security

### Step 3: Server Configuration
- **Port**: Where your API server runs (default: 5000)
- **Frontend URL**: URL of your React app (for CORS)
- **API URL**: Base URL for API requests

Values auto-populate based on environment:
- Development: `http://localhost:*`
- Production: `https://your-domain.com`

### Step 4: Security Secrets
Generate secure random tokens for:
- **JWT Secret**: Signs authentication tokens
- **Refresh Token Secret**: Signs refresh tokens
- **Session Secret**: Encrypts session data
- **Webhook Token**: Validates incoming webhooks

Click "Generate New Secret" or "Generate All Secrets" for random values.

### Step 5: Gupshup Integration
Configure WhatsApp messaging:
- **API Key**: From Gupshup Dashboard → API Settings
- **App ID**: From Gupshup Dashboard → App Configuration
- **Webhook URL**: Where Gupshup sends messages (must be HTTPS)

### Step 6: Email Configuration (Optional)
Enable email notifications:
- **SMTP Host**: smtp.gmail.com (for Gmail)
- **SMTP Port**: 587 (TLS)
- **User**: Your email address
- **Password**: App-specific password (not your regular password)
- **Sender Email**: Email display address

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Create App Password in Google Account settings
3. Use that password here (not your regular password)

### Step 7: Advanced Configuration
Fine-tune platform behavior:
- **Rate Limit Window**: Time window in milliseconds (900000 = 15 min)
- **Rate Limit Max**: Max requests per window
- **Max File Size**: Maximum upload size in bytes (5242880 = 5MB)
- **Analytics Retention**: How long to keep data (days)
- **Enable Analytics**: Toggle analytics tracking

### Step 8: Review & Confirm
Review your complete configuration:
- Shows key settings
- Database connection preview
- Gupshup API key preview
- Email status
- Confirms everything before setup

## Configuration File Format

### Backend (.env) - Goes in `server/` directory

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# JWT
JWT_SECRET=your-generated-secret
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=your-refresh-secret

# Gupshup
GUPSHUP_API_KEY=your-api-key
GUPSHUP_APP_ID=your-app-id
GUPSHUP_API_BASE_URL=https://api.gupshup.io/wa

# Webhook
WEBHOOK_TOKEN=your-webhook-token
WEBHOOK_URL=https://your-domain.com/api/webhooks/gupshup

# CORS
CORS_ORIGIN=https://your-domain.com

# Session
SESSION_SECRET=your-session-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Analytics
ANALYTICS_RETENTION_DAYS=90
ENABLE_ANALYTICS=true

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SENDER_EMAIL=noreply@your-domain.com
```

### Frontend (.env) - Goes in `client/` directory

```env
# Environment Configuration
REACT_APP_ENV=production
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_LOG_LEVEL=info
```

## Environment Variable Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | Database connection | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing key | Random 32 chars |
| `GUPSHUP_API_KEY` | WhatsApp API key | From Gupshup |
| `WEBHOOK_URL` | Webhook endpoint | `https://domain.com/...` |
| `CORS_ORIGIN` | Frontend domain | `https://domain.com` |
| `REACT_APP_API_URL` | Backend API URL | `https://domain.com/api` |

## Installation for Different Environments

### Local Development
1. Select **Development** environment
2. Choose **Local MongoDB**
3. Use default ports: 5000 (backend), 3000 (frontend)
4. Frontend URL: `http://localhost:3000`
5. Generate all secrets

### Staging Server
1. Select **Staging** environment
2. Choose **MongoDB Atlas**
3. Enter MongoDB Atlas connection string
4. Backend port: 5000
5. Frontend URL: `https://staging.your-domain.com`
6. Use production-level secrets

### Production Server
1. Select **Production** environment
2. Choose **MongoDB Atlas**
3. Enter MongoDB Atlas connection string
4. Backend port: 5000
5. Frontend URL: `https://your-domain.com`
6. Enable email notifications
7. Configure SMTP for alerts
8. Use strong secrets

## Troubleshooting

### Secrets Not Generating
- Check browser console (F12) for errors
- Try a different browser
- Refresh the page and try again

### MongoDB Connection Issues
- **Local MongoDB**: Ensure MongoDB is running (`mongod`)
- **MongoDB Atlas**: Check IP whitelist includes your server
- Verify username and password in connection string

### Port Already in Use
- Change PORT value in wizard
- Or kill existing process using the port
- Make sure frontend and backend use different ports

### CORS Errors
- Ensure CORS_ORIGIN exactly matches frontend URL
- Include protocol (http:// or https://)
- No trailing slashes

### Gupshup Not Receiving Messages
- Verify WEBHOOK_URL is publicly accessible (HTTPS)
- Confirm WEBHOOK_TOKEN in Gupshup dashboard matches
- Check backend logs for webhook errors

## Advanced Features

### Generate Multiple Environments
Run the wizard multiple times for different environments:
1. Development: `http://localhost:3000`
2. Staging: `https://staging.domain.com`
3. Production: `https://domain.com`

Each generates separate .env files with appropriate settings.

### Manual Adjustments
After downloading .env files, you can:
- Add additional environment variables
- Modify rate limit settings
- Change retention periods
- Update SMTP configuration

### Version Control
**IMPORTANT:** Add `.env` to `.gitignore` to prevent secrets from being committed:
```
.env
.env.*.local
```

The provided `.gitignore` already includes this.

## Support

### Common Issues

**Q: Where do I put the downloaded .env files?**
A: 
- `server.env` → rename to `.env` and place in `server/` directory
- `client.env` → rename to `.env` and place in `client/` directory

**Q: How do I get Gupshup API Key?**
A: Create account at gupshup.io → Dashboard → API Settings

**Q: Can I use Gmail for SMTP?**
A: Yes, but use App Password, not your regular password. Enable 2FA first.

**Q: How do I regenerate secrets?**
A: Just run the wizard again with the same inputs and generate new secrets.

**Q: Can I modify values after setup?**
A: Yes, edit the .env files directly and restart the application.

### Getting Help

1. Check [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) for detailed environment variable documentation
2. Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
3. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for server setup
4. See [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) for advanced options

## Tips & Best Practices

1. **Generate Strong Secrets**: Click "Generate All Secrets" for cryptographically secure values
2. **Use MongoDB Atlas**: Better than local MongoDB for production
3. **Enable Email**: Important for user notifications and alerts
4. **Document Settings**: Keep a copy of your configuration settings
5. **Regular Backups**: Backup your .env files in a secure location
6. **Never Share**: Never commit .env files or share them via email
7. **Rotate Secrets**: Change JWT_SECRET every 90 days in production

## Files Included

- `setup-wizard.html` - The complete installer (this file)
- `ENV_SETUP_GUIDE.md` - Detailed documentation
- `CONFIGURATION_GUIDE.md` - Advanced configuration options
- `DEPLOYMENT_GUIDE.md` - Server deployment instructions

## Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Mobile browsers

## License

Part of WABA BSP Platform © 2024

---

**Ready to get started?** Open `setup-wizard.html` in your browser and follow the steps!
