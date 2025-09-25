// Simple in-memory rate limiting (for production, use Redis or database)
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyGenerator?: (req: Request) => string // Custom key generator
}

export function createRateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator } = config

  return async (req: Request): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
    // Generate key (default: IP address)
    const key = keyGenerator ? keyGenerator(req) : getClientIP(req)
    
    const now = Date.now()
    const entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      }
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Increment counter
    entry.count++
    rateLimitStore.set(key, entry)

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }
}

function getClientIP(req: Request): string {
  // Try to get IP from various headers
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to a default key
  return 'unknown'
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  const keysToDelete: string[] = []
  
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key)
    }
  })
  
  keysToDelete.forEach(key => {
    rateLimitStore.delete(key)
  })
}, 60000) // Clean up every minute