import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  hasExperience: boolean;
  toolsUsed: string;
  projectIdea: string;
  reference: string;
  timestamp: string;
}

export async function sendPaymentEmail(
  registration: RegistrationData
) {
  const paynowMobile = process.env.PAYNOW_MOBILE || '+65 9123 4567';
  // Use a Singapore-compliant PayNow QR code generator (e.g. paynow.now.sh)
  const qrUrl = `https://paynow.now.sh/api/qr?amount=10&ref=${encodeURIComponent(
    registration.reference
  )}&mobile=${encodeURIComponent(paynowMobile)}`;

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
      .qr-code { max-width: 250px; border-radius: 8px; margin-bottom: 15px; }
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
        <p>Great news! Your registration for Vibe Coding has been <strong>approved</strong>. To secure your spot, please complete the payment below.</p>

        <div class="event-details">
          <h3>📅 Event Details</h3>
          <p><strong>Date:</strong> November 6, 2025<br>
          <strong>Time:</strong> 6:30 PM - 9:00 PM<br>
          <strong>Location:</strong> 182 Cecil St, #35-01 Frasers Tower, Singapore 069547<br>
          <strong>Your Reference:</strong> <code>${registration.reference}</code></p>
        </div>

        <div class="qr-section">
          <h3>💳 Payment via PayNow QR</h3>
          <img src="${qrUrl}" alt="PayNow QR Code" class="qr-code" />
          <p><strong>Scan with your banking app</strong></p>
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
            <span class="payment-value">${registration.reference}</span>
          </div>
        </div>

        <div class="instructions">
          <h3>📱 How to Pay</h3>
          <ol>
            <li><strong>Option 1:</strong> Scan the QR code above with your banking app</li>
            <li><strong>Option 2:</strong> Manual PayNow transfer using mobile: <code>${paynowMobile}</code></li>
            <li><strong>Important:</strong> Include reference <code>${registration.reference}</code> in your transfer</li>
          </ol>
          <p><strong>⚠️ Payment Deadline:</strong> Please complete payment within 24 hours to secure your spot.</p>
        </div>

        <p>Once payment is confirmed, you'll receive another email with your event card and additional details.</p>

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
    const { data, error } = await resend.emails.send({
      from:
        process.env.EMAIL_FROM ||
        'Vibe Coding <noreply@yourdomain.com>', // Update with your verified domain
      to: [registration.email],
      subject:
        '🎨 Vibe Coding - Payment Required to Secure Your Spot',
      html: emailHtml,
    });

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

        <h2>Welcome to Vibe Coding, ${registration.name}! 🚀</h2>
        <p>Payment confirmed! We're excited to have you join us for an amazing coding experience.</p>

        <div class="event-card">
          <h2>🎨 VIBE CODING WORKSHOP</h2>
          <p style="font-size: 18px; margin: 0;">${registration.name}</p>
          <p style="opacity: 0.9; margin: 5px 0;">Reference: ${registration.reference}</p>
        </div>

        <div class="event-info">
          <h3>📅 Event Information</h3>
          <div class="info-row">
            <span class="info-label">Date & Time:</span>
            <span class="info-value">November 6, 2025 • 6:30 PM - 9:00 PM</span>
          </div>
          <div class="info-row">
            <span class="info-label">Location:</span>
            <span class="info-value">182 Cecil St, #35-01 Frasers Tower, Singapore 069547</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duration:</span>
            <span class="info-value">2.5 hours</span>
          </div>
          <div class="info-row">
            <span class="info-label">What to build:</span>
            <span class="info-value">${registration.projectIdea}</span>
          </div>
        </div>

        <div class="checklist">
          <h3>📋 What to Bring</h3>
          <ul>
            <li><strong>Your laptop</strong> (any OS - Windows, Mac, or Linux)</li>
            <li><strong>Charger</strong> for your device</li>
            <li><strong>Enthusiasm and curiosity!</strong></li>
            <li><strong>Appetite</strong> - we'll have great food and networking</li>
          </ul>
        </div>

        <div class="timeline">
          <h3>⏰ Workshop Timeline</h3>
          <p><strong>6:30 PM</strong> - Kickoff & Icebreaker</p>
          <p><strong>6:45 PM</strong> - Lovable Demo & Tool Introduction</p>
          <p><strong>7:05 PM</strong> - Team Formation</p>
          <p><strong>7:15 PM</strong> - Build Your Vibe (45 min)</p>
          <p><strong>8:00 PM</strong> - Deploy to Cloudflare (15 min)</p>
          <p><strong>8:15 PM</strong> - Showcase & Demo (40 min)</p>
          <p><strong>8:55 PM</strong> - Wrap-up & Networking</p>
        </div>

        <p><strong>🎯 Goal:</strong> Turn your idea "${registration.projectIdea}" into a live, working application!</p>

        <p>We'll provide everything else - food, drinks, swag, and an amazing experience!</p>

        <p>Questions? Reply to this email or contact us. See you there! 🎉</p>
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
    const { data, error } = await resend.emails.send({
      from:
        process.env.EMAIL_FROM ||
        'Vibe Coding <noreply@yourdomain.com>', // Update with your verified domain
      to: [registration.email],
      subject:
        "🎉 Vibe Coding - You're Confirmed! Event Details Inside",
      html: emailHtml,
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
