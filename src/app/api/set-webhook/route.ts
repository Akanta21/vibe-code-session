import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 })
    }

    const { webhookUrl } = await request.json()
    
    // If no webhook URL provided, use the default
    const finalWebhookUrl = webhookUrl || `${process.env.WEBHOOK_DOMAIN}/api/telegram-bot`
    
    if (!finalWebhookUrl || !finalWebhookUrl.startsWith('https://')) {
      return NextResponse.json({ error: 'Valid HTTPS webhook URL required' }, { status: 400 })
    }

    // Set the webhook
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: finalWebhookUrl,
        allowed_updates: ['message']
      })
    })

    const result = await response.json()

    if (result.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook set successfully',
        webhook_url: finalWebhookUrl
      })
    } else {
      return NextResponse.json({ 
        error: 'Failed to set webhook', 
        details: result 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Set webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 })
    }

    // Get current webhook info
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`)
    const result = await response.json()

    return NextResponse.json(result)

  } catch (error) {
    console.error('Get webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}