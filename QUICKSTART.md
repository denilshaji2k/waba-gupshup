# WABA BSP Panel - Quick Start Guide

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- MongoDB running locally
- Git

### Backend Setup

```bash
cd server

# 1. Install dependencies
npm install

# 2. Create .env file from example
cp .env.example .env

# 3. Edit .env with your configuration
# Add your Gupshup API credentials
# Set JWT_SECRET to a strong random string

# 4. Start the server
npm run dev  # Uses nodemon for auto-restart
# Server will run on http://localhost:5000
```

### Frontend Setup

```bash
cd client

# 1. Install dependencies
npm install

# 2. Create .env file (optional)
# REACT_APP_API_URL=http://localhost:5000/api

# 3. Start the development server
npm start
# Frontend will open at http://localhost:3000
```

---

## 📋 Project Structure Overview

```
server/
├── models/              # MongoDB schemas (User, App, Template, Journey, Message, etc.)
├── controllers/         # Business logic (auth, apps, templates, journeys)
├── routes/             # API endpoint definitions
├── middleware/         # Authentication and validation
├── services/           # GupshupService for API integration
├── utils/              # Helper functions
└── server.js           # Express app initialization

client/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components (Dashboard, Templates, etc.)
│   ├── store/          # Zustand state management (auth, etc.)
│   ├── services/       # API client (axios instance)
│   ├── utils/          # Helper functions
│   ├── App.js          # Main App component with routing
│   └── index.js        # React DOM render
└── public/             # Static assets
```

---

## 🔑 Key Features Implemented

### ✅ Authentication
- User registration and login
- JWT token-based authentication
- Password reset functionality
- Profile management

### ✅ Apps Management
- Create and manage WhatsApp Business Accounts
- Configure WABA settings
- Business profile setup

### ✅ Message Templates
- Create message templates
- Support for multiple categories
- Template variables
- Multi-language support

### ✅ Journey Builder (Drag & Drop)
- Visual journey creation interface
- Node-based conversation flows
- Save, publish, and manage journeys

### ✅ Messages
- Send messages (text and template)
- Receive messages via webhooks
- Message status tracking
- Conversation history

### ✅ Webhooks
- Receive inbound messages
- Track delivery status
- Process read receipts

### ✅ Analytics
- Message statistics
- Journey analytics
- User engagement metrics

### ✅ Wallet
- Wallet balance management
- Transaction history
- Top-up functionality

---

## 🔌 API Integration Points

### Gupshup Integration
The `GupshupService` class handles all Gupshup API calls:
- `sendMessage()` - Send text messages
- `sendTemplateMessage()` - Send template messages
- `createTemplate()` - Create new templates
- `getTemplates()` - List templates
- `uploadMedia()` - Upload media files
- `updateBusinessProfile()` - Update business info

### Meta WABA API
Integration is done through Gupshup which acts as intermediary:
- Message sending
- Template management
- Business profile
- Webhooks and events

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Basic
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/waba-bsp

# JWT
JWT_SECRET=your_secret_key

# Gupshup
GUPSHUP_API_KEY=your_api_key
GUPSHUP_APP_ID=your_app_id

# Webhook
WEBHOOK_URL=http://localhost:5000/api/webhooks/message
WEBHOOK_TOKEN=your_webhook_token

# Frontend
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📚 Database Schema

### Key Collections

**Users**
- name, email, phone, password (hashed)
- subscription, wallet, settings
- Login history, email verification

**Apps**
- userId, name, WABA configuration
- Business profile, settings
- Message and template quotas
- Analytics data

**Templates**
- appId, userId, name, category
- Body, header, footer, buttons
- Status (PENDING, APPROVED, REJECTED)
- Usage statistics

**Journeys**
- appId, userId, name, nodes
- Triggers, variables, settings
- Status (draft, active, paused)
- Analytics and versioning

**Messages**
- appId, direction (inbound/outbound)
- Phone numbers, content, status
- Template references, journey execution
- Auto-cleanup after 30 days

**WalletTransactions**
- userId, amount, type (topup/deduction)
- Status, payment method
- Timestamps

---

## 🧪 Testing the API

### Test Authentication

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get current user (requires token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Apps Endpoint

```bash
# Get all apps
curl -X GET http://localhost:5000/api/apps \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create app
curl -X POST http://localhost:5000/api/apps \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My App",
    "wabaId": "123456",
    "phoneNumberId": "789012",
    "phoneNumber": "+1234567890"
  }'
```

### Test Webhook

```bash
# Simulate message webhook
curl -X POST http://localhost:5000/api/webhooks/message \
  -H "X-Webhook-Token: your_webhook_token" \
  -H "Content-Type: application/json" \
  -d '{
    "waMessageId": "msg_123",
    "from": "+1234567890",
    "to": "+9876543210",
    "type": "text",
    "message": {
      "text": {
        "body": "Hello there!"
      }
    },
    "timestamp": 1234567890
  }'
```

---

## 🚢 Deployment

### For Production Deployment on Linux/SSH Server:

See **DEPLOYMENT_GUIDE.md** for complete setup including:
- Ubuntu server configuration
- MongoDB setup with authentication
- Node.js and PM2 installation
- Nginx reverse proxy configuration
- SSL/TLS with Let's Encrypt
- Backup and monitoring strategies

### Quick Deployment Checklist:

1. **Backend**
   - Set production environment variables
   - Install dependencies: `npm install`
   - Use PM2 for process management
   - Setup logrotation for logs

2. **Frontend**
   - Build: `npm run build`
   - Serve via Nginx
   - Configure CORS for production domain

3. **Database**
   - Setup MongoDB with authentication
   - Create database indexes
   - Configure automated backups

4. **Security**
   - Enable HTTPS/SSL
   - Setup firewall rules
   - Configure rate limiting
   - Secure environment variables

---

## 🐛 Common Issues & Solutions

### MongoDB Connection Error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### CORS Issues
- Update `CORS_ORIGIN` in backend .env
- Ensure frontend and backend URLs match

### Frontend Can't Connect to API
- Check `REACT_APP_API_URL` in frontend .env
- Verify backend is running on correct port
- Check Nginx proxy configuration (if deployed)

---

## 📖 Documentation Files

- **README.md** - Full project documentation
- **DEPLOYMENT_GUIDE.md** - Complete server deployment guide
- **API Documentation** - In code comments
- **Frontend Components** - Commented React components

---

## 🔄 Development Workflow

1. **Backend Development**
   ```bash
   cd server
   npm run dev  # Runs with auto-reload
   ```

2. **Frontend Development**
   ```bash
   cd client
   npm start  # Opens at http://localhost:3000
   ```

3. **Database Management**
   ```bash
   # Access MongoDB
   mongosh
   use waba-bsp
   db.users.find()
   ```

4. **Testing API**
   - Use Postman or REST Client
   - Test with provided curl commands
   - Monitor logs in PM2/terminal

---

## 📊 Performance Optimization

- Database indexes configured
- Message TTL set to 30 days
- Pagination on list endpoints
- Gzip compression enabled
- Rate limiting configured
- Ready for Redis caching

---

## 🔒 Security Best Practices Implemented

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Rate limiting
- ✅ Input validation ready
- ✅ Environment variable security
- ✅ Webhook token verification

---

## 📞 Support & Help

### Development Issues
- Check console logs in terminal
- Review browser DevTools
- Check API response in Network tab

### Deployment Help
- Follow DEPLOYMENT_GUIDE.md
- Check system logs: `tail -f /var/log/pm2/...`
- Monitor with: `pm2 monit`

### API Documentation
- Endpoints documented in code comments
- Full API reference in README.md
- Example curl commands provided

---

## 🎯 Next Steps

1. **Setup Development Environment**
   - Clone repository
   - Install dependencies
   - Configure .env files
   - Start dev servers

2. **Explore Features**
   - Create user account
   - Create app
   - Create message templates
   - Build journey flows

3. **Integrate Gupshup**
   - Get API credentials
   - Add to .env
   - Test message sending

4. **Deploy to Production**
   - Follow DEPLOYMENT_GUIDE.md
   - Configure domain
   - Setup SSL
   - Monitor application

---

## 📝 Version Info

- **Version**: 1.0.0
- **Node.js**: 18.x+
- **MongoDB**: 5.x+
- **React**: 18.x
- **Express**: 4.x
- **Last Updated**: November 2025

---

**Happy coding! 🚀**

For detailed information, refer to:
- Full Documentation: README.md
- Deployment Guide: DEPLOYMENT_GUIDE.md
- API Reference: In code comments
