// Cloudflare Workers compatible namecard generation using SVG
interface NamecardData {
  name: string;
  email: string;
  linkedinProfile?: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
}

export async function generateNamecard(
  data: NamecardData
): Promise<Buffer> {
  // Generate QR code data URL (this still works in Cloudflare)
  const qrData = data.linkedinProfile || `mailto:${data.email}`;
  let qrCodeSvg = '';

  try {
    // Use QRCode library to generate SVG instead of canvas
    const QRCode = await import('qrcode');
    qrCodeSvg = await QRCode.toString(qrData, {
      type: 'svg',
      color: {
        dark: '#ffffff',
        light: '#00000000', // transparent background
      },
      width: 300,
      margin: 0,
    });
  } catch (error) {
    console.warn('QR code generation failed, using placeholder');
    qrCodeSvg = `<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="#ffffff"/>
      <text x="150" y="150" text-anchor="middle" font-family="Arial" font-size="24" fill="#000000">QR</text>
    </svg>`;
  }

  // Create namecard as SVG
  const svgNamecard = `<svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a1a2e"/>
        <stop offset="50%" style="stop-color:#16213e"/>
        <stop offset="100%" style="stop-color:#0f3460"/>
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="800" height="500" fill="url(#bg-gradient)"/>

    <!-- Border -->
    <rect x="20" y="20" width="760" height="460" fill="none" stroke="#8b5cf6" stroke-width="4"/>

    <!-- Event title -->
    <text x="400" y="80" text-anchor="middle" font-family="Arial" font-size="32" font-weight="bold" fill="#ffffff">VIBE CODING WORKSHOP - 6 Nov 2025</text>

    <!-- Attendee name - HUGE -->
    <text x="400" y="140" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#10b981">${data.name.toUpperCase()}</text>

    <!-- Email -->
    <text x="400" y="200" text-anchor="middle" font-family="Arial" font-size="28" fill="#ffffff"> ${
      data.email
    }</text>

    <!-- QR Code - Large (60% coverage) -->
    <g transform="translate(320, 270) scale(5)">
      ${qrCodeSvg.replace(/<svg[^>]*>/, '').replace('</svg>', '')}
    </g>
  </svg>`;

  // For email compatibility, convert SVG to PNG using a simple approach
  // Since we need PNG for email attachments, we'll use a different approach
  try {
    // Try to use sharp for SVG to PNG conversion if available
    const sharp = await import('sharp').catch(() => null);
    if (sharp) {
      return await sharp
        .default(Buffer.from(svgNamecard, 'utf-8'))
        .png()
        .toBuffer();
    }
  } catch (error) {
    console.log('Sharp not available, falling back to SVG');
  }

  // Fallback: return SVG as buffer (some email clients support it)
  return Buffer.from(svgNamecard, 'utf-8');
}
