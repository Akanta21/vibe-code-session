import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { withSecurity, schemas } from '@/lib/api-security';

export async function POST(request: NextRequest) {
  return withSecurity(
    request,
    async (req: NextRequest, securityResult: any) => {
      const { projectIdea, hasExperience = false, toolsUsed, name } = securityResult.sanitizedInput;

      // Create the prompt for AI to generate vibe-code format
      const prompt = `You are a creative UX/UI designer helping a participant named ${name} expand their project idea into a comprehensive "vibe code" specification.

Based on their project idea: "${projectIdea}"
Experience level: ${hasExperience ? `Yes - Tools used: ${toolsUsed || 'Not specified'}` : 'No previous experience'}

Generate a detailed vibe code specification following this exact format:

**Core Purpose:** [One clear sentence describing what they're building]

**Visual Vibe:**
- [4-6 specific visual/aesthetic descriptions using vivid language]
- [Include colors, typography, animations, layouts]
- [Make it inspiring and concrete, not generic]

**Core Features:**
- [5-7 key functional requirements]
- [Be specific but not overly technical]
- [Focus on user-facing features]

**Interaction Style:**
- [3-5 descriptions of how it should feel to use]
- [Include animation timing, feedback, responsiveness]

**Technical Constraints:**
- [3-4 practical constraints based on their experience level]
- [If beginner: suggest simpler tech stack]
- [If experienced: can be more ambitious]

**Reference Vibes:**
- [3-4 comparisons to existing products/designs]
- [Use format "X's Y but more Z"]

Guidelines:
1. Be specific with adjectives - avoid "clean" or "modern"
2. Describe feelings and emotions the app should evoke
3. Match technical complexity to their experience level
4. Make it inspirational but achievable
5. Use evocative, creative language
6. If their idea is vague, intelligently expand it with creative details

Make this feel like a professional creative brief that would excite them to build it.`;

      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key not configured');
        return NextResponse.json({
          error: 'service_unavailable',
          message: 'AI service not configured'
        }, { status: 503 });
      }

      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        prompt,
        temperature: 0.7,
      });

      return NextResponse.json({
        success: true,
        vibeCode: text,
        timestamp: new Date().toISOString(),
      });
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