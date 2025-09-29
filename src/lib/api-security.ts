import { NextRequest, NextResponse } from 'next/server';
import { createRateLimit } from './rate-limit';

// Security configuration
export const SECURITY_CONFIG = {
  // Rate limits per endpoint type
  rateLimits: {
    // Public endpoints (signup, etc.)
    public: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10, // 10 requests per 15 min
    },
    // AI generation endpoint (more expensive)
    ai: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 3, // 3 requests per 5 min
    },
    // Admin endpoints
    admin: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 50, // Higher limit for admins
    },
  },

  // Allowed origins for CORS
  allowedOrigins: [
    'http://localhost:3000',
    'https://vibe-coding.pages.dev',
    'https://*.pages.dev', // Cloudflare Pages preview URLs
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean),

  // API keys (from environment)
  apiKeys: {
    admin: process.env.ADMIN_API_KEY,
    internal: process.env.INTERNAL_API_KEY,
  },
};

// Rate limiters for different endpoint types
export const rateLimiters = {
  public: createRateLimit(SECURITY_CONFIG.rateLimits.public),
  ai: createRateLimit(SECURITY_CONFIG.rateLimits.ai),
  admin: createRateLimit(SECURITY_CONFIG.rateLimits.admin),
};

// Input validation schemas
export const schemas = {
  projectIdea: {
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 500,
    sanitize: true,
  },
  name: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 100,
    sanitize: true,
  },
  email: {
    required: true,
    type: 'string',
    pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
    maxLength: 255,
  },
  phone: {
    required: true,
    type: 'string',
    pattern: /^[+]?[\d\s\-()]{8,}$/,
    maxLength: 20,
  },
};

// Security middleware functions
export class ApiSecurity {
  // Apply rate limiting
  static async applyRateLimit(
    request: NextRequest,
    type: keyof typeof rateLimiters
  ) {
    const rateLimit = rateLimiters[type];
    const result = await rateLimit(request);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          message: `Too many requests. Try again in ${Math.ceil(
            result.resetTime / 1000
          )} seconds.`,
          retryAfter: result.resetTime,
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(
              result.resetTime / 1000
            ).toString(),
            'X-RateLimit-Limit':
              SECURITY_CONFIG.rateLimits[type].maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
          },
        }
      );
    }

    return null; // No rate limit hit
  }

  // Validate API key
  static validateApiKey(
    request: NextRequest,
    requiredLevel: 'admin' | 'internal'
  ) {
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = SECURITY_CONFIG.apiKeys[requiredLevel];

    if (!expectedKey) {
      console.warn(
        `API key not configured for level: ${requiredLevel}`
      );
      return false;
    }

    return apiKey === expectedKey;
  }

  // Validate request origin
  static validateOrigin(request: NextRequest) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    // Allow requests without origin (e.g., direct API calls in dev)
    if (!origin && !referer) {
      return process.env.NODE_ENV === 'development';
    }

    const requestOrigin =
      origin || (referer ? new URL(referer).origin : '');
    console.log('requestOrigin', requestOrigin);

    console.log(
      'SECURITY_CONFIG.allowedOrigins',
      SECURITY_CONFIG.allowedOrigins
    );

    return SECURITY_CONFIG.allowedOrigins.some((allowed) => {
      if (!allowed) return false;
      if (allowed.includes('*')) {
        // Wildcard matching for preview URLs
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(requestOrigin);
      }
      return requestOrigin === allowed;
    });
  }

  // Validate and sanitize input
  static validateInput(data: any, schema: Record<string, any>) {
    const errors: Record<string, string> = {};
    const sanitized: Record<string, any> = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Check required fields (handle booleans properly)
      if (
        rules.required &&
        (value === undefined ||
          value === null ||
          (typeof value === 'string' && !value.trim()))
      ) {
        errors[field] = `${field} is required`;
        continue;
      }

      // Skip validation for optional empty fields (but not false booleans)
      if (
        (value === undefined ||
          value === null ||
          (typeof value === 'string' && !value.trim())) &&
        !rules.required
      ) {
        continue;
      }

      // Type validation
      if (rules.type && typeof value !== rules.type) {
        errors[field] = `${field} must be a ${rules.type}`;
        continue;
      }

      // String length validation
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors[
            field
          ] = `${field} must be at least ${rules.minLength} characters`;
          continue;
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors[
            field
          ] = `${field} must be no more than ${rules.maxLength} characters`;
          continue;
        }
      }

      // Pattern validation
      if (
        rules.pattern &&
        typeof value === 'string' &&
        !rules.pattern.test(value)
      ) {
        errors[field] = `${field} format is invalid`;
        continue;
      }

      // Sanitization
      let sanitizedValue = value;
      if (rules.sanitize && typeof value === 'string') {
        sanitizedValue = this.sanitizeString(value);
      }

      sanitized[field] = sanitizedValue;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: sanitized,
    };
  }

  // Sanitize string input
  private static sanitizeString(input: string): string {
    return (
      input
        .trim()
        // Remove potential XSS characters
        .replace(/[<>\"']/g, '')
        // Normalize whitespace
        .replace(/\\s+/g, ' ')
        // Remove null bytes
        .replace(/\\0/g, '')
    );
  }

  // Log security events
  static logSecurityEvent(
    event: string,
    request: NextRequest,
    details?: any
  ) {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    console.warn(`[SECURITY] ${event}`, {
      ip,
      userAgent: request.headers.get('user-agent'),
      url: request.url,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  // Comprehensive security check
  static async validateRequest(
    request: NextRequest,
    options: {
      rateLimitType?: keyof typeof rateLimiters;
      requireApiKey?: 'admin' | 'internal';
      validateOrigin?: boolean;
      inputSchema?: Record<string, any>;
    } = {}
  ) {
    const {
      rateLimitType,
      requireApiKey,
      validateOrigin = true,
      inputSchema,
    } = options;

    // Rate limiting
    if (rateLimitType) {
      const rateLimitResult = await this.applyRateLimit(
        request,
        rateLimitType
      );
      if (rateLimitResult) {
        this.logSecurityEvent('RATE_LIMIT_EXCEEDED', request, {
          type: rateLimitType,
        });
        return rateLimitResult;
      }
    }

    // API key validation
    if (requireApiKey) {
      if (!this.validateApiKey(request, requireApiKey)) {
        this.logSecurityEvent('INVALID_API_KEY', request, {
          requiredLevel: requireApiKey,
        });
        return NextResponse.json(
          {
            error: 'unauthorized',
            message: 'Invalid or missing API key',
          },
          { status: 401 }
        );
      }
    }

    // Origin validation
    if (validateOrigin && !this.validateOrigin(request)) {
      this.logSecurityEvent('INVALID_ORIGIN', request, {
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      });
      return NextResponse.json(
        { error: 'forbidden', message: 'Request origin not allowed' },
        { status: 403 }
      );
    }

    // Input validation (if body is provided)
    if (
      inputSchema &&
      (request.method === 'POST' || request.method === 'PUT')
    ) {
      try {
        const body = await request.json();
        const validation = this.validateInput(body, inputSchema);

        if (!validation.isValid) {
          this.logSecurityEvent('INVALID_INPUT', request, {
            errors: validation.errors,
          });
          return NextResponse.json(
            { error: 'validation_error', errors: validation.errors },
            { status: 400 }
          );
        }

        // Return sanitized data for use in the endpoint
        return { sanitizedInput: validation.data };
      } catch (error) {
        this.logSecurityEvent('MALFORMED_JSON', request, {
          error: (error as Error).message,
        });
        return NextResponse.json(
          {
            error: 'invalid_json',
            message: 'Malformed JSON in request body',
          },
          { status: 400 }
        );
      }
    }

    return null; // All validations passed
  }
}

// Helper function for endpoint protection
export async function withSecurity(
  request: NextRequest,
  handler: (
    request: NextRequest,
    securityResult?: any
  ) => Promise<NextResponse>,
  options: Parameters<typeof ApiSecurity.validateRequest>[1] = {}
) {
  try {
    const securityResult = await ApiSecurity.validateRequest(
      request,
      options
    );

    // If security check returned a response, it means validation failed
    if (securityResult && securityResult instanceof NextResponse) {
      return securityResult;
    }

    // Call the actual handler with security result (contains sanitized input if applicable)
    return await handler(request, securityResult);
  } catch (error) {
    ApiSecurity.logSecurityEvent('HANDLER_ERROR', request, {
      error: (error as Error).message,
    });
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'internal_server_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
