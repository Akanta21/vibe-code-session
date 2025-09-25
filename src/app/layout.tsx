import type { Metadata } from 'next'
import './globals.css'
import './custom-styles.css'

export const metadata: Metadata = {
  title: 'Vibe Coding Event - Turn Your Idea Into a Live Vibe',
  description: 'Join us for an immersive coding experience where creativity meets innovation. A collaboration between Lovable and Cloudflare.',
  keywords: ['coding', 'event', 'singapore', 'vibe coding', 'lovable', 'cloudflare'],
  authors: [{ name: 'Vibe Coding Team' }],
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vibe Coding'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#8b5cf6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}