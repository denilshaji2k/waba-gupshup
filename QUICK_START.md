# WABA BSP Installation - Quick Reference Card

## 🚀 Fastest Installation (One Command)

```bash
cd /path/to/WABA-GUPSHUP
bash install.sh development
```

**That's it!** The script will:
- ✅ Auto-detect and install missing dependencies
- ✅ Create environment configuration
- ✅ Install all npm packages
- ✅ Display next steps

---

## 📋 Installation Methods

### Method 1: Fully Automated (Recommended)
```bash
bash install.sh development      # Development environment
bash install.sh production       # Production environment
bash install.sh staging          # Staging environment
```

**Time:** 5-15 minutes (depending on internet speed)
**Requirements:** Internet, bash shell

### Method 2: Web Wizard GUI
```bash
bash setup-wizard-start.sh       # macOS/Linux
# OR
setup-wizard-start.bat           # Windows
```

**Time:** 10-20 minutes
**Requirements:** Web browser

### Method 3: Manual Setup
See [INSTALLATION_COMPLETE.md](./INSTALLATION_COMPLETE.md) "Method 3: Manual Installation"

**Time:** 20-30 minutes
**Best For:** Learning or customization

---

## ✅ Supported Environments

| OS | Installer Support | Notes |
|---|---|---|
| **macOS 10.15+** | ✅ Full Auto | Uses Homebrew |
| **Ubuntu 18.04+** | ✅ Full Auto | Uses apt-get |
| **Debian 10+** | ✅ Full Auto | Uses apt-get |
| **CentOS 7+** | ✅ Full Auto | Uses yum |
| **RHEL 7+** | ✅ Full Auto | Uses yum |
| **Windows + WSL2** | ✅ Full Auto | Run in WSL terminal |
| **Windows (native)** | ⚠️ Manual | See manual setup |

---

## 🔧 What Gets Installed Automatically

### Tools
- Node.js 18.x
- npm (latest)
- Git
- MongoDB (development only)

### Project Dependencies
- Backend: Express, MongoDB driver, authentication, etc.
- Frontend: React, API client, UI components, etc.

### Configuration Files
- `server/.env` - Backend configuration
- `client/.env` - Frontend configuration
- `uploads/` directory - File storage
- Database indexes and collections

---

## 🎯 Auto-Installation Features

### Dependency Detection
- Checks for Node.js, npm, Git, MongoDB
- Only installs what's missing
- Uses OS-appropriate package managers

### Validation
- Verifies project structure
- Checks package.json files
- Validates successful installations
- Retry logic (3 attempts) for npm install

### Error Handling
- Clear error messages
- Helpful guidance for failures
- Backup old .env files with timestamps
- Safe cleanup of old installations (optional)

### Configuration Automation
- Interactive prompts (only for critical values)
- Auto-generated secrets (JWT, session tokens)
- Smart defaults by environment
- Optional advanced settings

---

## 📊 Installation Flow

```
START
  ↓
Check Prerequisites
  ├─ Node.js installed? → NO → Install Node.js
  ├─ npm installed? → NO → Install npm
  ├─ Git installed? → NO → Install Git
  └─ MongoDB? (dev only) → NO → Install MongoDB
  ↓
Collect Configuration
  ├─ Database URI
  ├─ API Keys (Gupshup)
  ├─ Secrets (JWT, Session)
  └─ CORS settings
  ↓
Setup Backend
  ├─ Create server/.env
  ├─ npm install
  └─ Verify installation
  ↓
Setup Frontend
  ├─ Create client/.env
  ├─ npm install
  └─ Verify installation
  ↓
Show Summary
  ├─ Configuration review
  ├─ Next steps
  └─ Troubleshooting links
  ↓
COMPLETE ✓
```

---

## 🚀 After Installation

### Start Development Environment

```bash
# Terminal 1: Start Database
mongod

# Terminal 2: Start Backend
cd server
npm run dev

# Terminal 3: Start Frontend
cd client
npm start
```

### Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Database:** localhost:27017

### Next Steps
1. Configure Gupshup webhook
2. Create admin user account
3. Set up WhatsApp business account
4. Test message flows
5. Deploy to production

---

## ⚠️ Common Issues & Fixes

### Node.js Installation Failed
```bash
# macOS: Update Homebrew
brew update
brew install node@18

# Ubuntu: Try manual installation
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### npm Install Hangs
```bash
npm cache clean --force
npm install --legacy-peer-deps --force
```

### MongoDB Connection Error
```bash
# Start MongoDB
mongod  # macOS/Linux
# or
sudo systemctl start mongod  # Ubuntu/Debian/CentOS
```

### Port Already in Use
```bash
# Edit server/.env and change PORT
nano server/.env
# Change: PORT=5001 (or 5002, etc.)
```

### CORS Errors
```bash
# Ensure .env files have correct URLs
# server/.env: CORS_ORIGIN=http://localhost:3000
# client/.env: REACT_APP_API_BASE_URL=http://localhost:5000/api
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `INSTALLATION_COMPLETE.md` | Complete installation guide |
| `SETUP_WIZARD_GUIDE.md` | Web wizard instructions |
| `SETUP_WIZARD_INTEGRATION.md` | Backend integration |
| `SETUP_WIZARD_SUMMARY.md` | Feature overview |
| `SETUP_WIZARD_QUICK_REFERENCE.md` | Wizard quick reference |
| `SETUP_WIZARD_NPM_SCRIPTS.md` | npm script documentation |
| `README_SETUP_WIZARD.md` | Master setup wizard guide |
| `TROUBLESHOOTING.md` | Problem solving guide |

---

## 🎓 Installation Comparison

| Aspect | Automated | Web Wizard | Manual |
|--------|-----------|-----------|--------|
| Speed | ⚡ 5-10 min | 🐢 10-20 min | 🐌 20-30 min |
| Ease | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Control | Low | Medium | High |
| Errors | Auto-fixed | Guided | Manual |
| Learning | Low | Medium | High |
| Best For | Production | Non-technical | Learning |

---

## 💡 Pro Tips

1. **Use Development Mode for Testing**
   ```bash
   bash install.sh development
   ```

2. **Keep Backups of Custom .env**
   ```bash
   cp server/.env server/.env.custom
   cp client/.env client/.env.custom
   ```

3. **Run Tests After Installation**
   ```bash
   cd server && npm test
   cd client && npm test
   ```

4. **Check Environment Before Starting**
   ```bash
   npm run validate-env
   ```

5. **View Installation Logs**
   ```bash
   cat install.log  # If available
   ```

---

## 🆘 Need Help?

1. **Check Troubleshooting Guide**
   - [INSTALLATION_COMPLETE.md](./INSTALLATION_COMPLETE.md) - Troubleshooting section

2. **Review Error Messages**
   - Scripts provide detailed error context
   - Copy error message for research

3. **Consult Setup Wizard Guide**
   - [SETUP_WIZARD_GUIDE.md](./SETUP_WIZARD_GUIDE.md)

4. **Check Project README**
   - README.md in project root

5. **Verify Configuration**
   - Check `server/.env` values
   - Check `client/.env` values
   - Ensure credentials are correct

---

## 📝 Version Information

- **Node.js:** 18.x LTS
- **npm:** Latest (auto-upgraded)
- **MongoDB:** Latest Community Edition
- **React:** Latest stable
- **Express:** Latest stable

---

## ✨ You're All Set!

Your WABA BSP Platform is ready for development. Start with:

```bash
bash install.sh development
```

Then follow the printed next steps. Happy coding! 🎉

---

**Last Updated:** 2024
**Installation Methods:** 3 (Automated, Web Wizard, Manual)
**Supported Platforms:** 6 (macOS, Ubuntu, Debian, CentOS, RHEL, Windows/WSL)
