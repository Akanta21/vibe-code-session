import { NextRequest, NextResponse } from 'next/server';
import { generateNamecard } from '@/lib/namecard';

export async function POST(request: NextRequest) {
  try {
    const { name, email, linkedinProfile } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const namecard = await generateNamecard({
      name,
      email,
      linkedinProfile,
      eventName: 'Vibe Coding Event',
      eventDate: 'Nov 13, 2025 • 6:30 PM - 9:00 PM',
      eventLocation: '182 Cecil St, #35-01 Frasers Tower, Singapore',
    });

    return new NextResponse(namecard as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${name.replace(
          /[^a-zA-Z0-9]/g,
          '_'
        )}_namecard.svg"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Namecard generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate namecard' },
      { status: 500 }
    );
  }
}
