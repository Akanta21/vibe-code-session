import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, schemas } from '@/lib/api-security';
import { generateVibeCode } from '@/lib/generate-vibe';

export async function POST(request: NextRequest) {
  return withSecurity(
    request,
    async (req: NextRequest, securityResult: any) => {
      const { projectIdea, hasExperience = false, toolsUsed, name } = securityResult.sanitizedInput;

      const result = await generateVibeCode({
        projectIdea,
        hasExperience,
        toolsUsed,
        name,
      });

      if (result.success) {
        return NextResponse.json({
          success: true,
          vibeCode: result.vibeCode,
          timestamp: result.timestamp,
        });
      } else {
        const statusCode = result.error === 'AI service not configured' ? 503 : 503;
        return NextResponse.json({
          error: result.error === 'AI service not configured' ? 'service_unavailable' : 'ai_service_error',
          message: result.error,
        }, { status: statusCode });
      }
    },
    {
      rateLimitType: 'ai',
      validateOrigin: true,
      inputSchema: {
        projectIdea: schemas.projectIdea,
        hasExperience: { required: false, type: 'boolean' }, // Allow undefined, will default to false
        toolsUsed: { required: false, type: 'string', maxLength: 200, sanitize: true },
        name: schemas.name,
      }
    }
  );
}