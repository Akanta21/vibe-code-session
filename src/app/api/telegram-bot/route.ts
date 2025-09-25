import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentEmail, sendConfirmationEmail } from '@/lib/email';

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
}

const sendTelegramMessage = async (
  chatId: number,
  text: string,
  parseMode: string = 'HTML'
) => {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    }
  );
};

const generatePaynowQR = (
  amount: number,
  reference: string,
  mobile?: string
) => {
  const paynowMobile =
    mobile || process.env.PAYNOW_MOBILE || '+65 9123 4567';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `paynow://pay?mobile=${paynowMobile}&amount=${amount}&ref=${reference}&editable=0`
  )}`;

  return {
    qrUrl,
    instructions: `🏦 <b>Payment Instructions</b>

💰 <b>Amount:</b> $${amount} SGD
🆔 <b>Reference:</b> ${reference}
📱 <b>Mobile:</b> ${paynowMobile}

<a href="${qrUrl}">📱 View QR Code</a>

<b>Payment Options:</b>
1. Scan QR code with your banking app
2. Manual PayNow transfer using mobile: ${paynowMobile}

⚠️ <b>Important:</b> Use reference: <code>${reference}</code>

Reply with <code>/paid_${reference}</code> when payment is complete.`,
  };
};

const decodeRegistrationData = (encodedData: string) => {
  try {
    return JSON.parse(Buffer.from(encodedData, 'base64').toString());
  } catch (error) {
    console.error('Failed to decode registration data:', error);
    return null;
  }
};

const handleApproveCommand = async (
  chatId: number,
  encodedData: string
) => {
  const registration = decodeRegistrationData(encodedData);

  if (!registration) {
    await sendTelegramMessage(
      chatId,
      `❌ Invalid registration data. Please use the original approve command.`
    );
    return NextResponse.json(
      { error: 'Invalid data' },
      { status: 400 }
    );
  }

  try {
    // Send payment email to participant
    await sendPaymentEmail(registration);

    // Notify admin in Telegram
    const adminNotification = `✅ <b>REGISTRATION APPROVED & EMAIL SENT</b>

<b>Participant:</b> ${registration.name} (${registration.email})
<b>Reference:</b> ${registration.reference}

📧 Payment email with QR code sent to participant.

<b>Next steps:</b>
💳 When paid: /paid_${registration.reference}
📋 Resend email: /resend_${registration.reference}`;

    await sendTelegramMessage(chatId, adminNotification);

    return NextResponse.json({
      success: true,
      action: 'approved',
      reference: registration.reference,
    });
  } catch (error) {
    console.error('Failed to send payment email:', error);

    await sendTelegramMessage(
      chatId,
      `❌ <b>ERROR</b>

Failed to send payment email to ${registration.email}.
Please check email configuration and try again.

Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    return NextResponse.json(
      { error: 'Email sending failed' },
      { status: 500 }
    );
  }
};

const handleRejectCommand = async (
  chatId: number,
  encodedData: string
) => {
  const registration = decodeRegistrationData(encodedData);

  if (!registration) {
    await sendTelegramMessage(
      chatId,
      `❌ Invalid registration data.`
    );
    return NextResponse.json(
      { error: 'Invalid data' },
      { status: 400 }
    );
  }

  const rejectionMessage = `❌ <b>REGISTRATION REJECTED</b>

Registration for ${registration.name} (${registration.email}) has been rejected.

Reference: ${registration.reference}
Reason: [You can add reason here]`;

  await sendTelegramMessage(chatId, rejectionMessage);

  return NextResponse.json({
    success: true,
    action: 'rejected',
    reference: registration.reference,
  });
};

const handlePaidCommand = async (
  chatId: number,
  reference: string,
  encodedData?: string
) => {
  // Try to get registration data if provided, otherwise create minimal data
  let registration = encodedData
    ? decodeRegistrationData(encodedData)
    : null;

  if (!registration) {
    // Create minimal registration data for email (you might want to store this differently)
    registration = {
      name: 'Participant', // You might want to ask admin to provide this
      email: 'participant@example.com', // You might want to ask admin to provide this
      phone: '',
      hasExperience: false,
      toolsUsed: '',
      projectIdea: 'Workshop Project',
      reference,
      timestamp: new Date().toISOString(),
    };

    await sendTelegramMessage(
      chatId,
      `⚠️ <b>LIMITED INFO AVAILABLE</b>

To send confirmation email, I need participant details.
Please use: /paid_${reference}_email@example.com_ParticipantName

Or registration was approved earlier with full data.`
    );

    return NextResponse.json({
      success: true,
      action: 'paid_partial',
      reference,
    });
  }

  try {
    // Send confirmation email to participant
    await sendConfirmationEmail(registration);

    // Notify admin in Telegram
    const adminNotification = `💳 <b>PAYMENT CONFIRMED & EMAIL SENT</b>

<b>Participant:</b> ${registration.name} (${registration.email})
<b>Reference:</b> ${registration.reference}
<b>Status:</b> ✅ FULLY CONFIRMED

📧 Event confirmation email with details sent to participant.

🎯 Participant is now fully registered for Vibe Coding!`;

    await sendTelegramMessage(chatId, adminNotification);

    return NextResponse.json({
      success: true,
      action: 'paid',
      reference,
    });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);

    await sendTelegramMessage(
      chatId,
      `❌ <b>EMAIL ERROR</b>

Payment marked as confirmed for ${reference}, but failed to send confirmation email.

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Please manually contact participant or retry email sending.`
    );

    return NextResponse.json(
      { error: 'Email sending failed', reference },
      { status: 500 }
    );
  }
};

const handleHelpCommand = async (chatId: number) => {
  const helpMessage = `🤖 <b>Vibe Coding Registration Bot</b>

<b>📧 Email-Powered Registration Flow:</b>

<b>Available Commands:</b>
• <code>/approve_[DATA]</code> - Approve & send payment email to participant
• <code>/reject_[DATA]</code> - Reject registration (from registration message)
• <code>/paid_[REFERENCE]</code> - Mark as paid & send confirmation email

<b>How it works:</b>
1. 📝 User submits registration → You get notification here
2. ✅ Click <code>/approve_[DATA]</code> → Participant gets payment email with QR
3. 💳 When payment received → Use <code>/paid_[REFERENCE]</code>
4. 🎉 Participant gets confirmation email with event card & details

<b>✨ Features:</b>
• Professional HTML emails with QR codes
• Event cards and detailed instructions
• Automatic payment tracking by reference
• No database - all data in commands

<b>📧 Email Provider:</b> Resend
<b>💳 Payment:</b> PayNow QR codes

<i>Participants get beautiful emails, you manage via Telegram! 🚀</i>`;

  await sendTelegramMessage(chatId, helpMessage);

  return NextResponse.json({ success: true, action: 'help' });
};

export async function POST(request: NextRequest) {
  try {
    const body: TelegramUpdate = await request.json();

    const message = body.message;
    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.toLowerCase();

    // Handle different commands
    if (text.startsWith('/approve_')) {
      const encodedData = text.replace('/approve_', '');
      return await handleApproveCommand(chatId, encodedData);
    }

    if (text.startsWith('/reject_')) {
      const encodedData = text.replace('/reject_', '');
      return await handleRejectCommand(chatId, encodedData);
    }

    if (text.startsWith('/paid_')) {
      const reference = text.replace('/paid_', '').toUpperCase();
      return await handlePaidCommand(chatId, reference);
    }

    if (text === '/help' || text === '/start') {
      return await handleHelpCommand(chatId);
    }

    // Default response
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
