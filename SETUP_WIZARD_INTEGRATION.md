# Setup Wizard Integration Guide

This guide explains how to integrate the Setup Wizard into your application for automatic .env file generation.

## Components

### 1. `setup-wizard.html`
- **Purpose**: Interactive web-based installer
- **Type**: Standalone HTML file
- **Usage**: Open in browser, fill out form, download .env files
- **No dependencies**: Pure HTML + CSS + JavaScript

### 2. `setup-wizard-handler.js`
- **Purpose**: Backend API for processing wizard configuration
- **Type**: Node.js/Express module
- **Usage**: Add to your Express server to auto-create .env files
- **Dependencies**: Express, fs, path (built-in)

## Option 1: Standalone Mode (No Backend Integration)

Users manually download and configure .env files.

### Steps
1. Open `setup-wizard.html` in browser
2. Fill out all configuration fields
3. Download `server.env` and `client.env`
4. Rename to `.env` and place in correct directories
5. Restart application

### Advantages
- No backend changes needed
- Works offline
- User has full control
- Immediate feedback

### Disadvantages
- Manual file placement needed
- No validation with actual environment
- Extra step for users

## Option 2: With Backend Integration (Recommended)

Wizard automatically creates .env files on your server.

### Integration Steps

#### 1. Add Handler to Your Express Server

**In `server/server.js` or similar:**

```javascript
const express = require('express');
const path = require('path');
const { createSetupRouter } = require('./setup-wizard-handler');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Setup Wizard API endpoints
app.use('/api', createSetupRouter());

// Your other routes...
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/apps', require('./routes/appRoutes'));
// ... rest of routes

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

#### 2. Serve the Setup Wizard

Add route to serve the HTML:

```javascript
// Serve setup wizard
app.get('/setup', (req, res) => {
    res.sendFile(path.join(__dirname, '../setup-wizard.html'));
});

// Redirect to setup if .env doesn't exist
app.use((req, res, next) => {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath) && req.path !== '/setup' && !req.path.startsWith('/api')) {
        return res.redirect('/setup');
    }
    next();
});
```

#### 3. Enable CORS for Setup

```javascript
const cors = require('cors');

// Only allow setup endpoints in specific conditions
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000'],
    credentials: true
}));
```

### Full Example Server Setup

```javascript
// server/server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { createSetupRouter } = require('./setup-wizard-handler');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(express.static(path.join(__dirname, '../')));

// Setup Wizard Routes
app.get('/setup', (req, res) => {
    res.sendFile(path.join(__dirname, '../setup-wizard.html'));
});

// Setup API endpoints
app.use('/api', createSetupRouter());

// Redirect to setup if .env doesn't exist
app.use((req, res, next) => {
    if (req.path === '/setup' || req.path.startsWith('/api')) {
        return next();
    }
    
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        return res.redirect('/setup');
    }
    
    next();
});

// Your API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/apps', require('./routes/appRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/journeys', require('./routes/journeyRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Setup wizard available at http://localhost:${PORT}/setup`);
});
```

## Using the Setup Wizard

### As User/Client

1. **First-time setup:**
   ```
   Visit: http://localhost:5000/setup
   ```

2. **Fill out the form:**
   - Select environment
   - Configure database
   - Set server port
   - Generate secrets
   - Enter Gupshup credentials
   - Configure email (optional)
   - Review and submit

3. **Application auto-configures:**
   - .env files created
   - Secrets generated
   - Ready to start

### As Developer

1. **Include in package.json:**
   ```json
   {
     "scripts": {
       "setup": "node setup-wizard-start.js",
       "dev": "npm run setup && nodemon server/server.js",
       "start": "node server/server.js"
     }
   }
   ```

2. **Create setup script:**
   ```bash
   # setup-wizard-start.js
   const open = require('open');
   const path = require('path');

   console.log('Opening Setup Wizard...');
   console.log('If browser doesn\'t open, visit: http://localhost:5000/setup');

   // Open setup page
   open('http://localhost:5000/setup');
   ```

3. **Run setup:**
   ```bash
   npm run setup
   ```

## API Endpoints

### POST /api/setup/validate
Validate configuration without saving.

**Request:**
```json
{
  "environment": "production",
  "database": { ... },
  "server": { ... }
}
```

**Response:**
```json
{
  "valid": true,
  "errors": []
}
```

### POST /api/setup/save
Save configuration and create .env files.

**Request:** Same as validate

**Response:**
```json
{
  "success": true,
  "message": "Environment files created successfully",
  "files": {
    "backend": "/path/to/server/.env",
    "frontend": "/path/to/client/.env"
  }
}
```

### POST /api/setup/preview
Preview .env files without saving.

**Request:** Same as validate

**Response:**
```json
{
  "success": true,
  "preview": {
    "backend": "# Auto-generated...",
    "frontend": "REACT_APP_ENV=..."
  }
}
```

## Security Considerations

### For Production Use

1. **Protect Setup Endpoint:**
   ```javascript
   const setupToken = process.env.SETUP_TOKEN;

   app.post('/api/setup/save', (req, res) => {
       const token = req.headers['x-setup-token'];
       if (token !== setupToken) {
           return res.status(403).json({ error: 'Unauthorized' });
       }
       // ... rest of logic
   });
   ```

2. **Disable After Setup:**
   ```javascript
   app.get('/setup', (req, res) => {
       if (fs.existsSync(path.join(__dirname, '.env'))) {
           return res.status(403).json({
               error: 'Setup already completed'
           });
       }
       res.sendFile(path.join(__dirname, '../setup-wizard.html'));
   });
   ```

3. **Log Setup Activities:**
   ```javascript
   const setupLog = [];
   
   app.post('/api/setup/save', (req, res) => {
       setupLog.push({
           timestamp: new Date(),
           environment: req.body.environment,
           ip: req.ip
       });
       // ... rest of logic
   });
   ```

4. **Require Authentication:**
   ```javascript
   const authMiddleware = require('./middleware/authMiddleware');
   
   app.post('/api/setup/save', authMiddleware, (req, res) => {
       if (req.user.role !== 'admin') {
           return res.status(403).json({ error: 'Unauthorized' });
       }
       // ... rest of logic
   });
   ```

## Troubleshooting

### Wizard Not Loading
- Check if `setup-wizard.html` is in project root
- Verify CORS is enabled
- Check browser console for errors

### .env Files Not Created
- Check server has write permissions to directories
- Verify `server/` and `client/` directories exist
- Check server logs for errors
- Ensure all required fields are filled

### Configuration Not Working
- Validate all fields were entered correctly
- Check .env file syntax (no spaces around `=`)
- Restart Node.js after creating .env
- Check NODE_ENV matches expected value

### Secrets Not Generated
- Try clicking "Generate All Secrets" again
- Clear browser cache
- Try different browser
- Check console for JavaScript errors

## Best Practices

1. **Use Standalone for Local Development:**
   - Quick and easy
   - No backend changes needed
   - Full user control

2. **Use Integrated for Production:**
   - Automated setup
   - Validation before saving
   - Audit trail of setup
   - Better user experience

3. **Backup .env Files:**
   - Wizard creates automatic backups with timestamps
   - Store backups securely
   - Never commit to Git

4. **Rotate Secrets Regularly:**
   - Generate new JWT secrets every 90 days
   - Update in .env and restart app
   - Use wizard to generate new secrets

5. **Document Your Setup:**
   - Keep notes of configuration decisions
   - Document any custom environment variables
   - Share setup guide with team

## Files Included

- `setup-wizard.html` - Complete wizard UI
- `setup-wizard-handler.js` - Backend API handler
- `SETUP_WIZARD_GUIDE.md` - User guide
- `setup-wizard-integration.md` - This file

## Next Steps

1. Choose integration option (standalone or integrated)
2. Copy files to your project
3. Test with development environment
4. Deploy to production
5. Share setup URL with clients

---

**Questions?** Check [SETUP_WIZARD_GUIDE.md](./SETUP_WIZARD_GUIDE.md) for user documentation.
