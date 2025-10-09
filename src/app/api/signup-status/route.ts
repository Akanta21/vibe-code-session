import { NextResponse } from 'next/server';

export async function GET() {
  const signupsDisabled = process.env.SIGNUPS_DISABLED === 'true';
  
  return NextResponse.json({
    enabled: !signupsDisabled,
    message: signupsDisabled 
      ? 'Registration is currently closed. Thank you for your interest!' 
      : undefined
  });
}