// Simple test script to verify email functionality
// Usage: node test-email.js

const { sendPaymentEmail, sendConfirmationEmail } = require('./src/lib/email.ts')

// Test registration data
const testRegistration = {
  name: 'John Doe',
  email: 'john@example.com', // Replace with your test email
  phone: '+65 9123 4567',
  hasExperience: true,
  toolsUsed: 'React, Node.js, Python',
  projectIdea: 'AI-powered playlist generator that creates custom playlists based on mood and activity',
  reference: 'JOHN_DOE_1234',
  timestamp: new Date().toISOString()
}

async function testEmails() {
  console.log('🧪 Testing email functionality...\n')
  
  try {
    // Test payment email
    console.log('📧 Sending payment email...')
    const paymentResult = await sendPaymentEmail(testRegistration)
    console.log('✅ Payment email sent:', paymentResult)
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Test confirmation email  
    console.log('\n📧 Sending confirmation email...')
    const confirmResult = await sendConfirmationEmail(testRegistration)
    console.log('✅ Confirmation email sent:', confirmResult)
    
    console.log('\n🎉 All emails sent successfully!')
    console.log('\n📝 Check the recipient email for both messages.')
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message)
    console.log('\n🔧 Check your configuration:')
    console.log('- RESEND_API_KEY in .env.local')
    console.log('- EMAIL_FROM in .env.local') 
    console.log('- PAYNOW_MOBILE in .env.local')
    console.log('- Update test email address in this script')
  }
}

// Check environment variables
if (!process.env.RESEND_API_KEY) {
  console.error('❌ Missing RESEND_API_KEY environment variable')
  console.log('Add your Resend API key to .env.local')
  process.exit(1)
}

// Run test
testEmails()