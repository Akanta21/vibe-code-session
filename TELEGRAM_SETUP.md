# Telegram Bot Setup Guide

## 🤖 Bot Commands Implementation

Your Telegram bot now supports the following commands:

### **Admin Commands:**
- `/paid_[REFERENCE]` - Mark registration as paid & send event card
- `/reject_[REFERENCE]` - Reject a registration
- `/stats` - Show registration statistics
- `/help` - Display available commands

### **Example Usage:**
```
/paid_JOHN_DOE_1234
/stats
```

## 🔄 Registration Flow

1. **User submits form** → Registration sent to your Telegram chat + Participant gets payment email immediately
2. **User pays** → Use `/paid_REFERENCE` to mark as paid
3. **Bot confirms payment** → Sends confirmation email with event details

## ⚙️ Setup Instructions

### 1. Enable Webhook (For Production)

When deployed, set up the webhook:

```bash
# Call your webhook setup endpoint
curl -X POST https://yourdomain.com/api/set-webhook \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "https://yourdomain.com/api/telegram-webhook"}'
```

### 2. Test Commands Locally

For local development, you can test by sending messages directly to your bot:

1. Send a message to your bot
2. Use the commands in your admin chat
3. Check the responses

### 3. Environment Variables

Make sure your `.env.local` has:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_chat_id
WEBHOOK_DOMAIN=https://yourdomain.com
PAYNOW_MOBILE=+65 9123 4567
```

## 💳 Payment QR Generation

The bot automatically generates Paynow QR codes with:
- Fixed amount: $10 SGD
- Unique reference for each registration
- Your mobile number from environment variables
- QR code image via QR server API

## 📊 Registration Tracking

- **Pending**: New registration awaiting approval
- **Confirmed**: Approved, payment QR sent
- **Paid**: Payment confirmed, event card sent
- **Rejected**: Registration declined

## 🎯 Next Steps

1. **Deploy your application** to a domain with HTTPS
2. **Set up the webhook** using the `/api/set-webhook` endpoint
3. **Test the complete flow** from registration to payment
4. **Customize payment QR** generation if needed
5. **Add event card generation** (optional)

## 🔧 Advanced Features

You can extend the bot with:
- Email notifications to registrants
- Digital event card generation
- Payment webhook integration
- Automated reminders
- Export functionality for attendee lists

## 📱 Testing the Flow

1. Fill out the signup form on your website
2. Check your Telegram chat for the registration message
3. Use `/confirm_REFERENCE` to approve
4. Bot will send payment QR and instructions
5. Use `/paid_REFERENCE` to mark as paid
6. Bot confirms and provides event details

The system is now ready for event registration management! 🚀