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

    const { formData } = await request.json();

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
      formData.email,
      formData.linkedinProfile
    );

    // Encode all registration data in the command for stateless operation
    const registrationData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      linkedinProfile: formData.linkedinProfile,
      hasExperience: formData.hasExperience,
      toolsUsed: formData.toolsUsed,
      projectIdea: formData.projectIdea,
      reference,
      timestamp: new Date().toISOString(),
    };

    // Call vibing webhook for new registration
    try {
      const webhookResponse = await fetch(
        process.env.VIBING_WEBHOOK_URL ||
          'https://your-worker-url.workers.dev/webhook/vibing',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Vibing-Signature':
              process.env.VIBING_WEBHOOK_SECRET ||
              'your-webhook-secret',
          },
          body: JSON.stringify({
            id: registrationData.reference,
            name: registrationData.name,
            email: registrationData.email,
            phone: registrationData.phone,
            company: registrationData.company || 'Not specified',
            registration_time: registrationData.timestamp,
            event_title: 'Vibe Coding Nov 2025',
            event_date: '2025-11-06',
            payment_status: 'pending',
          }),
        }
      );

      if (!webhookResponse.ok) {
        console.error(
          'Vibing webhook failed:',
          webhookResponse.status,
          webhookResponse.statusText
        );
      } else {
        console.log(
          'Vibing webhook call successful for new registration'
        );
      }
    } catch (webhookError) {
      console.error(
        'Error calling vibing webhook for new registration:',
        webhookError
      );
      // Continue with registration process even if webhook fails
    }

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
📱 <b>Phone:</b> ${formData.phone}${
      formData.company
        ? `
🏢 <b>Company:</b> ${formData.company}`
        : ''
    }${
      formData.linkedinProfile
        ? `
🔗 <b>LinkedIn:</b> ${formData.linkedinProfile}`
        : ''
    }
🔧 <b>Experience:</b> ${
      formData.hasExperience
        ? `Yes - ${formData.toolsUsed || 'Not specified'}`
        : 'No'
    }
💡 <b>Project Idea:</b> ${formData.projectIdea}

🆔 <b>Reference:</b> ${reference}
💰 <b>Payment:</b> $10 SGD
📅 <b>Submitted:</b> ${new Date().toLocaleString()}

✅ <b>Payment email sent to participant!</b>`

    // Create inline keyboard with action buttons
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '💳 Mark as Paid',
              callback_data: `paid_${reference}`,
            },
          ],
        ],
      },
    };
    const body = JSON.stringify({
      chat_id: ADMIN_CHAT_ID,
      text: telegramMessage,
      parse_mode: 'HTML',
      ...inlineKeyboard,
    });

    console.log('Body:', body);

    // Send message to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      }
    );

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json();
      console.error('Telegram API error:', errorData);
      throw new Error('Failed to send message to Telegram');
    }

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

function generateReference(
  name: string,
  email: string,
  linkedinProfile: string
): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const emailPart = email.toUpperCase();
  const timestamp = Date.now().toString().slice(-4);

  // Extract just the LinkedIn handle from the full URL
  let linkedinHandle = '';
  if (linkedinProfile && linkedinProfile.trim()) {
    // Remove https://linkedin.com/in/ or https://www.linkedin.com/in/ prefix
    linkedinHandle = linkedinProfile
      .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')
      .replace(/\/$/, '') // Remove trailing slash
      .replace(/[^a-zA-Z0-9\-]/g, '') // Keep only alphanumeric and hyphens
      .toLowerCase();
  }

  return linkedinHandle
    ? `${cleanName}_${emailPart}_${linkedinHandle}`
    : `${cleanName}_${emailPart}_${timestamp}`;
}
