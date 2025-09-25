# Email Registration Flow with Resend

## 🎯 **Perfect Flow Understanding**

1. **User submits registration** → **Admin gets Telegram notification** + **Participant gets beautiful email with PayNow QR immediately**
2. **Participant pays** → **Admin clicks `/paid_[REFERENCE]`** → **Participant gets confirmation email with event card**

## 📧 **Email Features**

### **Payment Email:**
- Professional HTML template with event branding
- PayNow QR code embedded in email
- Payment instructions and manual PayNow details
- Event information and deadline
- Mobile-optimized design

### **Confirmation Email:**
- Digital event card with participant name
- Complete event details and timeline
- What to bring checklist
- Workshop schedule and location
- Beautiful gradient design

## 🛠️ **Resend Setup Instructions**

### **1. Create Resend Account**
1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Get your API key from dashboard

### **2. Domain Verification (Recommended)**
1. Add your domain to Resend
2. Follow DNS verification steps
3. Update email templates with your domain:
   ```typescript
   from: 'Vibe Coding <noreply@yourdomain.com>'
   ```

### **3. Environment Variables**
```env
RESEND_API_KEY=re_your_actual_api_key_here
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_chat_id
PAYNOW_MOBILE=+65 9123 4567
```

## 🔄 **Complete Registration Flow**

### **Step 1: Registration Arrives**
User submits form → You get Telegram message + Participant gets payment email immediately:
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

✅ Payment email sent to participant!

Actions:
💳 Mark as Paid: /paid_JOHN_DOE_1234
❌ Reject: /reject_eyJuYW1lIjoiSm9obiBEb2U...
```

### **Step 2: Payment Received**
When participant pays → Click `/paid_[REFERENCE]` → Bot responds:
```
💳 PAYMENT CONFIRMED & EMAIL SENT

Participant: John Doe (john@example.com)
Reference: JOHN_DOE_1234

📧 Payment email with QR code sent to participant.

Next steps:
💳 When paid: /paid_JOHN_DOE_1234
```

**Meanwhile, participant receives beautiful email with:**
- PayNow QR code
- Payment instructions
- Event details
- Reference number for payment

### **Step 3: Payment Confirmation**
Type `/paid_JOHN_DOE_1234` → Bot responds:
```
💳 PAYMENT CONFIRMED & EMAIL SENT

Participant: John Doe (john@example.com)
Reference: JOHN_DOE_1234
Status: ✅ FULLY CONFIRMED

📧 Event confirmation email with details sent to participant.

🎯 Participant is now fully registered for Vibe Coding!
```

**Meanwhile, participant receives confirmation email with:**
- Digital event card
- Complete event information
- What to bring checklist
- Workshop timeline
- Location details

## 🎨 **Email Templates**

Both emails use professional HTML templates with:
- Gradient headers matching your branding
- Mobile-responsive design
- Embedded QR codes
- Clear call-to-actions
- Event branding consistency

## ⚡ **Quick Testing**

### **Local Development:**
```bash
# 1. Set up environment variables
cp .env.example .env.local
# Add your Resend API key and other variables

# 2. Start development server
npm run dev

# 3. Test registration form
# Fill out form on website

# 4. Check Telegram chat
# Click /approve_ command

# 5. Check participant email
# Should receive payment email with QR
```

### **Production Deployment:**
```bash
# 1. Deploy to HTTPS domain
# 2. Set webhook for auto-commands:
curl -X POST https://yourdomain.com/api/set-webhook \
  -d '{"webhookUrl": "https://yourdomain.com/api/telegram-bot"}'
```

## 🎯 **Key Benefits**

- **Admin manages via Telegram** - Simple command-based interface
- **Participants get professional emails** - Beautiful, branded experience  
- **No database needed** - All data encoded in Telegram commands
- **Automatic QR generation** - PayNow codes embedded in emails
- **Mobile-optimized** - Perfect on all devices
- **Error handling** - Clear feedback for any issues

## 📱 **Bot Commands Summary**

- `/approve_[DATA]` - Approve registration & send payment email
- `/reject_[DATA]` - Reject registration  
- `/paid_[REFERENCE]` - Confirm payment & send event details
- `/help` - Show command help

## 🚀 **You're Ready!**

The system now provides:
1. **Telegram notifications** for admin management
2. **Professional emails** for participant communication
3. **PayNow QR codes** for easy payments
4. **Event cards** for confirmed participants
5. **Complete automation** with simple commands

Perfect for event registration management! 🎉