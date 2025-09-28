// Honeypot endpoint - logs bot activity
import { NextRequest } from 'next/server';
import { EnhancedSecurity } from '@/lib/enhanced-security';

export async function GET(request: NextRequest) {
  return EnhancedSecurity.createHoneypot()(request);
}

export async function POST(request: NextRequest) {
  return EnhancedSecurity.createHoneypot()(request);
}