# Testing Guide - WABA BSP Platform

## Overview

This guide provides comprehensive testing instructions for the WABA BSP platform across all features.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [API Testing](#api-testing)
5. [E2E Testing](#e2e-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)

---

## Environment Setup

### Prerequisites
- Node.js 18.x
- MongoDB 5.x running locally or remote
- Gupshup sandbox account (for testing APIs)
- Postman or cURL for API testing

### Setup Development Environment

```bash
# Backend setup
cd server
npm install
cp .env.example .env
# Update .env with test values

# Frontend setup
cd ../client
npm install
cp .env.example .env
# Update .env with test API URL
```

### Test Database Setup

```bash
# Use test database in .env
MONGODB_URI=mongodb://localhost:27017/waba-bsp-test

# Clear test data before running tests
npm run test:clean
```

---

## Unit Testing

### Backend Unit Tests

#### Test Structure

```
server/tests/
├── models/
│   ├── User.test.js
│   ├── App.test.js
│   ├── Template.test.js
│   ├── Journey.test.js
│   ├── Message.test.js
│   └── WalletTransaction.test.js
├── services/
│   └── GupshupService.test.js
├── middleware/
│   └── authMiddleware.test.js
└── utils/
    └── helpers.test.js
```

#### Running Unit Tests

```bash
cd server
npm test
```

#### Example Unit Test (User Model)

```javascript
// server/tests/models/User.test.js
const User = require('../../models/User');

describe('User Model', () => {
  before(async () => {
    // Connect to test DB
    await mongoose.connect(process.env.MONGODB_URI);
  });

  after(async () => {
    // Clean up
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create a user with hashed password', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Corp',
      password: 'SecurePassword123!'
    });

    expect(user._id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.password).not.toBe('SecurePassword123!'); // Should be hashed
  });

  it('should validate email format', async () => {
    try {
      await User.create({
        name: 'Test User',
        email: 'invalid-email',
        password: 'SecurePassword123!'
      });
      expect.fail('Should have thrown validation error');
    } catch (error) {
      expect(error.name).toBe('ValidationError');
    }
  });
});
```

#### Running Specific Tests

```bash
# Run tests for User model only
npm test -- --grep "User Model"

# Run tests with coverage
npm test -- --coverage

# Watch mode for development
npm test -- --watch
```

### Frontend Unit Tests

#### Test Structure

```
client/src/__tests__/
├── components/
│   ├── Layout.test.js
│   ├── ProtectedRoute.test.js
│   └── LoginForm.test.js
├── pages/
│   ├── DashboardPage.test.js
│   └── TemplatesPage.test.js
├── store/
│   └── authStore.test.js
└── services/
    └── api.test.js
```

#### Running Frontend Tests

```bash
cd client
npm test
```

#### Example Frontend Test (AuthStore)

```javascript
// client/src/__tests__/store/authStore.test.js
import { renderHook, act } from '@testing-library/react-hooks';
import useAuthStore from '../../store/authStore';

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false
    });
    localStorage.clear();
  });

  it('should login user and store token', async () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setToken('test_token');
      result.current.setUser({ id: '1', name: 'Test User' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('test_token');
    expect(localStorage.getItem('auth_token')).toBe('test_token');
  });

  it('should logout user and clear token', async () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setToken('test_token');
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
```

---

## Integration Testing

### API Integration Tests

#### Test Structure

```
server/tests/integration/
├── auth.integration.test.js
├── apps.integration.test.js
├── templates.integration.test.js
├── journeys.integration.test.js
├── messages.integration.test.js
└── webhooks.integration.test.js
```

#### Running Integration Tests

```bash
cd server
npm run test:integration
```

#### Example Integration Test (Auth Flow)

```javascript
// server/tests/integration/auth.integration.test.js
const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');

describe('Authentication Integration', () => {
  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          company: 'Acme Corp',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('john@example.com');
    });

    it('should reject duplicate email', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePassword123!'
        });

      // Try to create with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'john@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          company: 'Acme Corp',
          password: 'SecurePassword123!'
        });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

---

## API Testing

### Using Postman

#### Setup Postman Collection

1. Import the provided Postman collection
2. Set environment variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (set after login)
   - `appId`: (set after creating app)

#### Manual Testing Steps

```javascript
// 1. Register User
POST /auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPass123!"
}

// 2. Login
POST /auth/login
{
  "email": "test@example.com",
  "password": "TestPass123!"
}
// Save token from response

// 3. Create App
POST /apps
Headers: Authorization: Bearer {token}
{
  "name": "Test App",
  "phoneNumber": "+1234567890",
  "wabaId": "test_waba_id"
}
// Save appId from response

// 4. Create Template
POST /templates
Headers: Authorization: Bearer {token}
{
  "appId": "{appId}",
  "name": "Test Template",
  "category": "TRANSACTIONAL",
  "body": "Hello {{1}}, your order is {{2}}"
}

// 5. Create Journey
POST /journeys
Headers: Authorization: Bearer {token}
{
  "appId": "{appId}",
  "name": "Test Journey",
  "journeyType": "conversational",
  "nodes": [
    { "id": "1", "type": "start", "data": { "label": "Start" } }
  ],
  "edges": []
}
```

### Using cURL

#### Authentication Testing

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "password":"TestPass123!",
    "company":"Test Corp"
  }'

# Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123!"
  }' | jq -r '.data.token')

echo "Token: $TOKEN"
```

#### App Testing

```bash
# Create App
curl -X POST http://localhost:5000/api/apps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name":"Test App",
    "phoneNumber":"+1234567890",
    "wabaId":"test_waba"
  }'

# Get Apps
curl -X GET http://localhost:5000/api/apps \
  -H "Authorization: Bearer $TOKEN"

# Get Single App
curl -X GET http://localhost:5000/api/apps/{appId} \
  -H "Authorization: Bearer $TOKEN"
```

#### Message Testing

```bash
# Send Message
curl -X POST http://localhost:5000/api/messages/apps/{appId}/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phoneNumber":"+919999999999",
    "message":"Hello, this is a test message",
    "messageType":"text"
  }'

# Get Messages
curl -X GET http://localhost:5000/api/messages/apps/{appId}/messages \
  -H "Authorization: Bearer $TOKEN"
```

### REST Client (VSCode Extension)

Create `test-api.rest` file:

```rest
### Variables
@baseUrl = http://localhost:5000/api
@token = your_jwt_token_here
@appId = your_app_id_here

### 1. Register User
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPass123!",
  "company": "Test Corp"
}

### 2. Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123!"
}

### 3. Get Current User
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}

### 4. Create App
POST {{baseUrl}}/apps
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "Test App",
  "phoneNumber": "+1234567890",
  "wabaId": "test_waba_id"
}

### 5. Send Message
POST {{baseUrl}}/messages/apps/{{appId}}/send
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "phoneNumber": "+919999999999",
  "message": "Test message",
  "messageType": "text"
}

### 6. Get Messages
GET {{baseUrl}}/messages/apps/{{appId}}/messages
Authorization: Bearer {{token}}
```

---

## E2E Testing

### Cypress Setup

#### Installation

```bash
npm install --save-dev cypress
npx cypress open
```

#### Test Structure

```
client/cypress/
├── fixtures/
│   └── users.json
├── e2e/
│   ├── auth.cy.js
│   ├── apps.cy.js
│   ├── templates.cy.js
│   └── journey-builder.cy.js
└── support/
    ├── commands.js
    └── e2e.js
```

#### Example E2E Test (Auth Flow)

```javascript
// client/cypress/e2e/auth.cy.js
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should register a new user', () => {
    cy.contains('Register').click();
    cy.url().should('include', '/register');

    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="phone"]').type('+1234567890');
    cy.get('input[name="company"]').type('Test Corp');
    cy.get('input[name="password"]').type('TestPass123!');
    cy.get('input[name="confirmPassword"]').type('TestPass123!');

    cy.get('button:contains("Register")').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
  });

  it('should login with valid credentials', () => {
    cy.visit('http://localhost:3000/login');

    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('TestPass123!');
    cy.get('button:contains("Login")').click();

    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.visit('http://localhost:3000/login');

    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('WrongPassword');
    cy.get('button:contains("Login")').click();

    cy.contains('Invalid credentials').should('be.visible');
  });
});
```

#### Running E2E Tests

```bash
# Open Cypress UI
npx cypress open

# Run headless
npx cypress run

# Run specific test
npx cypress run --spec "cypress/e2e/auth.cy.js"
```

---

## Performance Testing

### Backend Performance Testing

#### Load Testing with Apache Bench

```bash
# Test authentication endpoint
ab -n 1000 -c 10 -p auth-data.json \
  -T application/json \
  http://localhost:5000/api/auth/login

# -n: Number of requests
# -c: Concurrent requests
# -p: POST data file
# -T: Content-Type
```

#### Load Testing with K6

```javascript
// server/tests/load/api-load.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  let response = http.post(
    'http://localhost:5000/api/auth/login',
    JSON.stringify({
      email: 'test@example.com',
      password: 'TestPass123!'
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });
}
```

Run:
```bash
k6 run server/tests/load/api-load.js
```

### Frontend Performance Testing

#### Lighthouse Testing

```bash
npm install -g lighthouse

# Test locally
lighthouse http://localhost:3000 --view

# Test with output
lighthouse http://localhost:3000 --output-path=./report.html
```

#### Performance Metrics

Monitor:
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.8s

---

## Security Testing

### OWASP Top 10 Testing

#### 1. SQL Injection Testing

```bash
# Test user input handling
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin\" --",
    "password":"anything"
  }'

# Should not execute SQL, return validation error
```

#### 2. XSS Testing

```javascript
// Try to inject script in template
const xssPayload = '<img src=x onerror="alert(\"XSS\")">';

// Send via API
curl -X POST http://localhost:5000/api/templates \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"body\":\"$xssPayload\"}"

// Should be sanitized or rejected
```

#### 3. CSRF Testing

Verify CSRF protection:
- Requests should require valid JWT token
- Cross-origin requests should be blocked by CORS
- No session cookies for CSRF

#### 4. Authentication Testing

```bash
# Try accessing protected route without token
curl -X GET http://localhost:5000/api/apps

# Should return 401 Unauthorized

# Try with expired token
curl -X GET http://localhost:5000/api/apps \
  -H "Authorization: Bearer expired_token"

# Should return 401 Unauthorized
```

#### 5. Authorization Testing

```bash
# Try to access another user's app
curl -X GET http://localhost:5000/api/apps/{other_user_app_id} \
  -H "Authorization: Bearer $YOUR_TOKEN"

# Should return 404 or 403
```

### Security Headers Testing

```bash
# Check response headers
curl -I http://localhost:5000/api/health

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Content-Security-Policy: default-src 'self'
# Strict-Transport-Security: max-age=31536000
```

### JWT Token Testing

```bash
# Decode JWT (for verification only)
node -e "console.log(require('jwt-decode')('your_token_here'))"

# Check token expiration
# Should be valid for 7 days from creation

# Try modifying token
# Should be rejected (signature verification fails)
```

---

## Test Coverage

### Generate Coverage Reports

```bash
# Backend coverage
cd server
npm test -- --coverage

# Frontend coverage
cd ../client
npm test -- --coverage

# Generate HTML report
npm test -- --coverage --coverageReporters=html
```

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

---

## CI/CD Testing

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:5.0
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 18

      - name: Install Backend
        run: cd server && npm install

      - name: Run Backend Tests
        run: cd server && npm test
        env:
          MONGODB_URI: mongodb://localhost:27017/waba-bsp-test

      - name: Install Frontend
        run: cd client && npm install

      - name: Run Frontend Tests
        run: cd client && npm test -- --coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v2
```

---

## Common Test Issues & Solutions

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Ensure MongoDB is running: `mongod` |
| Tests timeout | Increase timeout in jest.config.js: `testTimeout: 10000` |
| Auth tests fail | Clear test DB before each test: `beforeEach(() => User.deleteMany({}))` |
| Flaky tests | Use proper async/await, avoid setTimeout |
| Coverage gaps | Run `npm test -- --coverage` to identify untested code |

---

## Testing Checklist

Before deploying, verify:

- [ ] All unit tests pass (`npm test`)
- [ ] All integration tests pass (`npm run test:integration`)
- [ ] E2E tests pass in headless mode (`npx cypress run`)
- [ ] Code coverage > 80%
- [ ] No security vulnerabilities (`npm audit`)
- [ ] All CORS headers configured
- [ ] JWT validation working
- [ ] Database indexes created
- [ ] Environment variables set correctly
- [ ] Error handling tested
- [ ] Rate limiting working
- [ ] Webhooks receiving data

---

**Last Updated**: January 2024
**Testing Framework**: Jest + Supertest + Cypress
**Recommended Coverage**: > 80%
