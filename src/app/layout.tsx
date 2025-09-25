import type { Metadata } from 'next'
import './globals.css'
import './custom-styles.css'

export const metadata: Metadata = {
  title: 'Vibe Coding Event - Turn Your Idea Into a Live Vibe',
  description: 'Join us for an immersive coding experience where creativity meets innovation. A collaboration between Lovable and Cloudflare.',
  keywords: ['coding', 'event', 'singapore', 'vibe coding', 'lovable', 'cloudflare'],
  authors: [{ name: 'Vibe Coding Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
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