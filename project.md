# Vibe Coding Event Signup System
## Product Requirements Document & Implementation Checklist

---

## 1. Product Overview

**Product Name:** Vibe Coding Event Signup Platform
**Tagline:** "Turn Your Idea Into a Live Vibe — Fast, Fun, and Real."
**Objective:** Create a seamless event registration experience that combines information collection, payment processing, and automated confirmation delivery.

### 1.1 Product Vision
Enable potential attendees to discover, learn about, and register for Vibe Coding events through an intuitive web interface that handles registration, payment, and confirmation in one streamlined flow.

---

## 2. User Stories & Requirements

### 2.1 Primary User Flow
1. **Discovery:** User lands on event page and learns about Vibe Coding
2. **Engagement:** User explores event details and decides to register
3. **Registration:** User fills out signup form with personal and project information
4. **Payment:** User receives payment QR code and completes transaction
5. **Confirmation:** User receives confirmation email with event card and payment reminder

### 2.2 Detailed User Requirements

#### Landing Page Requirements
- [ ] **Hero Section** with Vibe Coding branding and tagline
- [ ] **About Vibe Coding** introduction section explaining Lovable + Cloudflare partnership
- [ ] **Event Details** expandable/clickable section containing:
  - Event date, time, and location
  - Agenda and activities
  - What's included (food, drinks, networking)
  - Prerequisites or requirements
- [ ] **Call-to-Action** button leading to signup form
- [ ] **Responsive design** for mobile and desktop

#### Signup Form Requirements
- [ ] **Personal Information Collection:**
  - Full Name (required)
  - Email Address (required, with validation)
  - Phone Number (required, with format validation)
- [ ] **Experience Assessment:**
  - "Have you vibe-coded before?" (Yes/No radio buttons)
  - If Yes: "What tools have you used?" (multi-select or text field)
- [ ] **Project Information:**
  - "What idea do you want to build?" (text area, required)
- [ ] **Form Validation** with real-time feedback
- [ ] **Submit button** leading to payment section

#### Payment Processing Requirements
- [ ] **Automatic Reference Generation:** name+email format
- [ ] **Paynow QR Code Generation:**
  - $10 fixed amount
  - Unique reference number per registration
  - QR code display with payment instructions
- [ ] **Payment Instructions** clearly displayed
- [ ] **Payment Status** tracking (optional: webhook integration)

#### Digital Event Card Requirements
- [ ] **Personalized Design** featuring:
  - Attendee name
  - Event branding
  - Event details (date, time, location)
  - QR code for event entry (optional)
- [ ] **Professional Layout** suitable for both digital and print
- [ ] **Branded Colors** consistent with Vibe Coding identity
