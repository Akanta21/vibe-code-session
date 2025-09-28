# API Security Implementation

This document outlines the comprehensive security measures implemented for all API endpoints in the Vibe Coding Event Signup System.

## 🛡️ Security Features Implemented

### 1. Rate Limiting
**Purpose**: Prevent abuse and ensure fair usage across all users.

**Implementation**:
- **Public endpoints** (signup): 10 requests per 15 minutes
- **AI endpoints** (vibe generation): 3 requests per 5 minutes  
- **Admin endpoints**: 50 requests per 5 minutes

**Headers returned**:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `Retry-After`: Seconds until rate limit resets

### 2. Input Validation & Sanitization
**Purpose**: Prevent injection attacks and ensure data integrity.

**Features**:
- Schema-based validation for all inputs
- String sanitization (removes XSS characters, normalizes whitespace)
- Type checking and length validation
- Pattern matching for emails and phone numbers

**Example validation**:
```typescript
{
  projectIdea: {
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 500,
    sanitize: true
  }
}
```

### 3. Origin Validation (CORS)
**Purpose**: Ensure requests only come from authorized domains.

**Allowed origins**:
- `http://localhost:3000` (development)
- `https://vibe-coding.pages.dev` (production)
- `https://*.pages.dev` (Cloudflare preview URLs)
- Environment-configured app URL

### 4. API Key Authentication
**Purpose**: Protect sensitive endpoints requiring elevated access.

**Levels**:
- **Admin API Key**: For admin-only operations
- **Internal API Key**: For service-to-service communication

**Usage**: Include in request headers as `x-api-key`

### 5. Security Logging
**Purpose**: Monitor and respond to security threats.

**Logged events**:
- Rate limit violations
- Invalid API key attempts  
- Unauthorized origin requests
- Input validation failures
- Malformed JSON requests

**Log format**:
```typescript
{
  event: 'RATE_LIMIT_EXCEEDED',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  url: '/api/generate-vibe',
  timestamp: '2024-01-01T00:00:00.000Z'
}
```

## 🔧 Usage Guide

### Protecting an Endpoint

Use the `withSecurity` wrapper for comprehensive protection:

```typescript
import { withSecurity, schemas } from '@/lib/api-security';

export async function POST(request: NextRequest) {
  return withSecurity(
    request,
    async (req: NextRequest, securityResult: any) => {
      // Your endpoint logic here
      const { sanitizedInput } = securityResult;
      // Use sanitizedInput instead of raw request body
    },
    {
      rateLimitType: 'public', // or 'ai', 'admin'
      requireApiKey: 'admin', // optional: 'admin' or 'internal'
      validateOrigin: true, // default: true
      inputSchema: {
        name: schemas.name,
        email: schemas.email,
        // ... other fields
      }
    }
  );
}
```

### Environment Setup

Required environment variables:

```bash
# Security keys (generate strong random strings)
ADMIN_API_KEY=your_secure_admin_key_here
INTERNAL_API_KEY=your_secure_internal_key_here

# App domain for CORS
NEXT_PUBLIC_APP_URL=https://your-domain.com

# OpenAI API (for AI endpoints)
OPENAI_API_KEY=sk-your_openai_key_here
```

### Generating Secure API Keys

Use a secure random generator:

```bash
# Generate 32-byte random strings
openssl rand -hex 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Current Endpoint Protection Status

| Endpoint | Rate Limit | Input Validation | Origin Check | API Key |
|----------|------------|-----------------|--------------|---------|
| `/api/generate-vibe` | ✅ AI (3/5min) | ✅ Full schema | ✅ Yes | ❌ Public |
| `/api/telegram-simple` | ✅ Public (10/15min) | ✅ Legacy system | ✅ Yes | ❌ Public |
| `/api/telegram-webhook` | ❌ None | ❌ None | ❌ None | ❌ None |
| `/api/namecard` | ❌ None | ❌ None | ❌ None | ❌ None |

## 🚨 Security Recommendations

### Immediate Actions
1. **Update remaining endpoints** to use `withSecurity` wrapper
2. **Configure admin API keys** for webhook and admin endpoints
3. **Set up monitoring** for security events
4. **Review logs regularly** for suspicious patterns

### Advanced Security (Future)
1. **JWT Authentication**: For user sessions
2. **IP Whitelisting**: For admin endpoints
3. **Request Signing**: For webhook verification
4. **Captcha Integration**: For public endpoints during high traffic
5. **Rate Limit by User**: Instead of just IP-based

### Monitoring & Alerts
Consider setting up alerts for:
- Multiple rate limit violations from same IP
- Failed API key attempts
- Unusual request patterns
- High error rates

## 🔍 Testing Security

### Rate Limiting Test
```bash
# Test rate limiting (should fail after 3 requests)
for i in {1..5}; do
  curl -X POST https://your-domain.com/api/generate-vibe \
    -H "Content-Type: application/json" \
    -d '{"projectIdea":"test","hasExperience":false,"name":"test"}'
  echo "Request $i"
done
```

### Origin Validation Test
```bash
# This should fail (wrong origin)
curl -X POST https://your-domain.com/api/generate-vibe \
  -H "Origin: https://malicious-site.com" \
  -H "Content-Type: application/json" \
  -d '{"projectIdea":"test","hasExperience":false,"name":"test"}'
```

### Input Validation Test
```bash
# This should fail (invalid input)
curl -X POST https://your-domain.com/api/generate-vibe \
  -H "Content-Type: application/json" \
  -d '{"projectIdea":"<script>alert(1)</script>","hasExperience":"invalid"}'
```

## 🚨 **CRITICAL ADDITIONAL RISKS & MITIGATIONS**

### **HIGH PRIORITY RISKS**

**1. OpenAI Cost Exploitation** 🔥
- **Risk**: Attackers drain AI credits with expensive requests
- **Mitigation**: Daily usage limits (50 AI requests/IP/day), prompt size limits (2000 tokens)
- **Implementation**: `EnhancedSecurity.validateAIRequest()`

**2. Unprotected Legacy Endpoints** 🔥  
- **Risk**: `/api/telegram-webhook`, `/api/namecard` have no security
- **Mitigation**: Apply `withSecurity` wrapper to all endpoints
- **Status**: ⚠️ NEEDS IMMEDIATE ATTENTION

**3. Advanced Bot Attacks** 🔶
- **Risk**: Sophisticated bots bypass basic rate limiting
- **Mitigation**: Bot detection, honeypots, payload size limits
- **Implementation**: `EnhancedSecurity.detectBot()`

### **IMPLEMENTED ENHANCEMENTS**

**✅ AI-Specific Protection**
- Daily usage limits per IP (50 requests/day)
- Prompt size limits (2000 tokens max)
- Cost monitoring and usage tracking
- Enhanced logging for AI operations

**✅ Advanced Bot Detection**
- User-Agent pattern matching
- Missing browser headers detection  
- Honeypot endpoints (`/api/admin`)
- Payload size validation (50KB max)

**✅ Geographic Restrictions**
- Country-based blocking (configurable)
- Enhanced IP detection (Cloudflare-aware)
- Threat intelligence logging

**✅ Security Monitoring**
- Automated threat detection script
- Alert system (Slack/Discord/Email)
- Security reports and recommendations
- Real-time threat intelligence

### **USAGE: Enhanced Security**

```typescript
// For AI endpoints (with cost protection)
import { withAISecurity } from '@/lib/enhanced-security';

export async function POST(request: NextRequest) {
  return withAISecurity(request, handler, options);
}

// For regular endpoints
import { withSecurity } from '@/lib/api-security';

export async function POST(request: NextRequest) {
  return withSecurity(request, handler, options);
}
```

### **MONITORING & ALERTING**

**Security Monitoring Script**:
```bash
# Run every 5 minutes
*/5 * * * * node /path/to/scripts/security-monitor.js
```

**Environment Variables for Alerts**:
```bash
SECURITY_WEBHOOK_URL=https://hooks.slack.com/services/...
SECURITY_EMAIL_API=https://your-email-service.com/send
```

## 📝 Updated Security Checklist

### Core Security ✅
- [x] Rate limiting implemented  
- [x] Input validation and sanitization
- [x] Origin/CORS protection
- [x] API key authentication system
- [x] Security event logging
- [x] Environment configuration

### Enhanced Security ✅
- [x] AI cost protection (daily limits, prompt size)
- [x] Advanced bot detection
- [x] Geographic restrictions
- [x] Payload size limits
- [x] Honeypot endpoints
- [x] Security monitoring script
- [x] Automated alerting system

### Immediate Actions Required ⚠️
- [ ] **Apply security to `/api/telegram-webhook`**
- [ ] **Apply security to `/api/namecard`** 
- [ ] **Set up monitoring alerts in production**
- [ ] **Configure geographic restrictions**
- [ ] **Set OpenAI usage budgets in OpenAI dashboard**

### Ongoing Maintenance 🔄
- [ ] Regular security audits (monthly)
- [ ] Review security logs (weekly)
- [ ] Update bot detection patterns (as needed)
- [ ] Monitor OpenAI costs (daily)
- [ ] Test security measures (quarterly)

---

**Last Updated**: January 2024  
**Review Date**: Every quarter or after major changes