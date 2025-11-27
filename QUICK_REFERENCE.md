# WABA BSP Platform - Quick Reference Card

## 🚀 Quick Start (5 minutes)

### Option 1: Local Development
```bash
# Backend
cd server && npm install && cp .env.example .env && npm run dev

# Frontend (new terminal)
cd client && npm install && npm start
```

### Option 2: Production Deployment
```bash
# Follow DEPLOYMENT_GUIDE.md step-by-step
# ~3-4 hours on Ubuntu 20.04 LTS server
```

---

## 📚 Documentation Quick Links

| Need | Document | Time |
|------|----------|------|
| **Setup locally** | [QUICKSTART.md](./QUICKSTART.md) | 15 min |
| **Deploy production** | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | 3-4 hours |
| **API reference** | [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | lookup |
| **Test platform** | [TESTING_GUIDE.md](./TESTING_GUIDE.md) | varies |
| **Configure** | [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) | lookup |
| **Fix issues** | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | lookup |
| **Overview** | [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | 15 min |
| **All docs** | [DOCS_INDEX.md](./DOCS_INDEX.md) | reference |

---

## 🔑 Key Environment Variables

```env
# Backend (server/.env)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/waba-bsp
JWT_SECRET=your-secret-key-min-32-chars
GUPSHUP_API_KEY=your_api_key
CORS_ORIGIN=http://localhost:3000

# Frontend (client/.env)
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📱 Core APIs

### Authentication
```bash
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login & get token
GET    /api/auth/me            # Get current user
PUT    /api/auth/profile       # Update profile
```

### Apps (WABA Accounts)
```bash
POST   /api/apps               # Create app
GET    /api/apps               # List apps
GET    /api/apps/:appId        # Get app details
PUT    /api/apps/:appId        # Update app
DELETE /api/apps/:appId        # Delete app
```

### Messages
```bash
POST   /api/messages/apps/:appId/send        # Send message
GET    /api/messages/apps/:appId/messages    # Get messages
GET    /api/messages/apps/:appId/conversation/:phone  # Get conversation
```

### Templates
```bash
POST   /api/templates          # Create template
GET    /api/templates          # List templates
GET    /api/templates/:id      # Get template
PUT    /api/templates/:id      # Update template
DELETE /api/templates/:id      # Delete template
```

### Journeys (Bot Builder)
```bash
POST   /api/journeys           # Create journey
GET    /api/journeys           # List journeys
POST   /api/journeys/:id/publish  # Publish journey
GET    /api/journeys/:id/analytics  # Get analytics
```

---

## 🛠️ Common Commands

### Backend
```bash
cd server

npm install              # Install dependencies
npm run dev             # Run development server
npm test                # Run tests
npm run build           # Build for production
pm2 start ecosystem.config.js  # Run with PM2
```

### Frontend
```bash
cd client

npm install             # Install dependencies
npm start               # Development server
npm test                # Run tests
npm run build           # Production build
```

### Database
```bash
# Local MongoDB
mongod                  # Start MongoDB
mongosh                 # Connect to database

# MongoDB Atlas
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/db"
```

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to strong key
- [ ] Set CORS_ORIGIN to your domain
- [ ] Configure HTTPS/SSL certificate
- [ ] Setup firewall rules
- [ ] Enable rate limiting
- [ ] Use strong passwords
- [ ] Enable 2FA (framework ready)
- [ ] Backup database regularly
- [ ] Monitor error logs
- [ ] Keep dependencies updated

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| **Port in use** | `lsof -i :5000` then `kill -9 PID` |
| **MongoDB fail** | `sudo systemctl start mongod` |
| **Nginx 502** | `pm2 list` to check backend status |
| **SSL errors** | `sudo certbot renew --force-renewal` |
| **Auth fails** | Check JWT_SECRET in .env |
| **API not responding** | Check `pm2 logs` for errors |

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more.

---

## 📊 Tech Stack

**Backend**: Node.js 18, Express.js, MongoDB, JWT  
**Frontend**: React 18, React Router, Zustand, Tailwind CSS  
**Deployment**: Ubuntu 20.04, Nginx, Let's Encrypt, PM2  
**Integration**: Gupshup API, Meta WABA APIs

---

## 🎯 Development Workflow

1. **Setup**
   ```bash
   npm install
   cp .env.example .env
   # Update .env with your values
   ```

2. **Develop**
   ```bash
   npm run dev
   # Make changes, browser auto-reloads
   ```

3. **Test**
   ```bash
   npm test
   # Or use Postman/curl for API testing
   ```

4. **Deploy**
   ```bash
   # Follow DEPLOYMENT_GUIDE.md
   ```

---

## 📈 Project Stats

- **Total Files**: 52
- **Code Files**: 40 (5,172 lines)
- **Documentation**: 9 (5,050 lines)
- **API Endpoints**: 40+
- **Database Models**: 6
- **Pages**: 10
- **Controllers**: 5
- **Routes**: 8

---

## 💡 Tips & Tricks

### Development
- Use REST Client extension in VSCode for API testing
- Enable debug logs: `DEBUG=* npm run dev`
- Use PM2 in development: `pm2 start server.js --watch`

### Production
- Use MongoDB Atlas for cloud database
- Enable backups: cron job for `mongodump`
- Monitor with: `pm2 monit`
- View logs: `pm2 logs waba-bsp-api`

### Performance
- Add Redis for caching (framework ready)
- Enable Gzip compression (Nginx configured)
- Use CDN for static assets
- Enable query indexing (all configured)

---

## 🔗 Important URLs (Local)

```
Backend:  http://localhost:5000
Frontend: http://localhost:3000
API:      http://localhost:5000/api
Health:   http://localhost:5000/api/health
```

---

## 📞 Support

**Documentation**: See file corresponding to your issue
**Logs**: `pm2 logs` or `tail -f /var/log/waba-bsp/*`
**Debug**: `DEBUG=* npm run dev`

---

## 🎉 You're Ready!

Pick your path:
- **Starting now?** → Run `npm install && npm run dev`
- **Deploying?** → Open DEPLOYMENT_GUIDE.md
- **Building APIs?** → Check API_DOCUMENTATION.md
- **In trouble?** → See TROUBLESHOOTING.md

**Happy Coding! 🚀**

---

**Last Updated**: January 2024
**Version**: 1.0
**Status**: Production Ready ✅
