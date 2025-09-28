import { NextRequest, NextResponse } from 'next/server';
import { ApiSecurity } from './api-security';

// Enhanced security measures for high-risk endpoints
export class EnhancedSecurity {
  
  // OpenAI cost protection
  static async validateAIRequest(request: NextRequest, prompt: string) {
    const promptTokens = this.estimateTokens(prompt);
    const dailyUsage = await this.getDailyUsage(request);
    
    // Block if exceeding daily limits
    if (dailyUsage.requests > 50) { // Max 50 AI requests per day per IP
      return NextResponse.json(
        { 
          error: 'daily_limit_exceeded',
          message: 'Daily AI generation limit reached. Try again tomorrow.',
          nextReset: this.getNextDayReset()
        },
        { status: 429 }
      );
    }
    
    // Block extremely large prompts
    if (promptTokens > 2000) {
      ApiSecurity.logSecurityEvent('LARGE_PROMPT_BLOCKED', request, { 
        estimatedTokens: promptTokens 
      });
      return NextResponse.json(
        { error: 'prompt_too_large', message: 'Request too complex' },
        { status: 400 }
      );
    }
    
    return null;
  }
  
  // Estimate token count (rough approximation)
  private static estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
  
  // Track daily usage per IP (in production, use Redis/database)
  private static dailyUsage = new Map<string, { requests: number, date: string }>();
  
  private static async getDailyUsage(request: NextRequest) {
    const ip = this.getClientIP(request);
    const today = new Date().toDateString();
    const usage = this.dailyUsage.get(ip);
    
    if (!usage || usage.date !== today) {
      this.dailyUsage.set(ip, { requests: 0, date: today });
      return { requests: 0, date: today };
    }
    
    return usage;
  }
  
  private static getNextDayReset(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }
  
  // Enhanced IP detection
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfIP = request.headers.get('cf-connecting-ip'); // Cloudflare
    
    return cfIP || realIP || forwarded?.split(',')[0] || 'unknown';
  }
  
  // Geographic restrictions (if needed)
  static validateGeography(request: NextRequest) {
    const country = request.headers.get('cf-ipcountry'); // Cloudflare header
    const blockedCountries = ['CN', 'RU', 'IR']; // Example blocked countries
    
    if (country && blockedCountries.includes(country)) {
      ApiSecurity.logSecurityEvent('GEO_BLOCKED', request, { country });
      return NextResponse.json(
        { error: 'geo_restricted', message: 'Service not available in your region' },
        { status: 403 }
      );
    }
    
    return null;
  }
  
  // Advanced bot detection
  static detectBot(request: NextRequest): boolean {
    const userAgent = request.headers.get('user-agent') || '';
    
    // Common bot patterns
    const botPatterns = [
      /bot/i, /crawl/i, /spider/i, /scrape/i,
      /python-requests/i, /curl/i, /wget/i,
      /postman/i, /insomnia/i
    ];
    
    // Missing common browser headers
    const hasAccept = request.headers.get('accept');
    const hasLanguage = request.headers.get('accept-language');
    const hasEncoding = request.headers.get('accept-encoding');
    
    const isBot = botPatterns.some(pattern => pattern.test(userAgent)) ||
                  !hasAccept || !hasLanguage || !hasEncoding;
    
    if (isBot) {
      ApiSecurity.logSecurityEvent('BOT_DETECTED', request, { userAgent });
    }
    
    return isBot;
  }
  
  // Payload size limits
  static validatePayloadSize(request: NextRequest) {
    const contentLength = request.headers.get('content-length');
    const maxSize = 50 * 1024; // 50KB max
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      ApiSecurity.logSecurityEvent('LARGE_PAYLOAD_BLOCKED', request, { 
        size: contentLength 
      });
      return NextResponse.json(
        { error: 'payload_too_large', message: 'Request body too large' },
        { status: 413 }
      );
    }
    
    return null;
  }
  
  // Honeypot endpoint for bot detection
  static createHoneypot() {
    return async (request: NextRequest) => {
      ApiSecurity.logSecurityEvent('HONEYPOT_TRIGGERED', request, {
        path: request.nextUrl.pathname
      });
      
      // Return fake success to waste attacker's time
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
      return NextResponse.json({ success: true });
    };
  }
  
  // Enhanced logging with threat intelligence
  static logThreatIntelligence(request: NextRequest, event: string, severity: 'low' | 'medium' | 'high') {
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent');
    const country = request.headers.get('cf-ipcountry');
    
    console.warn(`[THREAT-${severity.toUpperCase()}] ${event}`, {
      ip,
      userAgent,
      country,
      url: request.url,
      timestamp: new Date().toISOString(),
      severity
    });
    
    // In production, send to security monitoring service
    // e.g., Sentry, DataDog, CloudWatch, etc.
  }
  
  // Update daily usage counter
  static incrementDailyUsage(request: NextRequest) {
    const ip = this.getClientIP(request);
    const today = new Date().toDateString();
    const usage = this.dailyUsage.get(ip);
    
    if (!usage || usage.date !== today) {
      this.dailyUsage.set(ip, { requests: 1, date: today });
    } else {
      usage.requests++;
    }
  }
}

// Enhanced security wrapper for AI endpoints
export async function withAISecurity(
  request: NextRequest,
  handler: (request: NextRequest, securityResult?: any) => Promise<NextResponse>,
  options: Parameters<typeof ApiSecurity.validateRequest>[1] = {}
) {
  try {
    // Enhanced checks for AI endpoints first (before consuming request body)
    const payloadCheck = EnhancedSecurity.validatePayloadSize(request);
    if (payloadCheck) return payloadCheck;
    
    const geoCheck = EnhancedSecurity.validateGeography(request);
    if (geoCheck) return geoCheck;
    
    // Bot detection (warn but don't block for now)
    if (EnhancedSecurity.detectBot(request)) {
      EnhancedSecurity.logThreatIntelligence(request, 'BOT_ACCESS_AI_ENDPOINT', 'medium');
    }
    
    // Basic security checks (this handles input validation and sanitization)
    const basicSecurity = await ApiSecurity.validateRequest(request, {
      ...options,
      rateLimitType: 'ai'
    });
    
    if (basicSecurity && basicSecurity instanceof NextResponse) {
      return basicSecurity;
    }
    
    // AI-specific validation using sanitized input
    const sanitizedInput = basicSecurity?.sanitizedInput;
    if (sanitizedInput?.projectIdea) {
      const aiValidation = await EnhancedSecurity.validateAIRequest(request, sanitizedInput.projectIdea);
      if (aiValidation) return aiValidation;
    }
    
    // Increment usage counter
    EnhancedSecurity.incrementDailyUsage(request);
    
    // Call handler with sanitized input
    const response = await handler(request, basicSecurity);
    
    // Log successful AI generation for monitoring
    EnhancedSecurity.logThreatIntelligence(request, 'AI_GENERATION_SUCCESS', 'low');
    
    return response;
    
  } catch (error) {
    EnhancedSecurity.logThreatIntelligence(request, 'AI_ENDPOINT_ERROR', 'high');
    console.error('Enhanced security error details:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      requestUrl: request.url,
      requestMethod: request.method,
    });
    return NextResponse.json(
      { 
        error: 'internal_server_error',
        message: 'Security validation failed'
      },
      { status: 500 }
    );
  }
}