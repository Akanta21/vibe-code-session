import { NextRequest, NextResponse } from 'next/server';

interface TelegramUpdate {
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    message?: {
      message_id: number;
      chat: {
        id: number;
        type: string;
      };
      text?: string;
    };
    data?: string;
  };
}

// Note: This webhook is now stateless - no in-memory storage
// In production, integrate with a database for full registration data persistence

const sendTelegramMessage = async (
  chatId: number,
  text: string,
  parseMode: string = 'HTML',
  replyMarkup?: any
) => {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  const payload: any = {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
};

const answerCallbackQuery = async (
  callbackQueryId: string,
  text?: string,
  showAlert?: boolean
) => {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || '',
        show_alert: showAlert || false,
      }),
    }
  );
};

const generatePaynowQR = (
  amount: number,
  reference: string,
  mobile?: string
) => {
  // Basic Paynow QR generation - you may want to use a proper library
  const paynowMobile =
    mobile || process.env.PAYNOW_MOBILE || '+65 9123 4567';

  // Simplified Paynow URL (in production, use proper QR generation)
  const paynowData = `paynow://pay?mobile=${paynowMobile}&amount=${amount}&ref=${reference}&editable=0`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    paynowData
  )}`;

  return {
    qrUrl,
    instructions: `
🏦 <b>Payment Instructions</b>

💰 <b>Amount:</b> $${amount} SGD
🆔 <b>Reference:</b> ${reference}
📱 <b>Mobile:</b> ${paynowMobile}

<b>Option 1:</b> Scan the QR code with your banking app
<b>Option 2:</b> Manual transfer using the mobile number and reference above

⚠️ <b>Important:</b> Please use the exact reference number for payment tracking.

After payment, send /paid_${reference} to confirm your registration.`,
  };
};

const handleConfirmCommand = async (
  chatId: number,
  reference: string
) => {
  // Stateless approach - no in-memory storage
  // In production, this would query your database for the registration details

  const payment = generatePaynowQR(10, reference);

  const confirmationMessage = `✅ <b>Registration Confirmed!</b>

Reference: ${reference} has been approved for payment.

${payment.instructions}

<b>⚠️ Stateless Mode:</b> Registration data not stored in memory.
Payment email should have been sent automatically to the attendee during initial registration.`;

  await sendTelegramMessage(chatId, confirmationMessage);

  return NextResponse.json({
    success: true,
    action: 'confirmed',
    reference,
  });
};

const handlePaidCallback = async (
  chatId: number,
  reference: string,
  callbackQueryId: string
) => {
  try {
    // Extract parts of the reference - new format: NAME_EMAIL_TIMESTAMP_LINKEDINPROFILE
    const parts = reference.split('_');

    if (parts.length < 3) {
      await answerCallbackQuery(
        callbackQueryId,
        `❌ Invalid reference format: ${reference}`,
        true
      );
      return NextResponse.json(
        { error: 'Invalid reference format' },
        { status: 400 }
      );
    }

    const namePart = parts[0];
    // parts[1] is emailPart, parts[2] is timestampPart - not needed for this function
    const linkedinPart =
      parts.length > 3 ? parts.slice(3).join('_') : ''; // Handle LinkedIn profile which might contain underscores

    const extractedName = namePart.replace(/([A-Z])/g, ' $1').trim();
    const hasLinkedInData =
      linkedinPart &&
      linkedinPart !== 'undefined' &&
      linkedinPart.trim() !== '';

    // Reconstruct full LinkedIn URL from handle
    const fullLinkedInURL = hasLinkedInData
      ? `https://linkedin.com/in/${linkedinPart}`
      : '';

    // Since we now have all the registration data in the reference, we can send the confirmation email directly!
    try {
      const { sendConfirmationEmail } = await import('@/lib/email');

      // Reconstruct the email from the reference parts - limitation: we only have the part before @
      const emailPartFromRef = parts[1];
      const reconstructedEmail = `${emailPartFromRef.toLowerCase()}@domain.com`;

      // Since we have LinkedIn data in the reference, we can create a more complete registration object
      const registrationData = {
        name: extractedName,
        email: reconstructedEmail, // Placeholder - we'll need the real email
        phone: '+65 0000 0000', // Placeholder
        company: 'Not specified', // Placeholder
        linkedinProfile: hasLinkedInData ? linkedinPart : '',
        hasExperience: false, // Placeholder
        toolsUsed: 'Various coding tools', // Placeholder
        projectIdea: 'An amazing coding project', // Placeholder
        reference,
        timestamp: new Date().toISOString(),
      };

      // Request the real email address since we can't reconstruct the full email from reference
      const emailRequestMessage = `💳 <b>Payment Confirmed!</b>

Reference: ${reference}
Status: ✅ PAID
Name: ${extractedName}${
        hasLinkedInData ? `\nLinkedIn: ${fullLinkedInURL}` : ''
      }

<b>📧 Enter Attendee's Email to Send Confirmation</b>
We have all the registration data${
        hasLinkedInData ? ' including LinkedIn profile' : ''
      }, but need the complete email address.

Please reply with:
<code>${reference}|attendee@email.com</code>

The confirmation email will include:
• Personalized namecard${
        hasLinkedInData ? ' with LinkedIn QR code' : ''
      }
• Event details and calendar invite
• All registration information`;

      await sendTelegramMessage(chatId, emailRequestMessage);
      await answerCallbackQuery(
        callbackQueryId,
        `💳 Payment marked! ${
          hasLinkedInData ? 'LinkedIn data found.' : ''
        } Please provide email address.`
      );

      return NextResponse.json({
        success: true,
        action: 'paid_email_request',
        reference,
        hasLinkedIn: hasLinkedInData,
      });
    } catch (error) {
      console.error('Error processing paid callback:', error);
      await answerCallbackQuery(
        callbackQueryId,
        '❌ Error processing payment confirmation',
        true
      );
      return NextResponse.json(
        { error: 'Failed to process payment confirmation' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing paid callback:', error);
    await answerCallbackQuery(
      callbackQueryId,
      '❌ Error processing payment confirmation',
      true
    );
    return NextResponse.json(
      { error: 'Failed to process payment confirmation' },
      { status: 500 }
    );
  }
};

const handleEmailCommand = async (
  chatId: number,
  reference: string,
  email: string,
  linkedinUsername?: string
) => {
  try {
    // Import the email function
    const { sendConfirmationEmail } = await import('@/lib/email');

    // Extract parts of the reference - new format: NAME_EMAIL_TIMESTAMP_LINKEDINPROFILE
    const parts = reference.split('_');

    if (parts.length < 3) {
      await sendTelegramMessage(
        chatId,
        `❌ Invalid reference format: ${reference}`
      );
      return NextResponse.json(
        { error: 'Invalid reference format' },
        { status: 400 }
      );
    }

    const namePart = parts[0];
    // parts[1] is emailPart, parts[2] is timestampPart - extracted when needed
    const linkedinFromReference =
      parts.length > 3 ? parts.slice(3).join('_') : '';

    // Use LinkedIn from reference if available, otherwise use the provided linkedinUsername
    let linkedinProfile = '';
    if (
      linkedinFromReference &&
      linkedinFromReference !== 'undefined' &&
      linkedinFromReference.trim() !== ''
    ) {
      // Reconstruct full URL from the sanitized handle
      linkedinProfile = `https://linkedin.com/in/${linkedinFromReference}`;
    } else if (linkedinUsername) {
      linkedinProfile = `https://linkedin.com/in/${linkedinUsername}`;
    }

    // Create registration object with the provided email and extracted/provided LinkedIn
    const registrationData = {
      name: namePart.replace(/([A-Z])/g, ' $1').trim(),
      email: email,
      phone: '+65 0000 0000', // Placeholder - would come from database in production
      company: 'Not specified', // Placeholder - would come from database in production
      linkedinProfile: linkedinProfile,
      hasExperience: false, // Would come from database in production
      toolsUsed: 'Various coding tools', // Placeholder
      projectIdea: 'An amazing coding project', // Placeholder - would come from database
      reference,
      timestamp: new Date().toISOString(),
    };

    // Send the confirmation email with namecard
    await sendConfirmationEmail(registrationData);

    const successMessage = `✅ <b>Confirmation Email Sent!</b>

Reference: ${reference}
Recipient: ${email}
Name: ${registrationData.name}${
      linkedinProfile ? `\nLinkedIn: ${linkedinProfile}` : ''
    }

<b>Email Contents:</b>
• Event confirmation and details
• Personalized namecard with QR code${
      linkedinProfile
        ? ' (QR links to LinkedIn)'
        : ' (QR links to email)'
    }
• Calendar invite (.ics file)

The attendee should now have received their confirmation email with namecard!`;

    await sendTelegramMessage(chatId, successMessage);

    return NextResponse.json({
      success: true,
      action: 'email_sent',
      reference,
      email: email,
      linkedinProfile: linkedinProfile || null,
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    await sendTelegramMessage(
      chatId,
      `❌ Failed to send confirmation email to ${email} for ${reference}. Error: ${errorMessage}`
    );
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
};

const handleEmailFormCallback = async (
  chatId: number,
  reference: string,
  callbackQueryId: string,
  includeLinkedIn: boolean = false
) => {
  const extractedName = reference
    .split('_')[0]
    .replace(/([A-Z])/g, ' $1')
    .trim();

  const formMessage = includeLinkedIn
    ? `📧 <b>Enter Contact Details</b>

Reference: ${reference}
Name: ${extractedName}

Please reply with the attendee's email and LinkedIn username in this format:
<code>${reference}|email@domain.com|linkedin-username</code>

<b>Example:</b>
<code>${reference}|john@example.com|john-doe</code>

<i>The LinkedIn username will create: https://linkedin.com/in/john-doe</i>`
    : `📧 <b>Enter Email Address</b>

Reference: ${reference}
Name: ${extractedName}

Please reply with the attendee's email address in this format:
<code>${reference}|email@domain.com</code>

<b>Example:</b>
<code>${reference}|john@example.com</code>

<i>The namecard QR code will link to this email address</i>`;

  await sendTelegramMessage(chatId, formMessage);
  await answerCallbackQuery(
    callbackQueryId,
    includeLinkedIn
      ? 'Please enter email and LinkedIn username'
      : 'Please enter email address'
  );

  return NextResponse.json({ success: true, action: 'form_sent' });
};

const handleRejectCallback = async (
  chatId: number,
  reference: string,
  callbackQueryId: string
) => {
  const rejectionMessage = `❌ <b>Registration Rejected</b>

Registration ${reference} has been rejected.

Reason: [Add reason here if needed]`;

  await sendTelegramMessage(chatId, rejectionMessage);
  await answerCallbackQuery(
    callbackQueryId,
    '❌ Registration rejected'
  );

  return NextResponse.json({
    success: true,
    action: 'rejected',
    reference,
  });
};

const handleStatsCommand = async (chatId: number) => {
  // Stateless approach - no in-memory tracking
  // In production, these stats would come from your database

  const statsMessage = `📊 <b>Registration Statistics</b>

<b>⚠️ Stateless Mode Active</b>
Registration statistics are not available in stateless mode.

<b>To get accurate stats:</b>
• Integrate with a database to track registrations
• Or check your email system/payment processor for counts
• Or implement session storage with external persistence

🎯 <b>Event Capacity:</b> 40 spots available
📅 <b>Event Date:</b> November 13, 2025
⏰ <b>Event Time:</b> 6:30 PM - 9:00 PM

<i>Last updated: ${new Date().toLocaleString()}</i>`;

  await sendTelegramMessage(chatId, statsMessage);

  return NextResponse.json({
    success: true,
    action: 'stats_stateless',
  });
};

const handleHelpCommand = async (chatId: number) => {
  const helpMessage = `🤖 <b>Vibe Coding Admin Bot</b>

<b>🏛️ Enhanced LinkedIn Integration</b>
Now automatically extracts LinkedIn data from registrations!

<b>📋 Super Simple Workflow:</b>
1. New registration arrives with LinkedIn data → Click <b>"💳 Mark as Paid"</b>
2. Bot detects LinkedIn profile → Requests only email address
3. Reply with: <code>REFERENCE|attendee@email.com</code>
4. Confirmation email sent with LinkedIn namecard automatically! 🎉

<b>📧 Email Entry Format:</b>
<code>REFERENCE|attendee@email.com</code>

<b>Example:</b>
<code>JOHN_DOE_123_linkedin.com/in/john-doe|john@example.com</code>

<b>✨ What You Get:</b>
• LinkedIn data automatically extracted from registration
• Personalized namecard with LinkedIn QR code
• Professional networking-ready contact card
• Event details and calendar invite
• Streamlined one-step confirmation process

<b>💡 Legacy Commands:</b>
/confirm_[REFERENCE] - Manual approval for special cases
/stats - Show event information
/help - Show this help message

<i>🚀 Now with automatic LinkedIn integration - no manual entry needed!</i>`;

  await sendTelegramMessage(chatId, helpMessage);

  return NextResponse.json({ success: true, action: 'help' });
};

export async function POST(request: NextRequest) {
  try {
    const body: TelegramUpdate = await request.json();

    // Handle callback queries (button presses)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const chatId = callbackQuery.message?.chat.id;
      const callbackData = callbackQuery.data;

      if (!chatId || !callbackData) {
        return NextResponse.json({ ok: true });
      }

      // Handle different callback types
      if (callbackData.startsWith('paid_')) {
        const reference = callbackData
          .replace('paid_', '')
          .toUpperCase();
        return await handlePaidCallback(
          chatId,
          reference,
          callbackQuery.id
        );
      }

      if (callbackData.startsWith('reject_')) {
        const reference = callbackData
          .replace('reject_', '')
          .toUpperCase();
        return await handleRejectCallback(
          chatId,
          reference,
          callbackQuery.id
        );
      }

      if (callbackData.startsWith('email_form_')) {
        const reference = callbackData
          .replace('email_form_', '')
          .toUpperCase();
        return await handleEmailFormCallback(
          chatId,
          reference,
          callbackQuery.id,
          false
        );
      }

      if (callbackData.startsWith('email_linkedin_form_')) {
        const reference = callbackData
          .replace('email_linkedin_form_', '')
          .toUpperCase();
        return await handleEmailFormCallback(
          chatId,
          reference,
          callbackQuery.id,
          true
        );
      }

      if (callbackData.startsWith('cancel_')) {
        await answerCallbackQuery(
          callbackQuery.id,
          'Action cancelled'
        );
        return NextResponse.json({ ok: true });
      }

      // Unknown callback
      await answerCallbackQuery(callbackQuery.id, 'Unknown action');
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    // Handle pipe-separated email input (REFERENCE|email@domain.com|linkedin-username)
    if (text.includes('|')) {
      const parts = text.split('|');
      if (parts.length >= 2) {
        const reference = parts[0].toUpperCase();
        const email = parts[1].toLowerCase();
        const linkedinUsername =
          parts.length >= 3 ? parts[2].toLowerCase() : undefined;

        if (email.includes('@')) {
          return await handleEmailCommand(
            chatId,
            reference,
            email,
            linkedinUsername
          );
        }
      }
    }

    const textLower = text.toLowerCase();

    // Handle different commands
    if (textLower.startsWith('/confirm_')) {
      const reference = textLower
        .replace('/confirm_', '')
        .toUpperCase();
      return await handleConfirmCommand(chatId, reference);
    }

    if (textLower.startsWith('/paid_')) {
      // Legacy command support - redirect to callback-style handling
      await sendTelegramMessage(
        chatId,
        `ℹ️ <b>Please use the buttons instead</b>\n\nThe /paid_ command has been replaced with interactive buttons for easier use. When you receive a registration, click the "💳 Mark as Paid" button instead.`
      );
      return NextResponse.json({
        success: true,
        message: 'Legacy command redirected',
      });
    }

    if (textLower.startsWith('/email_')) {
      // Legacy command support
      await sendTelegramMessage(
        chatId,
        `ℹ️ <b>Please use the new format</b>\n\nThe /email_ command has been simplified. Use the pipe format instead:\n<code>REFERENCE|email@domain.com</code> or <code>REFERENCE|email@domain.com|linkedin-username</code>`
      );
      return NextResponse.json({
        success: true,
        message: 'Legacy command redirected',
      });
    }

    if (textLower.startsWith('/reject_')) {
      // Legacy command support
      await sendTelegramMessage(
        chatId,
        `ℹ️ <b>Please use the buttons instead</b>\n\nThe /reject_ command has been replaced with interactive buttons. When you receive a registration, click the "❌ Reject" button instead.`
      );
      return NextResponse.json({
        success: true,
        message: 'Legacy command redirected',
      });
    }

    if (textLower === '/stats') {
      return await handleStatsCommand(chatId);
    }

    if (textLower === '/help' || textLower === '/start') {
      return await handleHelpCommand(chatId);
    }

    // Default response for unrecognized commands
    await sendTelegramMessage(
      chatId,
      `❓ Unknown command. Send /help for available commands.`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
