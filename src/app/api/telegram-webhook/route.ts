import { NextRequest, NextResponse } from 'next/server'

interface TelegramUpdate {
  message?: {
    message_id: number
    from: {
      id: number
      first_name: string
      username?: string
    }
    chat: {
      id: number
      type: string
    }
    text?: string
    date: number
  }
}

// In-memory storage for registration data (in production, use a database)
const registrations = new Map<string, {
  name: string
  email: string
  phone: string
  hasExperience: boolean
  toolsUsed: string
  projectIdea: string
  reference: string
  status: 'pending' | 'confirmed' | 'rejected' | 'paid'
  timestamp: string
}>()

const sendTelegramMessage = async (chatId: number, text: string, parseMode: string = 'HTML') => {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode
    })
  })
}

const generatePaynowQR = (amount: number, reference: string, mobile?: string) => {
  // Basic Paynow QR generation - you may want to use a proper library
  const paynowMobile = mobile || process.env.PAYNOW_MOBILE || '+65 9123 4567'
  
  // Simplified Paynow URL (in production, use proper QR generation)
  const paynowData = `paynow://pay?mobile=${paynowMobile}&amount=${amount}&ref=${reference}&editable=0`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paynowData)}`
  
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

After payment, send /paid_${reference} to confirm your registration.`
  }
}

const handleConfirmCommand = async (chatId: number, reference: string) => {
  // For demo, we'll simulate registration data
  // In a real app, this would come from your database/storage
  const mockRegistration = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+65 9123 4567',
    hasExperience: true,
    toolsUsed: 'React, Node.js',
    projectIdea: 'AI-powered playlist generator',
    reference,
    status: 'confirmed' as const,
    timestamp: new Date().toISOString()
  }

  // Store registration (in production, update your database)
  registrations.set(reference, mockRegistration)

  const payment = generatePaynowQR(10, reference)
  
  const confirmationMessage = `✅ <b>Registration Confirmed!</b>

Registration ${reference} has been approved.

${payment.instructions}`

  await sendTelegramMessage(chatId, confirmationMessage)

  // Optional: Send confirmation email to user (implement email service)
  // await sendConfirmationEmail(mockRegistration.email, payment)
  
  return NextResponse.json({ success: true, action: 'confirmed', reference })
}

const handlePaidCommand = async (chatId: number, reference: string) => {
  const registration = registrations.get(reference)
  
  if (!registration) {
    await sendTelegramMessage(chatId, `❌ Registration ${reference} not found.`)
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }

  // Update payment status
  registration.status = 'paid'
  registrations.set(reference, registration)

  const paidMessage = `💳 <b>Payment Confirmed!</b>

Registration: ${reference}
Attendee: ${registration.name}
Status: ✅ PAID

<b>Event Details:</b>
📅 Date: November 6, 2025  
⏰ Time: 6:30 PM - 9:00 PM
📍 Location: 182 Cecil St, #35-01 Frasers Tower

The attendee will receive their event card shortly.`

  await sendTelegramMessage(chatId, paidMessage)

  // Generate and send event card (implement this next)
  // await generateEventCard(registration)
  
  return NextResponse.json({ success: true, action: 'paid', reference })
}

const handleRejectCommand = async (chatId: number, reference: string) => {
  const rejectionMessage = `❌ <b>Registration Rejected</b>

Registration ${reference} has been rejected.

Reason: [Add reason here if needed]`

  await sendTelegramMessage(chatId, rejectionMessage)
  
  return NextResponse.json({ success: true, action: 'rejected', reference })
}

const handleStatsCommand = async (chatId: number) => {
  const totalRegistrations = registrations.size
  const confirmedCount = Array.from(registrations.values()).filter(r => r.status === 'confirmed').length
  const paidCount = Array.from(registrations.values()).filter(r => r.status === 'paid').length

  const statsMessage = `📊 <b>Registration Statistics</b>

📝 Total Registrations: ${totalRegistrations}
✅ Confirmed: ${confirmedCount}
💳 Paid: ${paidCount}
🎯 Remaining Spots: ${40 - paidCount}/40

<i>Last updated: ${new Date().toLocaleString()}</i>`

  await sendTelegramMessage(chatId, statsMessage)
  
  return NextResponse.json({ success: true, action: 'stats' })
}

const handleHelpCommand = async (chatId: number) => {
  const helpMessage = `🤖 <b>Bot Commands</b>

<b>Registration Management:</b>
/confirm_[REFERENCE] - Approve registration & send payment
/reject_[REFERENCE] - Reject registration
/paid_[REFERENCE] - Mark registration as paid

<b>Information:</b>
/stats - Show registration statistics
/help - Show this help message

<b>Example:</b>
/confirm_JOHN_DOE_123
/paid_JOHN_DOE_123

<i>Replace [REFERENCE] with actual registration reference</i>`

  await sendTelegramMessage(chatId, helpMessage)
  
  return NextResponse.json({ success: true, action: 'help' })
}

export async function POST(request: NextRequest) {
  try {
    const body: TelegramUpdate = await request.json()
    
    const message = body.message
    if (!message?.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const text = message.text.toLowerCase()

    // Handle different commands
    if (text.startsWith('/confirm_')) {
      const reference = text.replace('/confirm_', '').toUpperCase()
      return await handleConfirmCommand(chatId, reference)
    }
    
    if (text.startsWith('/paid_')) {
      const reference = text.replace('/paid_', '').toUpperCase()
      return await handlePaidCommand(chatId, reference)
    }
    
    if (text.startsWith('/reject_')) {
      const reference = text.replace('/reject_', '').toUpperCase()
      return await handleRejectCommand(chatId, reference)
    }
    
    if (text === '/stats') {
      return await handleStatsCommand(chatId)
    }
    
    if (text === '/help' || text === '/start') {
      return await handleHelpCommand(chatId)
    }

    // Default response for unrecognized commands
    await sendTelegramMessage(chatId, `❓ Unknown command. Send /help for available commands.`)
    
    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}