import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, formData } = await request.json()
    
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID
    
    if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
      console.error('Missing Telegram configuration')
      return NextResponse.json(
        { error: 'Telegram configuration missing' },
        { status: 500 }
      )
    }

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
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json()
      console.error('Telegram API error:', errorData)
      throw new Error('Failed to send message to Telegram')
    }

    // Store registration data for webhook processing
    // In production, use a proper database
    if (!(global as any).registrations) {
      (global as any).registrations = new Map()
    }
    
    (global as any).registrations.set(formData.reference, {
      ...formData,
      status: 'pending',
      timestamp: new Date().toISOString()
    })

    // Log successful registration (optional)
    console.log('Registration submitted:', {
      name: formData.name,
      email: formData.email,
      reference: formData.reference,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: true, 
      reference: formData.reference 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    )
  }
}