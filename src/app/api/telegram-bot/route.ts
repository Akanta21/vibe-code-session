import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentEmail, sendConfirmationEmail } from '@/lib/email';
import { reference } from 'three/tsl';

interface TelegramUpdate {
  callback_query: {
    data?: string;
    message: {
      chat: {
        id: number;
      };
    };
  };
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
  commandData: string,
  encodedData?: string
) => {
  // Try to get registration data if provided, otherwise parse from command
  let registration = encodedData
    ? decodeRegistrationData(encodedData)
    : null;

  if (!registration) {
    // Try to parse participant data from command format: REFERENCE_email_name
    const parts = commandData.split('_');

    if (parts.length >= 3) {
      // Extract reference, email and name from command
      const baseRef = parts[0].toUpperCase(); //referenceNumber
      const email = parts[1]; //email;
      const name = parts
        .slice(2)
        .join(' ')
        .replace(/([A-Z])/g, ' $1')
        .trim(); // Handle camelCase names

      registration = {
        name: name || 'Participant',
        email: email || 'participant@example.com',
        linkedinProfile: `https://linkedin.com/in/${name}`,
        phone: '',
        company: '',
        hasExperience: false,
        toolsUsed: '',
        projectIdea: 'Workshop Project',
        reference: baseRef,
        timestamp: new Date().toISOString(),
      };
    } else {
      // Fallback - treat whole command as reference
      const reference = commandData.toUpperCase();
      registration = {
        name: 'Participant',
        email: 'participant@example.com',
        linkedinProfile: '',
        phone: '',
        company: '',
        hasExperience: false,
        toolsUsed: '',
        projectIdea: 'Workshop Project',
        reference,
        timestamp: new Date().toISOString(),
      };
    }
  }

  try {
    console.log(
      'Sending confirmation email to participant:',
      registration
    );

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
      reference: registration.reference,
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

    console.log('Body:', body);

    const callback_query = body.callback_query;
    if (!callback_query?.data) {
      return NextResponse.json({ ok: true });
    }

    const chatId = callback_query.message.chat.id;
    const data = callback_query.data?.toLowerCase();

    // Handle different commands
    if (data.startsWith('approve_')) {
      const encodedData = data.replace('approve_', '');
      return await handleApproveCommand(chatId, encodedData);
    }

    if (data.startsWith('reject_')) {
      const encodedData = data.replace('reject_', '');
      return await handleRejectCommand(chatId, encodedData);
    }

    if (data.startsWith('paid_')) {
      const fullCommand = data.replace('paid_', '');
      return await handlePaidCommand(chatId, fullCommand);
    }

    if (data === 'help' || data === 'start') {
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
