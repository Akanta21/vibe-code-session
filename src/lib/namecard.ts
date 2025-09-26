import { createCanvas, loadImage } from 'canvas'
import QRCode from 'qrcode'

interface NamecardData {
  name: string
  email: string
  linkedinProfile?: string
  eventName: string
  eventDate: string
  eventLocation: string
}

export async function generateNamecard(data: NamecardData): Promise<Buffer> {
  const canvas = createCanvas(800, 500)
  const ctx = canvas.getContext('2d')

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 500)
  gradient.addColorStop(0, '#1a1a2e')
  gradient.addColorStop(0.5, '#16213e')
  gradient.addColorStop(1, '#0f3460')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 800, 500)

  // Border
  ctx.strokeStyle = '#8b5cf6'
  ctx.lineWidth = 4
  ctx.strokeRect(20, 20, 760, 460)

  // Event title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('VIBE CODING', 400, 80)

  // Decorative line
  ctx.strokeStyle = '#8b5cf6'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(200, 100)
  ctx.lineTo(600, 100)
  ctx.stroke()

  // Attendee name
  ctx.fillStyle = '#10b981'
  ctx.font = 'bold 36px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(data.name, 400, 170)

  // Event details
  ctx.fillStyle = '#ffffff'
  ctx.font = '18px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(data.eventName, 60, 240)
  ctx.fillText(`📅 ${data.eventDate}`, 60, 270)
  ctx.fillText(`📍 ${data.eventLocation}`, 60, 300)

  // LinkedIn profile if provided
  if (data.linkedinProfile) {
    ctx.fillStyle = '#0077b5'
    ctx.font = '16px Arial'
    ctx.fillText('🔗 LinkedIn:', 60, 340)
    ctx.fillStyle = '#ffffff'
    ctx.font = '14px Arial'
    ctx.fillText(data.linkedinProfile, 150, 340)
  }

  // Email
  ctx.fillStyle = '#ffffff'
  ctx.font = '16px Arial'
  ctx.fillText(`📧 ${data.email}`, 60, data.linkedinProfile ? 370 : 340)

  // Generate QR code for LinkedIn profile (if available) or email
  const qrData = data.linkedinProfile || `mailto:${data.email}`
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    color: {
      dark: '#ffffff',
      light: '#0000'
    },
    width: 120
  })

  // Load and draw QR code
  const qrImage = await loadImage(qrCodeDataUrl)
  ctx.drawImage(qrImage, 620, 300, 120, 120)

  // QR code label
  ctx.fillStyle = '#9ca3af'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(data.linkedinProfile ? 'Scan for LinkedIn' : 'Scan to email', 680, 440)

  // Footer
  ctx.fillStyle = '#6b7280'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('Powered by Lovable • Sponsored by Cloudflare • Organized by IndoTechSg', 400, 470)

  return canvas.toBuffer('image/png')
}