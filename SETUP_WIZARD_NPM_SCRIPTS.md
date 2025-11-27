# Setup Wizard - npm Scripts Configuration

Add these scripts to your `package.json` files for easy wizard access.

## For Root package.json

Add these scripts to help users set up the project:

```json
{
  "scripts": {
    "setup": "npm run setup:backend && npm run setup:frontend",
    "setup:wizard": "bash setup-wizard-start.sh",
    "setup:wizard:windows": "setup-wizard-start.bat",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd server && npm run dev",
    "dev:frontend": "cd client && npm start",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd server && npm run build",
    "build:frontend": "cd client && npm run build",
    "start": "npm run start:backend",
    "start:backend": "cd server && npm start",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd server && npm test",
    "test:frontend": "cd client && npm test",
    "clean": "rm -rf server/node_modules client/node_modules",
    "reinstall": "npm run clean && npm install && npm run setup:backend && npm run setup:frontend"
  }
}
```

## For server/package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'Building backend...'",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

## For client/package.json

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "dev": "react-scripts start",
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage",
    "eject": "react-scripts eject"
  }
}
```

---

## Usage Examples

### First-Time Setup

#### Linux/macOS
```bash
# Open setup wizard (full screen, interactive)
npm run setup:wizard

# OR manual
bash setup-wizard-start.sh
```

#### Windows
```bash
# Open setup wizard (full screen, interactive)
npm run setup:wizard:windows

# OR manual
setup-wizard-start.bat
```

#### Any OS
```bash
# Open HTML directly
open setup-wizard.html
# Then manually place .env files
```

### Development

```bash
# Start both backend and frontend
npm run dev

# OR start them separately
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2
```

### Production Build

```bash
# Build both
npm run build

# Start production
npm run start
```

### Testing

```bash
# Test everything
npm test

# Test backend only
npm run test:backend

# Test frontend only
npm run test:frontend

# With coverage
npm run test:coverage
```

### Maintenance

```bash
# Clean and reinstall everything
npm run reinstall

# Just clean
npm run clean
```

---

## Complete Root package.json Example

```json
{
  "name": "waba-bsp",
  "version": "1.0.0",
  "description": "WABA BSP Platform - WhatsApp Business Service Provider",
  "main": "server/server.js",
  "author": "Your Name",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "setup": "npm run setup:backend && npm run setup:frontend",
    "setup:wizard": "bash setup-wizard-start.sh",
    "setup:wizard:windows": "setup-wizard-start.bat",
    "setup:backend": "cd server && npm install",
    "setup:frontend": "cd client && npm install",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd server && npm run dev",
    "dev:frontend": "cd client && npm start",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd server && npm run build",
    "build:frontend": "cd client && npm run build",
    "start": "npm run start:backend",
    "start:backend": "cd server && npm start",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd server && npm test",
    "test:frontend": "cd client && npm test",
    "lint": "npm run lint:backend && npm run lint:frontend",
    "lint:backend": "cd server && npm run lint",
    "lint:frontend": "cd client && npm run lint",
    "clean": "rm -rf server/node_modules client/node_modules",
    "reinstall": "npm run clean && npm install && npm run setup"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

---

## Quick Start with npm Scripts

### For First-Time Users

```bash
# 1. Clone/download project
git clone <project-url>
cd waba-bsp

# 2. Run setup wizard
npm run setup:wizard           # Linux/macOS
npm run setup:wizard:windows   # Windows

# 3. Complete the wizard in browser
# → Automatically creates server/.env and client/.env

# 4. Start the application
npm run dev

# 5. Open in browser
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

### For Developers

```bash
# 1. Install dependencies
npm install
npm run setup

# 2. Configure with wizard OR manually edit .env files
npm run setup:wizard

# 3. Start development
npm run dev

# 4. In another terminal, run tests
npm run test

# 5. Build for production
npm run build
```

### For Deployment

```bash
# 1. Build the application
npm run build

# 2. Set up production environment
# → Use setup wizard with "production" environment
# → OR manually configure .env for production

# 3. Start the server
npm run start

# 4. Keep running with PM2
pm2 start npm --name "waba-bsp" -- start
```

---

## Environment-Specific Setup

### Development Setup
```bash
npm run setup:wizard
# Select: Development environment
# Database: Local MongoDB
# Port: 5000
# Frontend: http://localhost:3000
npm run dev
```

### Staging Setup
```bash
npm run setup:wizard
# Select: Staging environment
# Database: MongoDB Atlas
# Port: 5000
# Frontend: https://staging.yourdomain.com
npm run build
npm run start
```

### Production Setup
```bash
npm run setup:wizard
# Select: Production environment
# Database: MongoDB Atlas
# Port: 5000
# Frontend: https://yourdomain.com
# Email: Configure with SMTP
npm run build
pm2 start npm --name "waba-bsp" -- start
```

---

## Troubleshooting npm Scripts

### Script not found
```bash
# Make sure you're in project root
cd /path/to/waba-bsp
npm run <script>
```

### npm install fails
```bash
# Clear cache and retry
npm cache clean --force
npm install
```

### concurrently not found
```bash
# Install dev dependencies
npm install --save-dev concurrently
```

### Script permissions denied (Linux/macOS)
```bash
# Make scripts executable
chmod +x setup-wizard-start.sh
npm run setup:wizard
```

### Port already in use
```bash
# Kill existing process or change port in .env
# Then restart
npm run dev
```

---

## Tips

1. **Always run setup wizard first** - Ensures proper configuration
2. **Use `npm run dev` for development** - Includes auto-reload
3. **Use `npm run start` for production** - Optimized build
4. **Keep .env in .gitignore** - Security best practice
5. **Use `npm run reinstall` if things break** - Clean slate

---

## Documentation

- **Setup Guide**: SETUP_WIZARD_GUIDE.md
- **Integration Guide**: SETUP_WIZARD_INTEGRATION.md
- **Configuration**: CONFIGURATION_GUIDE.md
- **Troubleshooting**: TROUBLESHOOTING.md

---

**Last Updated**: November 2024  
**Version**: 1.0
