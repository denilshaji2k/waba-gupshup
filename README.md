# WABA BSP Panel - Complete Documentation

## Overview

WABA BSP Panel is a comprehensive WhatsApp Business Account (WABA) Business Service Provider (BSP) management platform built with Node.js/Express backend and React frontend. It integrates with Gupshup API and Meta's WhatsApp Business API to provide a complete solution for managing WhatsApp messaging, templates, and conversational journeys.

## Project Structure

```
WABA-GUPSHUP/
├── server/                 # Express.js backend
│   ├── models/            # MongoDB schemas
│   ├── controllers/        # Business logic
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & validation
│   ├── services/          # External service integrations
│   ├── utils/             # Utility functions
│   ├── server.js          # Main application file
│   ├── package.json
│   └── .env.example
├── client/                # React.js frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # State management (Zustand)
│   │   ├── services/      # API client services
│   │   ├── utils/         # Utility functions
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── docs/                  # Documentation

```

## Features Implemented

### 1. Authentication & User Management
- User registration and login with JWT
- Email verification (template ready)
- Password reset functionality
- Profile management
- Two-factor authentication (2FA) support
- Login history tracking
- Role-based access control (User, Admin, Partner)

### 2. App Management
- Create multiple WhatsApp Business Accounts
- Manage WABA and phone number configuration
- Business profile setup (about, address, website, email)
- App settings and configuration
- Feature management per app
- Subscription status tracking

### 3. Message Templates
- Create and manage WhatsApp message templates
- Support for multiple template categories (Marketing, OTP, Transactional, etc.)
- Template variables with placeholders
- Header, body, footer, and buttons configuration
- Template approval status tracking
- Test template sending
- Multi-language support

### 4. Drag & Drop Journey Builder
- Visual journey/flow builder with React Flow
- Node types:
  - Start node
  - Message node (text, template, interactive)
  - Action node (API calls, webhooks)
  - Condition/Decision node
  - Delay node
  - End node
- Canvas controls (zoom, pan, select)
- Save and publish journeys
- Journey versioning
- Clone journeys for templates
- Multi-journey support

### 5. Message Management
- Send text and template messages
- Receive and process inbound messages
- Message status tracking (sent, delivered, read, failed)
- Conversation history
- Media support (images, videos, documents, audio)
- Interactive messages with buttons
- Location messages

### 6. Webhook Integration
- Webhook endpoint for receiving messages
- Status updates (sent, delivered, read)
- Automatic message logging
- Configurable webhook URL
- Security token validation
- Asynchronous message processing

### 7. Analytics & Reporting
- Message statistics (sent, received, delivered, read)
- Journey analytics (execution, completion, conversion)
- User engagement metrics
- Daily/monthly reports
- Conversation analytics
- Template usage tracking

### 8. Wallet & Billing
- Wallet balance management
- Top-up functionality
- Transaction history
- Deduction tracking (message costs)
- Payment method support
- Subscription management
- API quota tracking

### 9. Business Features
- Auto-reply configuration
- Message encryption
- Bulk messaging
- Campaign management (foundation)
- CRM integration ready
- Template management per app

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Apps
- `POST /api/apps` - Create app
- `GET /api/apps` - Get user's apps
- `GET /api/apps/:id` - Get single app
- `PUT /api/apps/:id` - Update app
- `DELETE /api/apps/:id` - Delete app
- `PUT /api/apps/:id/business-profile` - Update business profile
- `GET /api/apps/:id/settings` - Get app settings
- `PUT /api/apps/:id/settings` - Update settings
- `GET /api/apps/:id/analytics` - Get analytics

### Templates
- `POST /api/templates/apps/:appId/templates` - Create template
- `GET /api/templates/apps/:appId/templates` - Get templates
- `GET /api/templates/apps/:appId/templates/:templateId` - Get single template
- `PUT /api/templates/apps/:appId/templates/:templateId` - Update template
- `DELETE /api/templates/apps/:appId/templates/:templateId` - Delete template
- `POST /api/templates/apps/:appId/templates/:templateId/test` - Test template

### Journeys (Drag & Drop Bot Builder)
- `POST /api/journeys/apps/:appId/journeys` - Create journey
- `GET /api/journeys/apps/:appId/journeys` - Get journeys
- `GET /api/journeys/apps/:appId/journeys/:journeyId` - Get single journey
- `PUT /api/journeys/apps/:appId/journeys/:journeyId` - Update journey
- `POST /api/journeys/apps/:appId/journeys/:journeyId/publish` - Publish journey
- `POST /api/journeys/apps/:appId/journeys/:journeyId/pause` - Pause journey
- `DELETE /api/journeys/apps/:appId/journeys/:journeyId` - Delete journey
- `POST /api/journeys/apps/:appId/journeys/:journeyId/clone` - Clone journey

### Messages
- `GET /api/messages/apps/:appId/messages` - Get messages
- `POST /api/messages/apps/:appId/send` - Send message

### Webhooks
- `POST /api/webhooks/message` - Receive messages (public)
- `POST /api/webhooks/status` - Receive status updates (public)
- `POST /api/webhooks/read` - Receive read receipts (public)

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get transactions
- `POST /api/wallet/topup` - Top up wallet
- `POST /api/wallet/deduct` - Deduct from wallet

### Analytics
- `GET /api/analytics/apps/:appId/overview` - Get app overview
- `GET /api/analytics/apps/:appId/messages` - Get message analytics
- `GET /api/analytics/apps/:appId/journeys` - Get journey analytics
- `GET /api/analytics/dashboard` - Get dashboard summary

## Database Models

### User
```
- name, email, phone, company, country
- password (hashed)
- role (user, admin, partner)
- subscription (plan, status, dates)
- wallet (balance, totalSpent, totalTopUps)
- apiQuota, settings
- loginHistory, emailVerification
- createdAt, updatedAt
```

### App
```
- userId, name, description
- gupshupAppId, wabaId, phoneNumberId
- businessProfile (about, address, email, websites)
- status, subscriptionStatus
- messagesQuota, templateQuota
- features (botBuilder, templates, analytics, etc.)
- settings, analytics
- createdAt, updatedAt
```

### Template
```
- appId, userId, name
- category (MARKETING, OTP, ACCOUNT_UPDATE, etc.)
- language, labels
- header (format, text, mediaUrl)
- body, footer
- variables, buttons
- status (PENDING, APPROVED, REJECTED, DISABLED)
- gupshupTemplateId, metaTemplateId
- quality (score, status, messages)
- usage (totalSent, lastUsed)
- createdAt, updatedAt
```

### Journey
```
- appId, userId, name, description
- journeyType (conversational, campaign, ad, broadcast)
- status (draft, active, paused, archived)
- nodes (array of journey nodes with connections)
- triggers (onKeyword, onEvent, onSchedule)
- variables, settings
- analytics (executions, conversions, avgTime)
- publishedAt, publishedVersion, currentVersion
- createdAt, updatedAt, deletedAt
```

### Message
```
- appId, userId, conversationId
- messageId (unique), direction (inbound/outbound)
- senderPhoneNumber, recipientPhoneNumber
- messageType (text, image, video, template, etc.)
- content (text, mediaUrl, mediaId, buttons)
- templateId, templateVariables
- journeyId, journeyExecutionId
- status (sent, delivered, read, failed)
- deliveryStatus, readStatus
- failureReason, retryCount
- metadata (source, campaignId)
- createdAt (with TTL index - 30 days), updatedAt
```

### WalletTransaction
```
- userId, appId
- type (topup, deduction, refund, bonus)
- amount, currency
- description, paymentMethod
- transactionId, reference
- status (pending, completed, failed, refunded)
- failureReason, metadata
- createdAt, completedAt
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB 5.x+
- **Authentication**: JWT (jsonwebtoken)
- **API Client**: Axios
- **Security**: Helmet, CORS, bcryptjs
- **Logging**: Morgan
- **Rate Limiting**: express-rate-limit
- **Email**: Nodemailer (optional)

### Frontend
- **Library**: React 18.x
- **Routing**: React Router v6
- **State Management**: Zustand
- **UI Components**: React Flow (journey builder)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Animations**: Framer Motion

### DevOps & Deployment
- **Server**: Linux (Ubuntu 20.04+)
- **Web Server**: Nginx (reverse proxy)
- **Process Manager**: PM2
- **SSL**: Let's Encrypt (certbot)
- **Containerization**: Docker (optional)
- **CI/CD**: GitHub Actions (optional)

## Gupshup API Integration

The `GupshupService` class in `server/services/GupshupService.js` provides:

```javascript
// Message sending
- sendMessage(phoneNumber, message, type)
- sendTemplateMessage(phoneNumber, templateName, variables, language)
- sendMediaMessage(phoneNumber, mediaUrl, mediaType, caption)

// Template management
- createTemplate(templateData)
- getTemplates()
- deleteTemplate(templateId)

// Message tracking
- getMessageStatus(messageId)
- markMessageAsRead(messageId)

// Business profile
- updateBusinessProfile(profileData)
- getAppInfo()

// Media
- uploadMedia(file, mediaType)
- getConversation(phoneNumber)
```

## Meta WABA API Integration Points

The system integrates with Meta's WhatsApp Business API through Gupshup for:

1. **Message Management**
   - Send messages (text, templates, media, interactive)
   - Receive messages
   - Update message status

2. **Template Management**
   - Create templates
   - Submit for approval
   - Track approval status
   - Delete templates

3. **Business Profile**
   - Set business information
   - Update profile picture
   - Configure business hours

4. **Phone Numbers**
   - Manage phone number configurations
   - Handle number status

5. **Webhooks & Events**
   - Receive message events
   - Track delivery/read status
   - Handle business account events

## Setup & Deployment

See `DEPLOYMENT_GUIDE.md` for complete setup instructions.

## Environment Variables

See `server/.env.example` for required configuration.

## Security Considerations

1. **API Keys**: Store securely in environment variables
2. **JWT**: Use strong secrets in production
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Configure appropriate CORS origins
5. **Rate Limiting**: Configured to prevent abuse
6. **Password**: Bcrypt hashing with salt rounds
7. **Webhook Verification**: Token-based validation
8. **Input Validation**: Express-validator integration ready
9. **CSRF Protection**: Implement for web forms
10. **Data Encryption**: Message content can be encrypted

## Performance Optimization

1. **Database Indexing**: Configured on frequently queried fields
2. **Message TTL**: 30-day auto-cleanup
3. **Pagination**: Implemented on list endpoints
4. **Caching**: Ready for Redis integration
5. **Async Processing**: Webhooks processed asynchronously
6. **Connection Pooling**: MongoDB connection pooling enabled

## Error Handling

- Comprehensive error messages
- Proper HTTP status codes
- Error logging
- Graceful degradation
- User-friendly frontend error displays

## Testing

Ready for integration with:
- Jest (unit tests)
- Supertest (API testing)
- React Testing Library (component testing)

## Future Enhancements

1. Real-time message updates with WebSockets
2. AI-powered chatbot integration
3. Advanced analytics and reporting
4. CRM integrations (Salesforce, HubSpot, Zoho)
5. Multiple language NLP support
6. Custom whitelabel support
7. Advanced permission management
8. Message scheduling
9. A/B testing for messages
10. Advanced segmentation

## Support & Documentation

- API Documentation: `/api/docs` (ready for Swagger integration)
- Frontend Components: Documented with comments
- Database Schema: Detailed in models/
- Deployment: See DEPLOYMENT_GUIDE.md

## License

ISC

## Contact

For support, email: support@wababsp.com

---

**Last Updated**: November 2025
**Version**: 1.0.0
