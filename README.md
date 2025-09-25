# Vibe Coding Event Landing Page

A modern, interactive landing page for the Vibe Coding Workshop - where creativity meets innovation through rapid prototyping with Lovable and Cloudflare deployment.

## 🚀 Features

- **Interactive WebGL Background**: Animated droplets and particles symbolizing idea generation
- **Responsive Design**: Optimized for both mobile and desktop experiences
- **Multiple CTAs**: Strategic placement of call-to-action buttons for maximum conversion
- **Event Timeline**: Clear 2.5-hour workshop schedule from 6:30 PM - 9:00 PM
- **PDF Workshop Agenda**: Downloadable detailed agenda with complete workflow
- **Partnership Branding**: Integrated IndoTechSg, Cloudflare, and Lovable branding

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v3 with custom gradient effects
- **3D Graphics**: Three.js with React Three Fiber (@react-three/fiber, @react-three/drei)
- **Language**: TypeScript
- **Animations**: Custom CSS transitions and WebGL shader effects

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vibe
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build

To create a production build:

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main landing page
│   ├── layout.tsx        # Root layout with metadata
│   ├── globals.css       # Global styles
│   └── custom-styles.css # Custom component styles
├── components/
│   ├── WebGLBackground.tsx # Interactive 3D background
│   └── AgendaSection.tsx   # Workshop agenda component
└── public/
    └── logo.png           # IndoTechSg logo
```

## 🎨 Key Components

### WebGLBackground
- Animated droplet ripple effects
- Floating particle system
- Responsive 3D camera controls
- Optimized for performance

### AgendaSection
- Complete workshop timeline
- PDF generation functionality
- Interactive download options
- Dual CTA placement

## 🎯 Event Details

- **Date**: November 6, 2025
- **Time**: 6:30 PM - 9:00 PM
- **Location**: 182 Cecil St, #35-01 Frasers Tower, Singapore 069547
- **Capacity**: 40 participants
- **Price**: $10 (Early bird pricing)

## 🤝 Partners

- **Organized by**: [IndoTechSg](https://indotech.sg/)
- **Sponsored by**: Cloudflare Singapore
- **Powered by**: [Lovable](https://lovable.ai/)

## 📋 Workshop Agenda

1. **Kickoff & Icebreaker** (15 min)
2. **Lovable Demo** (20 min)
3. **Team Formation** (10 min)
4. **Guided Build** (45 min)
5. **Cloudflare Deployment** (15 min)
6. **Showcase & Celebrate** (40 min)
7. **Wrap-up** (5 min)

## 🎨 Design Features

- **Color Scheme**: Dark theme with purple, blue, and green accents
- **Typography**: Inter font family with gradient text effects
- **Animations**: Smooth transitions and hover effects
- **Layout**: Grid-based responsive design with prominent section dividers

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Requirements

- Node.js 18+ 
- npm or yarn package manager

## 📄 License

© 2025 Vibe Coding Event. All rights reserved.

---

**Ready to turn your idea into reality in just 2.5 hours?** 
Join the Vibe Coding Workshop for an unforgettable experience of rapid prototyping and innovation!