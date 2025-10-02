import { Resend } from 'resend';
import { generateNamecard } from './namecard';

// Generate Google Calendar invite content
function generateCalendarInvite(
  registration: RegistrationData
): string {
  // Keep dates in Singapore timezone format for ICS
  const formatDateSGT = (dateString: string): string => {
    // Remove timezone info and format as YYYYMMDDTHHMMSS for local time
    return dateString.replace(/[-:]/g, '').replace('+08:00', '');
  };

  const startDateSGT = formatDateSGT('2025-11-06T18:30:00+08:00'); // 6:30 PM SGT
  const endDateSGT = formatDateSGT('2025-11-06T21:00:00+08:00'); // 9:00 PM SGT

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Vibe Coding//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:vibe-coding-${registration.reference}@vibecoding.event
DTSTART:${startDateSGT}
DTEND:${endDateSGT}
DTSTAMP:${
    new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
SUMMARY:🎨 Vibe Coding Workshop
DESCRIPTION:Join us for an amazing coding workshop where you'll turn your idea "${
    registration.projectIdea
  }" into a live application!\\n\\nWhat to bring:\\n- Your laptop (any OS)\\n- Charger\\n- Enthusiasm and curiosity!\\n\\nWe'll provide food\\, drinks\\, and an amazing experience!\\n\\nReference: ${
    registration.reference
  }
LOCATION:182 Cecil St\\, #35-01 Frasers Tower\\, Singapore 069547
ORGANIZER:CN=Cyndy\\, Nico\\, Andrian - IndoTech.sg:MAILTO:hello@indotech.sg
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Vibe Coding Workshop starts in 30 minutes!
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  linkedinProfile?: string;
  hasExperience: boolean;
  toolsUsed: string;
  projectIdea: string;
  reference: string;
  timestamp: string;
}

async function generatePayNowQR(
  amount: number,
  reference: string
): Promise<Buffer | null> {
  try {
    console.log('Generating PayNow QR for:', { amount, reference });

    const response = await fetch(
      'https://paynowqr.supply-chain.help/api/generate-qr',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.PAYNOW_API_KEY || 'YOUR_API_KEY',
        },
        body: JSON.stringify({
          isPersonal: true,
          identifier: process.env.PAYNOW_MOBILE || '+6585222322',
          companyName: 'Vibe Coding Event',
          amount: amount,
          expiry: '20251130',
          refNumber: reference,
        }),
      }
    );

    if (!response.ok) {
      console.error(
        'PayNow API response not OK:',
        response.status,
        response.statusText
      );
      throw new Error(`PayNow API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('PayNow API result:', {
      success: result.success,
      hasQrCode: !!result.data?.qrCode,
    });

    if (result.success && result.data?.qrCode) {
      // Convert base64 to Buffer for email attachment
      const qrCode = result.data.qrCode;
      let base64Data: string;

      if (qrCode.startsWith('data:image/')) {
        // Extract base64 part from data URL
        base64Data = qrCode.split(',')[1];
      } else {
        // It's already base64
        base64Data = qrCode;
      }

      return Buffer.from(base64Data, 'base64');
    } else {
      console.error('PayNow API error result:', result);
      throw new Error(
        `Failed to generate PayNow QR code: ${
          result.message || 'Unknown error'
        }`
      );
    }
  } catch (error) {
    console.error('PayNow QR generation error:', error);
    // Return null to indicate failure
    return null;
  }
}

export async function sendPaymentEmail(
  registration: RegistrationData
) {
  const paynowMobile = process.env.PAYNOW_MOBILE || '+6585222322';
  console.log(
    'Generating QR for payment email:',
    registration.reference
  );

  const paynowReference =
    'IndoTechSg-VibeCoding-' + registration.reference.split('_')[0];

  const qrBuffer = await generatePayNowQR(10, paynowReference);
  console.log(
    'QR Buffer generated:',
    !!qrBuffer,
    qrBuffer ? `${qrBuffer.length} bytes` : 'null'
  );

  // Generate calendar invite for payment email as well
  const calendarInvite = generateCalendarInvite(registration);

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vibe Coding - Payment Required</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f8fafc; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); padding: 30px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
      .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 16px; }
      .content { padding: 30px; }
      .status-badge { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
      .qr-section { text-align: center; background: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0; }
      .qr-code { max-width: 250px; width: 250px; height: auto; border-radius: 8px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto; border: 2px solid #e5e7eb; }
      .payment-details { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .payment-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
      .payment-label { font-weight: 600; color: #92400e; }
      .payment-value { font-family: monospace; background: white; padding: 4px 8px; border-radius: 4px; }
      .instructions { background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .instructions h3 { margin-top: 0; color: #1d4ed8; }
      .instructions ol { padding-left: 20px; }
      .instructions li { margin-bottom: 8px; }
      .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      .button { display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
      .event-details { border-left: 4px solid #8b5cf6; padding-left: 16px; margin: 20px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎨 Vibe Coding Registration</h1>
        <p>Complete your registration with payment</p>
      </div>

      <div class="content">
        <div class="status-badge">⏳ Payment Required</div>

        <h2>Hi ${registration.name}! 👋</h2>
        <p>Great news! Your registration for Vibe Coding has been <strong>Approved</strong>. To secure your spot, please complete the payment below.</p>

        <div class="event-details">
          <h3>📅 Event Details</h3>
          <p><strong>Date:</strong> November 6, 2025<br>
          <strong>Time:</strong> 6:30 PM - 9:00 PM<br>
          <strong>Location:</strong> 182 Cecil St, #35-01 Frasers Tower, Singapore 069547<br>
          <strong>Your Reference:</strong> <code>${
            registration.reference
          }</code></p>
        </div>

        <div class="qr-section">
          <h3>💳 Payment via PayNow QR</h3>
          ${
            qrBuffer
              ? `
          <div class="qr-code" style="background: #f0f9ff; border: 2px solid #0ea5e9; display: flex; align-items: center; justify-content: center; height: 200px; color: #0369a1; border-radius: 12px;">
            <div style="text-align: center; padding: 20px;">
              <div style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">PayNow QR Code Attached</div>
              <div style="font-size: 14px; line-height: 1.5;">
                Please check your email attachments<br>
                and scan the <strong>"paynow-qr.png"</strong> image<br>
                with your banking app
              </div>
            </div>
          </div>
          `
              : `
          <div class="qr-code" style="background: #f9fafb; border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; height: 200px; color: #6b7280; border-radius: 12px;">
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 48px; margin-bottom: 10px;">📱</div>
              <div style="font-weight: bold; margin-bottom: 5px;">QR Code Unavailable</div>
              <div style="font-size: 14px;">Please use manual PayNow transfer</div>
            </div>
          </div>
          `
          }
        </div>

        <div class="payment-details">
          <h3>🏦 Payment Details</h3>
          <div class="payment-row">
            <span class="payment-label">Amount:</span>
            <span class="payment-value">$10.00 SGD</span>
          </div>
          <div class="payment-row">
            <span class="payment-label">PayNow Mobile:</span>
            <span class="payment-value">${paynowMobile}</span>
          </div>
          <div class="payment-row">
            <span class="payment-label">Reference:</span>
            <span class="payment-value">${paynowReference}</span>
          </div>
        </div>

        <div class="instructions">
          <h3>📱 How to Pay</h3>
          <ol>
            <li><strong>Option 1 (Recommended):</strong> ${
              qrBuffer
                ? 'Download and scan the attached "paynow-qr.png" image with your banking app'
                : 'Manual PayNow transfer (QR code unavailable)'
            }</li>
            <li><strong>Option 2:</strong> Manual PayNow transfer using mobile: <code>${paynowMobile}</code></li>
            <li><strong>Important:</strong> Include reference <code>${
              registration.reference
            }</code> in your transfer</li>
          </ol>
          <p><strong>⚠️ Payment Deadline:</strong> Please complete payment within 24 hours to secure your spot.</p>
        </div>

        <div class="instructions" style="background: #ecfdf5; border: 1px solid #10b981;">
          <h3 style="color: #059669;">📅 Save the Date</h3>
          <p>We've attached a calendar invite (.ics file) to this email! You can:</p>
          <ul>
            <li>Download and open the "Vibe_Coding_Workshop.ics" file to add to any calendar app</li>
            <li>Or click the button below to add directly to Google Calendar</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=🎨%20Vibe%20Coding%20Workshop&dates=20251106T103000Z/20251106T130000Z&details=Join%20us%20for%20an%20amazing%20coding%20workshop%20where%20you'll%20turn%20your%20idea%20into%20a%20live%20application!%0A%0AWhat%20to%20bring:%0A-%20Your%20laptop%20(any%20OS)%0A-%20Charger%0A-%20Enthusiasm%20and%20curiosity!%0A%0AReference:%20${
            registration.reference
          }&location=182%20Cecil%20St,%20%2335-01%20Frasers%20Tower,%20Singapore%20069547&sf=true&output=xml"
             class="button"
             style="display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            📅 Add to Google Calendar
          </a>
        </div>

        <p>Once payment is confirmed, you'll receive another email with your <strong>personalized event namecard</strong> and additional details.</p>

        <p>Questions? Reply to this email or contact us for assistance.</p>
      </div>

      <div class="footer">
        <p>© 2025 Vibe Coding Event • Organized by IndoTechSg • Sponsored by Cloudflare • Powered by Lovable</p>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const emailOptions: any = {
      from:
        process.env.EMAIL_FROM ||
        'Vibe Coding <noreply@yourdomain.com>',
      to: [registration.email],
      subject:
        '🎨 Vibe Coding - Payment Required to Secure Your Spot',
      html: emailHtml,
    };

    // Add attachments
    emailOptions.attachments = [
      {
        filename: 'Vibe_Coding_Workshop.ics',
        content: Buffer.from(calendarInvite, 'utf-8'),
        contentType: 'text/calendar',
      },
    ];

    // Add QR code as inline attachment if available
    if (qrBuffer) {
      emailOptions.attachments.push({
        filename: 'paynow-qr.png',
        content: qrBuffer,
        cid: 'paynow-qr',
        contentType: 'image/png',
      });
    }

    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error('Resend email error:', error);
      throw new Error('Failed to send payment email');
    }

    console.log('Payment email sent:', {
      email: registration.email,
      messageId: data?.id,
    });
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

export async function sendConfirmationEmail(
  registration: RegistrationData
) {
  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vibe Coding - Registration Confirmed!</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f8fafc; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
      .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 16px; }
      .content { padding: 30px; }
      .status-badge { display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
      .event-card { background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center; }
      .event-card h2 { margin: 0 0 15px 0; font-size: 24px; }
      .event-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .info-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
      .info-row:last-child { border-bottom: none; }
      .info-label { font-weight: 600; color: #4a5568; }
      .info-value { color: #2d3748; }
      .checklist { background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .checklist h3 { margin-top: 0; color: #059669; }
      .checklist ul { margin: 0; padding-left: 20px; }
      .checklist li { margin-bottom: 8px; }
      .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      .timeline { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎉 You're All Set!</h1>
        <p>Registration confirmed for Vibe Coding</p>
      </div>

      <div class="content">
        <div class="status-badge">✅ Confirmed & Paid</div>

        <h2>Welcome ${registration.name}! 🚀</h2>
        <p>Registration confirmed! See you November 6, 2025.</p>

        <div class="event-card">
          <h2>🎨 VIBE CODING WORKSHOP</h2>
          <p style="font-size: 18px; margin: 0;">${registration.name}</p>
          <p style="opacity: 0.9; margin: 5px 0;">Reference: ${registration.reference}</p>
        </div>

        <div class="event-info">
          <h3>📅 Event Details</h3>
          <div class="info-row">
            <span class="info-label">Date & Time:</span>
            <span class="info-value">November 6, 2025 • 6:30 PM - 9:00 PM</span>
          </div>
          <div class="info-row">
            <span class="info-label">Location:</span>
            <span class="info-value">182 Cecil St, #35-01 Frasers Tower, Singapore 069547</span>
          </div>
        </div>

        <div class="checklist">
          <h3>📎 Attachments</h3>
          <ul>
            <li><strong>📅 Calendar Invite</strong> - Add to your calendar</li>
            <li><strong>🏷️ Your Namecard</strong> - Generated namecard attached</li>
          </ul>
        </div>

        <p>Questions? Reply to this email. See you there! 🎉</p>
      </div>

      <div class="footer">
        <p>© 2025 Vibe Coding Event • Organized by IndoTechSg • Sponsored by Cloudflare • Powered by Lovable</p>
        <p>Add to calendar • Share with friends • Contact support</p>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    // Generate namecard
    const namecardBuffer = await generateNamecard({
      name: registration.name,
      email: registration.email,
      linkedinProfile: registration.linkedinProfile,
      eventName: 'Vibe Coding Event',
      eventDate: 'Nov 6, 2025 • 6:30 PM - 9:00 PM',
      eventLocation: '182 Cecil St, #35-01 Frasers Tower, Singapore',
    });

    // Generate calendar invite
    // const calendarInvite = generateCalendarInvite(registration);

    const { data, error } = await resend.emails.send({
      from:
        process.env.EMAIL_FROM ||
        'Vibe Coding <noreply@yourdomain.com>', // Update with your verified domain
      to: [registration.email],
      subject:
        "🎉 Vibe Coding - You're Confirmed! Event Details Inside",
      html: emailHtml,
      attachments: [
        {
          filename: `${registration.name.replace(
            /[^a-zA-Z0-9]/g,
            '_'
          )}_VibeCoding_Namecard.png`,
          content: namecardBuffer,
          contentType: 'image/png',
        },
      ],
    });

    if (error) {
      console.error('Resend email error:', error);
      throw new Error('Failed to send confirmation email');
    }

    console.log('Confirmation email sent:', {
      email: registration.email,
      messageId: data?.id,
    });
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}
