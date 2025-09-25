# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Vibe Coding Event Signup System** - a web platform for event registration that combines information collection, payment processing via Paynow QR codes, and automated confirmation delivery. The system handles the complete user flow from event discovery to registration confirmation with digital event cards.

## Architecture & Key Components

This project appears to be in the initial planning/specification phase, with the main project requirements documented in `project.md`. The system will need to implement:

### Core Components
- **Landing Page**: Event discovery with hero section, about info, and event details
- **Signup Form**: Multi-step registration collecting personal info, experience assessment, and project ideas  
- **Payment Integration**: Paynow QR code generation with automatic reference creation (name+email format)
- **Digital Event Cards**: Personalized confirmation cards with event details and branding
- **Email System**: Automated confirmation delivery

### Technical Stack (To Be Implemented)
The project requirements suggest this will be a web application requiring:
- Frontend framework for responsive UI (mobile/desktop)
- Backend API for form processing and data storage
- Payment QR code generation library
- Email service integration
- Database for attendee data
- PDF/image generation for event cards

## Key Features
- $10 fixed event pricing with Paynow integration
- Real-time form validation
- Responsive design for mobile and desktop
- Automated reference number generation
- Professional digital event card generation
- Integration with Lovable + Cloudflare partnership branding

## Development Context

This appears to be a Singapore-based project (evidenced by Paynow payment system) for coding events. The system emphasizes a streamlined user experience from discovery to confirmation.

## Current Status
The project is in the specification phase with detailed requirements documented in `project.md`. Implementation has not yet begun - the codebase currently contains only the project requirements document.