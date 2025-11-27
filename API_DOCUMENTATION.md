# WABA BSP - Complete API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "password": "SecurePassword123!"
}
```

Response (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Acme Corp"
    },
    "token": "jwt_token_here"
  }
}
```

---

### 2. Login User
**POST** `/auth/login`

Request:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

---

### 3. Get Current User
**GET** `/auth/me` (Protected)

Response (200):
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Corp",
    "role": "user",
    "subscription": {
      "plan": "starter",
      "status": "active",
      "startDate": "2024-01-01",
      "renewalDate": "2025-01-01"
    },
    "wallet": {
      "balance": 100.00,
      "currency": "USD"
    }
  }
}
```

---

### 4. Update Profile
**PUT** `/auth/profile` (Protected)

Request:
```json
{
  "name": "John Updated",
  "phone": "+1234567890",
  "company": "New Corp"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated user */ }
}
```

---

### 5. Change Password
**POST** `/auth/change-password` (Protected)

Request:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 6. Forgot Password
**POST** `/auth/forgot-password`

Request:
```json
{
  "email": "john@example.com"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

---

### 7. Reset Password
**POST** `/auth/reset-password`

Request:
```json
{
  "token": "reset_token_from_email",
  "password": "NewPassword123!"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## App Management Endpoints

### 1. Create App
**POST** `/apps` (Protected)

Request:
```json
{
  "name": "My WhatsApp Business",
  "phoneNumber": "+1234567890",
  "wabaId": "waba_id_from_meta",
  "phoneNumberId": "phone_number_id_from_meta",
  "businessProfile": {
    "about": "We are a customer service team",
    "address": "123 Main St, City, Country",
    "website": "https://example.com",
    "email": "support@example.com",
    "industry": "retail"
  }
}
```

Response (201):
```json
{
  "success": true,
  "message": "App created successfully",
  "data": {
    "_id": "app_id",
    "userId": "user_id",
    "name": "My WhatsApp Business",
    "status": "pending",
    "subscription": {
      "plan": "starter",
      "status": "active"
    },
    "messagesQuota": {
      "monthly": 1000,
      "used": 0
    },
    "templatesQuota": {
      "limit": 50,
      "used": 0
    }
  }
}
```

---

### 2. Get User Apps
**GET** `/apps` (Protected)

Query Parameters:
- `limit`: Number of records (default: 10)
- `offset`: Skip records (default: 0)
- `status`: Filter by status (pending, active, inactive, suspended)

Response (200):
```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "data": [
    {
      "_id": "app_id_1",
      "name": "App 1",
      "status": "active",
      "phoneNumber": "+1234567890",
      "analytics": {
        "totalMessagesSent": 150,
        "totalMessagesReceived": 200
      }
    },
    {
      "_id": "app_id_2",
      "name": "App 2",
      "status": "pending",
      "phoneNumber": "+0987654321",
      "analytics": {
        "totalMessagesSent": 0,
        "totalMessagesReceived": 0
      }
    }
  ]
}
```

---

### 3. Get Single App
**GET** `/apps/:appId` (Protected)

Response (200):
```json
{
  "success": true,
  "data": {
    "_id": "app_id",
    "name": "My WhatsApp Business",
    "status": "active",
    "phoneNumber": "+1234567890",
    "businessProfile": {
      "about": "We are a customer service team",
      "address": "123 Main St, City, Country",
      "website": "https://example.com",
      "email": "support@example.com"
    },
    "features": {
      "botBuilder": true,
      "templates": true,
      "analytics": true
    },
    "messagesQuota": {
      "monthly": 1000,
      "used": 150
    },
    "templatesQuota": {
      "limit": 50,
      "used": 5
    }
  }
}
```

---

### 4. Update App
**PUT** `/apps/:appId` (Protected)

Request:
```json
{
  "name": "Updated App Name",
  "phoneNumber": "+1234567890",
  "businessProfile": {
    "about": "Updated description",
    "address": "456 New St, City, Country",
    "website": "https://newsite.com",
    "email": "newemail@example.com"
  }
}
```

Response (200):
```json
{
  "success": true,
  "message": "App updated successfully",
  "data": { /* updated app */ }
}
```

---

### 5. Delete App
**DELETE** `/apps/:appId` (Protected)

Response (200):
```json
{
  "success": true,
  "message": "App deleted successfully"
}
```

---

### 6. Get Business Profile
**GET** `/apps/:appId/profile` (Protected)

Response (200):
```json
{
  "success": true,
  "data": {
    "about": "Customer service team",
    "address": "123 Main St",
    "website": "https://example.com",
    "email": "support@example.com",
    "industry": "retail",
    "verified": true
  }
}
```

---

### 7. Update Business Profile
**PUT** `/apps/:appId/profile` (Protected)

Request:
```json
{
  "about": "Updated description",
  "address": "New address",
  "website": "https://newsite.com",
  "email": "newemail@example.com"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Business profile updated",
  "data": { /* updated profile */ }
}
```

---

### 8. Get App Settings
**GET** `/apps/:appId/settings` (Protected)

Response (200):
```json
{
  "success": true,
  "data": {
    "webhookUrl": "https://example.com/webhooks",
    "webhookVerificationToken": "token_here",
    "autoReply": {
      "enabled": true,
      "message": "Thanks for your message!"
    },
    "messageRetention": 30,
    "features": {
      "botBuilder": true,
      "templates": true,
      "analytics": true
    }
  }
}
```

---

### 9. Update App Settings
**PUT** `/apps/:appId/settings` (Protected)

Request:
```json
{
  "webhookUrl": "https://example.com/webhooks",
  "autoReply": {
    "enabled": true,
    "message": "Thanks for contacting us!"
  },
  "features": {
    "botBuilder": true,
    "templates": true,
    "analytics": true
  }
}
```

Response (200):
```json
{
  "success": true,
  "message": "Settings updated",
  "data": { /* updated settings */ }
}
```

---

## Template Management Endpoints

### 1. Create Template
**POST** `/templates` (Protected)

Request:
```json
{
  "appId": "app_id",
  "name": "Order Confirmation",
  "category": "TRANSACTIONAL",
  "language": "en",
  "header": {
    "format": "TEXT",
    "text": "Order Confirmation"
  },
  "body": "Your order {{1}} has been confirmed. Total: {{2}}",
  "footer": "Thank you for shopping with us",
  "labels": ["order", "confirmation"],
  "variables": [
    {
      "name": "orderNumber",
      "placeholder": "{{1}}"
    },
    {
      "name": "totalAmount",
      "placeholder": "{{2}}"
    }
  ],
  "buttons": [
    {
      "type": "QUICK_REPLY",
      "text": "View Order"
    }
  ]
}
```

Response (201):
```json
{
  "success": true,
  "message": "Template created successfully",
  "data": {
    "_id": "template_id",
    "name": "Order Confirmation",
    "status": "PENDING",
    "language": "en",
    "category": "TRANSACTIONAL",
    "quality_score": {
      "status": "UNKNOWN",
      "score": null
    }
  }
}
```

---

### 2. Get Templates
**GET** `/templates` (Protected)

Query Parameters:
- `appId`: Filter by app
- `status`: PENDING, APPROVED, REJECTED, DISABLED
- `limit`: Default 20
- `offset`: Default 0

Response (200):
```json
{
  "success": true,
  "count": 3,
  "total": 3,
  "data": [
    {
      "_id": "template_id_1",
      "name": "Order Confirmation",
      "status": "APPROVED",
      "category": "TRANSACTIONAL",
      "language": "en",
      "quality_score": {
        "status": "HIGH",
        "score": 0.95
      },
      "usageCount": 45
    }
  ]
}
```

---

### 3. Get Template Details
**GET** `/templates/:templateId` (Protected)

Response (200):
```json
{
  "success": true,
  "data": {
    "_id": "template_id",
    "name": "Order Confirmation",
    "category": "TRANSACTIONAL",
    "language": "en",
    "header": {
      "format": "TEXT",
      "text": "Order Confirmation"
    },
    "body": "Your order {{1}} has been confirmed. Total: {{2}}",
    "footer": "Thank you",
    "variables": [
      {
        "name": "orderNumber",
        "placeholder": "{{1}}"
      },
      {
        "name": "totalAmount",
        "placeholder": "{{2}}"
      }
    ],
    "buttons": [
      {
        "type": "QUICK_REPLY",
        "text": "View Order"
      }
    ],
    "status": "APPROVED",
    "quality_score": {
      "status": "HIGH",
      "score": 0.95
    }
  }
}
```

---

### 4. Update Template
**PUT** `/templates/:templateId` (Protected)

Request: (Same structure as Create)

Response (200):
```json
{
  "success": true,
  "message": "Template updated successfully",
  "data": { /* updated template */ }
}
```

---

### 5. Delete Template
**DELETE** `/templates/:templateId` (Protected)

Response (200):
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

---

### 6. Test Template
**POST** `/templates/:templateId/test` (Protected)

Request:
```json
{
  "phoneNumber": "+1234567890",
  "variables": [
    "ORD-12345",
    "$100.00"
  ]
}
```

Response (200):
```json
{
  "success": true,
  "message": "Test message sent successfully",
  "data": {
    "messageId": "msg_id",
    "phoneNumber": "+1234567890",
    "status": "sent"
  }
}
```

---

## Journey Builder Endpoints

### 1. Create Journey
**POST** `/journeys` (Protected)

Request:
```json
{
  "appId": "app_id",
  "name": "Customer Onboarding",
  "journeyType": "conversational",
  "description": "Welcome new customers",
  "nodes": [
    {
      "id": "node_1",
      "type": "start",
      "data": {
        "label": "Start"
      }
    },
    {
      "id": "node_2",
      "type": "message",
      "data": {
        "label": "Welcome Message",
        "message": "Welcome to our service!"
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_1",
      "target": "node_2"
    }
  ],
  "triggers": [
    {
      "type": "onKeyword",
      "keywords": ["hello", "hi"]
    }
  ]
}
```

Response (201):
```json
{
  "success": true,
  "message": "Journey created successfully",
  "data": {
    "_id": "journey_id",
    "name": "Customer Onboarding",
    "status": "draft",
    "journeyType": "conversational",
    "version": 1,
    "nodeCount": 2,
    "edgeCount": 1
  }
}
```

---

### 2. Get Journeys
**GET** `/journeys` (Protected)

Query Parameters:
- `appId`: Filter by app
- `status`: draft, active, paused, archived
- `limit`: Default 20
- `offset`: Default 0

Response (200):
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "data": [
    {
      "_id": "journey_id_1",
      "name": "Customer Onboarding",
      "status": "active",
      "journeyType": "conversational",
      "nodeCount": 8,
      "edgeCount": 7,
      "analytics": {
        "totalExecutions": 523,
        "totalConversions": 189,
        "conversionRate": 0.361
      }
    }
  ]
}
```

---

### 3. Get Journey Details
**GET** `/journeys/:journeyId` (Protected)

Response (200):
```json
{
  "success": true,
  "data": {
    "_id": "journey_id",
    "name": "Customer Onboarding",
    "status": "active",
    "journeyType": "conversational",
    "nodes": [
      {
        "id": "node_1",
        "type": "start",
        "data": { /* node data */ }
      }
    ],
    "edges": [
      {
        "id": "edge_1",
        "source": "node_1",
        "target": "node_2"
      }
    ],
    "triggers": [
      {
        "type": "onKeyword",
        "keywords": ["hello", "hi"]
      }
    ],
    "variables": [
      {
        "name": "userName",
        "type": "string"
      }
    ],
    "version": 3,
    "analytics": {
      "totalExecutions": 523,
      "totalConversions": 189,
      "averageTimeToConversion": 120
    }
  }
}
```

---

### 4. Update Journey
**PUT** `/journeys/:journeyId` (Protected)

Request: (Same structure as Create)

Response (200):
```json
{
  "success": true,
  "message": "Journey updated successfully",
  "data": { /* updated journey */ }
}
```

---

### 5. Publish Journey
**POST** `/journeys/:journeyId/publish` (Protected)

Response (200):
```json
{
  "success": true,
  "message": "Journey published successfully",
  "data": {
    "_id": "journey_id",
    "status": "active",
    "version": 2,
    "publishedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 6. Pause Journey
**POST** `/journeys/:journeyId/pause` (Protected)

Response (200):
```json
{
  "success": true,
  "message": "Journey paused successfully",
  "data": {
    "_id": "journey_id",
    "status": "paused"
  }
}
```

---

### 7. Delete Journey
**DELETE** `/journeys/:journeyId` (Protected)

Response (200):
```json
{
  "success": true,
  "message": "Journey deleted successfully"
}
```

---

### 8. Clone Journey
**POST** `/journeys/:journeyId/clone` (Protected)

Request:
```json
{
  "name": "Customer Onboarding - Copy"
}
```

Response (201):
```json
{
  "success": true,
  "message": "Journey cloned successfully",
  "data": {
    "_id": "new_journey_id",
    "name": "Customer Onboarding - Copy",
    "status": "draft",
    "version": 1
  }
}
```

---

### 9. Get Journey Analytics
**GET** `/journeys/:journeyId/analytics` (Protected)

Response (200):
```json
{
  "success": true,
  "data": {
    "journeyId": "journey_id",
    "journeyName": "Customer Onboarding",
    "analytics": {
      "totalExecutions": 523,
      "totalConversions": 189,
      "conversionRate": 0.361,
      "averageTimeToConversion": 120,
      "nodeExecutions": {
        "node_1": 523,
        "node_2": 510,
        "node_3": 489
      }
    }
  }
}
```

---

## Message Endpoints

### 1. Send Message
**POST** `/messages/apps/:appId/send` (Protected)

Request:
```json
{
  "phoneNumber": "+1234567890",
  "message": "Hello! How can we help?",
  "messageType": "text"
}
```

Or for template:
```json
{
  "phoneNumber": "+1234567890",
  "message": "order_confirmation",
  "messageType": "template",
  "templateId": "template_id",
  "variables": [
    "ORD-12345",
    "$100.00"
  ]
}
```

Response (201):
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "message_id",
    "messageId": "msg_gupshup_id",
    "phoneNumber": "+1234567890",
    "status": "sent",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. Get Messages
**GET** `/messages/apps/:appId/messages` (Protected)

Query Parameters:
- `status`: sent, delivered, read, failed
- `direction`: inbound, outbound
- `limit`: Default 50
- `offset`: Default 0

Response (200):
```json
{
  "success": true,
  "count": 10,
  "total": 245,
  "data": [
    {
      "_id": "message_id",
      "messageId": "msg_gupshup_id",
      "direction": "inbound",
      "senderPhoneNumber": "+1234567890",
      "messageType": "text",
      "content": {
        "text": "Hello, I need help"
      },
      "status": "delivered",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3. Get Conversation
**GET** `/messages/apps/:appId/conversation/:phoneNumber` (Protected)

Response (200):
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "message_id",
      "direction": "outbound",
      "content": { "text": "How can we help?" },
      "status": "delivered",
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "_id": "message_id_2",
      "direction": "inbound",
      "content": { "text": "I need order help" },
      "status": "read",
      "createdAt": "2024-01-15T10:05:00Z"
    }
  ]
}
```

---

### 4. Get Message Statistics
**GET** `/messages/apps/:appId/stats` (Protected)

Query Parameters:
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

Response (200):
```json
{
  "success": true,
  "data": [
    {
      "_id": {
        "direction": "inbound",
        "status": "delivered"
      },
      "count": 150
    },
    {
      "_id": {
        "direction": "outbound",
        "status": "sent"
      },
      "count": 200
    }
  ]
}
```

---

## Webhook Endpoints

### 1. Receive Messages (Gupshup Webhook)
**POST** `/webhooks/message`

Gupshup will send:
```json
{
  "payload": {
    "phone": "919999999999",
    "name": "Raj Kumar",
    "message": "Hi there!",
    "messageId": "msg_gupshup_id",
    "timestamp": 1642000000
  }
}
```

Response (200):
```json
{
  "success": true,
  "message": "Message received"
}
```

---

### 2. Message Status Webhook
**POST** `/webhooks/status`

Gupshup sends:
```json
{
  "payload": {
    "messageId": "msg_id",
    "status": "delivered",
    "timestamp": 1642000000
  }
}
```

Response (200):
```json
{
  "success": true,
  "message": "Status updated"
}
```

---

### 3. Read Receipt Webhook
**POST** `/webhooks/read`

Response (200):
```json
{
  "success": true,
  "message": "Read status updated"
}
```

---

## Wallet Endpoints

### 1. Get Wallet Balance
**GET** `/wallet/balance` (Protected)

Response (200):
```json
{
  "success": true,
  "data": {
    "balance": 500.00,
    "currency": "USD",
    "lastTopUp": "2024-01-10",
    "totalSpent": 1250.00,
    "totalTopUps": 1750.00
  }
}
```

---

### 2. Get Transactions
**GET** `/wallet/transactions` (Protected)

Query Parameters:
- `type`: topup, deduction, refund, bonus
- `limit`: Default 20
- `offset`: Default 0

Response (200):
```json
{
  "success": true,
  "count": 15,
  "total": 150,
  "data": [
    {
      "_id": "transaction_id",
      "amount": 100.00,
      "type": "topup",
      "currency": "USD",
      "status": "completed",
      "description": "Account top-up",
      "paymentMethod": "credit_card",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3. Top Up Wallet
**POST** `/wallet/topup` (Protected)

Request:
```json
{
  "amount": 100.00,
  "paymentMethod": "credit_card",
  "stripeToken": "tok_visa"
}
```

Response (201):
```json
{
  "success": true,
  "message": "Top-up initiated",
  "data": {
    "transactionId": "txn_id",
    "amount": 100.00,
    "status": "pending",
    "redirectUrl": "https://payment-processor.com/..."
  }
}
```

---

### 4. Deduct from Wallet
**POST** `/wallet/deduct` (Protected - Admin/System)

Request:
```json
{
  "amount": 10.00,
  "type": "message_cost",
  "description": "50 messages sent"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Amount deducted",
  "data": {
    "newBalance": 490.00,
    "transactionId": "txn_id"
  }
}
```

---

## Analytics Endpoints

### 1. Dashboard Overview
**GET** `/analytics/dashboard` (Protected)

Response (200):
```json
{
  "success": true,
  "data": {
    "totalApps": 3,
    "totalMessages": 5230,
    "totalTemplates": 15,
    "activeJourneys": 8,
    "monthlySpend": 450.00,
    "conversionRate": 0.34,
    "topApps": [
      {
        "_id": "app_id",
        "name": "App 1",
        "messageCount": 2500
      }
    ]
  }
}
```

---

### 2. Message Analytics
**GET** `/analytics/apps/:appId/messages` (Protected)

Query Parameters:
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD
- `groupBy`: day, week, month

Response (200):
```json
{
  "success": true,
  "data": {
    "totalMessages": 1250,
    "inbound": 650,
    "outbound": 600,
    "byStatus": {
      "sent": 500,
      "delivered": 480,
      "read": 400,
      "failed": 20
    },
    "dailyBreakdown": [
      {
        "date": "2024-01-15",
        "count": 45,
        "inbound": 20,
        "outbound": 25
      }
    ]
  }
}
```

---

### 3. Journey Analytics
**GET** `/analytics/apps/:appId/journeys` (Protected)

Response (200):
```json
{
  "success": true,
  "data": {
    "totalJourneys": 5,
    "activeJourneys": 3,
    "totalExecutions": 2300,
    "totalConversions": 800,
    "averageConversionRate": 0.35,
    "journeys": [
      {
        "_id": "journey_id",
        "name": "Onboarding",
        "executions": 500,
        "conversions": 180,
        "conversionRate": 0.36
      }
    ]
  }
}
```

---

### 4. App Analytics
**GET** `/analytics/apps/:appId/overview` (Protected)

Response (200):
```json
{
  "success": true,
  "data": {
    "appId": "app_id",
    "appName": "App 1",
    "messageStats": {
      "total": 1250,
      "sent": 600,
      "received": 650
    },
    "templateStats": {
      "total": 5,
      "approved": 5,
      "pending": 0
    },
    "journeyStats": {
      "active": 3,
      "draft": 2,
      "executions": 1500,
      "conversions": 520
    }
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (only in development)"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (no permission)
- **404**: Not Found (resource doesn't exist)
- **500**: Server Error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Window**: 15 minutes
- **Max Requests**: 100 requests per window
- **Header**: `X-RateLimit-Remaining` shows remaining requests

---

## Authentication Notes

1. JWT tokens expire after 7 days
2. Include token in all protected requests: `Authorization: Bearer {token}`
3. On 401 error, the frontend should clear stored token and redirect to login
4. Tokens are returned on successful login/registration

---

## Testing the API

Use these tools for testing:
- **Postman**: Import and test endpoints
- **cURL**: Command-line testing
- **API Client**: VSCode REST Client extension

Example cURL:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

---

## Webhook Configuration

1. Get your app's webhook URL: `https://yourdomain.com/api/webhooks`
2. Configure in Gupshup dashboard
3. Set webhook verification token from app settings
4. Gupshup will send POST requests to your webhook URL

---

## Pagination

List endpoints support pagination:
- **limit**: Records per page (default: 20, max: 100)
- **offset**: Number of records to skip

Example:
```
GET /templates?limit=20&offset=40
```

This returns records 41-60.

---

**Last Updated**: January 2024
**API Version**: 1.0
**Gupshup API Version**: Latest
