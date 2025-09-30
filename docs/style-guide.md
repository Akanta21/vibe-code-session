# Vibe Project Style Guide & Color Theme

## Overview
This document standardizes the design system and color themes used in the Vibe Coding Event Signup System for consistent implementation across projects.

## Color System

### Primary Color Palette
```css
primary: {
  50: '#f0f9ff',   /* Lightest blue */
  500: '#0ea5e9',  /* Main blue */
  600: '#0284c7',  /* Medium blue */
  700: '#0369a1',  /* Dark blue */
  900: '#0c4a6e',  /* Darkest blue */
}
```

### Secondary Color Palette
```css
secondary: {
  500: '#8b5cf6',  /* Main purple */
  600: '#7c3aed',  /* Medium purple */
  700: '#6d28d9',  /* Dark purple */
}
```

### Extended Color System
```css
/* Accent Colors */
purple-400: #c084fc
blue-400: #60a5fa
green-400: #4ade80
pink-500: #ec4899

/* Neutral Colors */
black: #000000
gray-900: #111827
gray-800: #1f2937
gray-700: #374151
gray-400: #9ca3af
gray-300: #d1d5db
white: #ffffff
```

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallback**: system-ui, sans-serif
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');`

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semi-bold**: 600
- **Bold**: 700
- **Extra-bold**: 800
- **Black**: 900

### Text Sizes
```css
text-4xl: 2.25rem (36px)
text-5xl: 3rem (48px)
text-6xl: 3.75rem (60px)
text-8xl: 6rem (96px)
text-lg: 1.125rem (18px)
text-xl: 1.25rem (20px)
text-3xl: 1.875rem (30px)
```

## Design Tokens

### Spacing Scale
```css
/* Padding/Margin values */
0.5rem: 8px
0.75rem: 12px
1rem: 16px
1.5rem: 24px
2rem: 32px
3rem: 48px
4rem: 64px
6rem: 96px
```

### Border Radius
```css
rounded-2xl: 1rem (16px)
rounded-3xl: 1.5rem (24px)
rounded-full: 9999px (fully rounded)
```

## Gradient System

### Text Gradients
```css
.text-gradient {
  background: linear-gradient(to right, #60a5fa, #a855f7, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Background Gradients
```css
/* Purple-Blue Gradient */
.bg-gradient-purple {
  background: linear-gradient(to right, #8b5cf6, #3b82f6);
}

/* Green Gradient */
.bg-gradient-green {
  background: linear-gradient(to right, #059669, #10b981);
}
```

## Interactive Elements

### Button Styles

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(to right, #8b5cf6, #3b82f6);
  color: white;
  padding: 1rem 3rem;
  border-radius: 9999px;
  font-size: 1.125rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background: linear-gradient(to right, #7c3aed, #2563eb);
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
}
```

#### Large Button Variant
```css
.btn-large {
  padding: 1.5rem 4rem;
  font-size: 1.25rem;
}
```

### Card Components

#### Detail Card
```css
.detail-card {
  background: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid #374151;
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.detail-card:hover {
  border-color: rgba(168, 85, 247, 0.6);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
}
```

## Visual Effects

### Glow Effects
```css
.glow {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}

.glow-strong {
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2);
}
```

### Backdrop Effects
```css
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}
```

### Section Dividers
```css
.section-divider {
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent);
  height: 1px;
}

.section-divider.green {
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent);
}

.section-divider.blue {
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
}
```

## Animations

### Shimmer Effect
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
```

### Slide Down
```css
@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Layout System

### Base Layout
```css
body {
  background-color: #000000;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
}
```

### WebGL Background
```css
.webgl-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -10;
  background: radial-gradient(
    ellipse at center,
    rgba(59, 130, 246, 0.15) 0%,
    rgba(139, 92, 246, 0.1) 50%,
    rgba(0, 0, 0, 0.9) 100%
  );
}
```

### Main Content Overlay
```css
.main-content {
  position: relative;
  z-index: 1;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
}
```

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px and up
- **Desktop**: 1024px and up

### Mobile-First Approach
Use Tailwind's responsive prefixes:
- `md:` for tablet and up
- `lg:` for desktop and up

## Brand Partnership Styling

### Lovable Logo
```css
.partner-logo {
  background: linear-gradient(to right, #8b5cf6, #7c3aed);
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}
```

### Cloudflare Logo
```css
.partner-logo.cloudflare {
  background: linear-gradient(to right, #3b82f6, #2563eb);
}
```

## Implementation Guidelines

### CSS Architecture
1. Use Tailwind CSS as the primary framework
2. Custom styles in dedicated CSS files for complex components
3. Maintain separation between utility classes and component styles
4. Use CSS custom properties for theme-able values

### Performance Considerations
1. Use `backdrop-filter` sparingly for better performance
2. Prefer `transform` over changing layout properties for animations
3. Use `will-change` property for elements that will be animated

### Accessibility
1. Maintain sufficient color contrast ratios
2. Use semantic HTML elements
3. Provide focus indicators for interactive elements
4. Ensure animations respect `prefers-reduced-motion`

## Usage Examples

### Implementing the Theme in a New Project

1. **Install dependencies**:
   ```bash
   npm install tailwindcss @tailwindcss/typography
   ```

2. **Configure Tailwind** with the color system:
   ```javascript
   module.exports = {
     theme: {
       extend: {
         colors: {
           primary: {
             50: '#f0f9ff',
             500: '#0ea5e9',
             600: '#0284c7',
             700: '#0369a1',
             900: '#0c4a6e',
           },
           secondary: {
             500: '#8b5cf6',
             600: '#7c3aed',
             700: '#6d28d9',
           }
         },
         fontFamily: {
           sans: ['Inter', 'system-ui', 'sans-serif'],
         },
       },
     },
   }
   ```

3. **Import fonts and base styles**:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
   
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   @layer base {
     body {
       @apply bg-black text-white font-sans;
       font-family: 'Inter', sans-serif;
     }
   }
   ```

This style guide ensures consistent visual identity across all Vibe project implementations while maintaining flexibility for project-specific customizations.