import { NextRequest, NextResponse } from 'next/server';
import { createRateLimit } from '@/lib/rate-limit';
import {
  detectSpam,
  checkDuplicateSubmission,
} from '@/lib/spam-detection';
import { sendPaymentEmail } from '@/lib/email';

// Rate limiting: 3 submissions per 5 minutes per IP
const rateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 3,
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Too many submissions. Please try again later.',
        },
        { status: 429 }
      );
    }

    const { formData, timestamp, userAgent } = await request.json();

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
      console.error('Missing Telegram configuration');
      return NextResponse.json(
        { error: 'Telegram configuration missing' },
        { status: 500 }
      );
    }

    // Server-side spam detection
    const spamCheck = detectSpam(formData);
    if (spamCheck.isSpam) {
      console.log('Spam detected:', spamCheck.reasons);
      return NextResponse.json(
        {
          error: 'spam_detected',
          message: 'Submission flagged as spam',
          reasons: spamCheck.reasons,
        },
        { status: 400 }
      );
    }

    // Check for duplicate submissions
    if (checkDuplicateSubmission(formData.email, formData.phone)) {
      return NextResponse.json(
        {
          error: 'duplicate',
          message:
            'You have already registered with this email/phone combination',
        },
        { status: 409 }
      );
    }

    const reference = generateReference(
      formData.name,
      formData.email
    );

    // Encode all registration data in the command for stateless operation
    const registrationData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      linkedinProfile: formData.linkedinProfile,
      hasExperience: formData.hasExperience,
      toolsUsed: formData.toolsUsed,
      projectIdea: formData.projectIdea,
      reference,
      timestamp: new Date().toISOString(),
    };

    const encodedData = Buffer.from(
      JSON.stringify(registrationData)
    ).toString('base64');

    // Send payment email immediately to participant
    try {
      await sendPaymentEmail(registrationData);
      console.log(
        'Payment email sent immediately to:',
        formData.email
      );
    } catch (emailError) {
      console.error('Failed to send payment email:', emailError);
      // Continue with Telegram notification even if email fails
    }

    // Create message with embedded data in commands
    const telegramMessage = `🎨 <b>NEW VIBE CODING REGISTRATION</b>

👤 <b>Name:</b> ${formData.name}
📧 <b>Email:</b> ${formData.email}
📱 <b>Phone:</b> ${formData.phone}${formData.linkedinProfile ? `
🔗 <b>LinkedIn:</b> ${formData.linkedinProfile}` : ''}
🔧 <b>Experience:</b> ${
      formData.hasExperience
        ? `Yes - ${formData.toolsUsed || 'Not specified'}`
        : 'No'
    }
💡 <b>Project Idea:</b> ${formData.projectIdea}

🆔 <b>Reference:</b> ${reference}
💰 <b>Payment:</b> $10 SGD
📅 <b>Submitted:</b> ${new Date().toLocaleString()}

✅ <b>Payment email sent to participant!</b>

<b>Actions:</b>
💳 Mark as Paid: /paid_${reference}
`;

    // Send message to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json();
      console.error('Telegram API error:', errorData);
      throw new Error('Failed to send message to Telegram');
    }

    console.log('Registration submitted:', {
      name: formData.name,
      email: formData.email,
      reference,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      reference,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    );
  }
}

function generateReference(name: string, email: string): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const emailPart = email
    .split('@')[0]
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${cleanName}_${emailPart}_${timestamp}`;
}
