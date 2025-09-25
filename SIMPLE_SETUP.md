# Simple Stateless Telegram Bot Setup

## 🎯 **Ultra-Simple Flow (No Database)**

1. **User submits form** → All data encoded in Telegram commands
2. **You click `/approve_[DATA]`** → Bot sends payment QR instantly  
3. **User pays** → You type `/paid_REFERENCE` → Bot sends event details

## 🤖 **How It Works**

### **Registration Message Format:**
```
🎨 NEW VIBE CODING REGISTRATION

👤 Name: John Doe
📧 Email: john@example.com
📱 Phone: +65 9123 4567
🔧 Experience: Yes - React, Node.js
💡 Project Idea: AI-powered playlist generator

🆔 Reference: JOHN_DOE_1234
💰 Payment: $10 SGD
📅 Submitted: [timestamp]

Actions:
✅ Approve: /approve_eyJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI...
❌ Reject: /reject_eyJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI...
```

### **Available Commands:**
- **`/approve_[DATA]`** - Click from registration message to approve
- **`/reject_[DATA]`** - Click from registration message to reject  
- **`/paid_JOHN_DOE_123`** - Type manually when user pays
- **`/help`** - Show command help

## ⚡ **Setup Steps**

### 1. **Environment Variables**
```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_chat_id  
PAYNOW_MOBILE=+65 9123 4567
```

### 2. **For Local Testing**
```bash
npm run dev
# Test the signup form
# Check messages in your Telegram chat
# Try the /approve_ and /paid_ commands
```

### 3. **For Production (with webhook)**
```bash
# Deploy to HTTPS domain first
# Then set webhook:
curl -X POST https://yourdomain.com/api/set-webhook \
  -d '{"webhookUrl": "https://yourdomain.com/api/telegram-bot"}'
```

## 🔄 **Complete Example Flow**

### **Step 1: Registration Arrives**
User submits form → You get message with encoded commands

### **Step 2: You Approve**  
Click `/approve_[longstring]` → Bot responds:
```
✅ REGISTRATION APPROVED

Attendee Details:
👤 Name: John Doe
📧 Email: john@example.com
📱 Phone: +65 9123 4567

🏦 Payment Instructions
💰 Amount: $10 SGD
🆔 Reference: JOHN_DOE_1234
📱 Mobile: [your mobile number]

📱 View QR Code

Payment Options:
1. Scan QR code with banking app
2. Manual PayNow transfer using mobile number

⚠️ Important: Use reference: JOHN_DOE_1234

Reply with /paid_JOHN_DOE_1234 when payment is complete.

Actions:
💳 Mark as paid: /paid_JOHN_DOE_1234
```

### **Step 3: Payment Confirmation**
Type `/paid_JOHN_DOE_1234` → Bot responds:
```
💳 PAYMENT CONFIRMED!

Registration: JOHN_DOE_1234
Status: ✅ PAID & CONFIRMED

Event Details:
📅 Date: November 6, 2025  
⏰ Time: 6:30 PM - 9:00 PM
📍 Location: 182 Cecil St, #35-01 Frasers Tower

What to bring:
💻 Your laptop (any OS)
🧠 Enthusiasm & curiosity
☕ Appetite for great food and networking!

🎉 Looking forward to seeing you at Vibe Coding!
```

## 💡 **Key Benefits**

- **No Database**: All data encoded in commands
- **No Storage**: Completely stateless operation
- **No Webhooks Needed**: Works with simple polling too
- **Copy-Paste Commands**: Just click the generated commands
- **Instant Payment QR**: Generated on-demand
- **Zero Maintenance**: No data to manage or backup

## 🚀 **Ready to Go!**

The system is now completely stateless. All registration data is encoded directly in the Telegram commands, so you don't need any database or persistent storage. Just click the commands that appear in your chat!

Test it by filling out the signup form and trying the commands that appear in your Telegram chat.