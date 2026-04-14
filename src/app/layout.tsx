import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AdSync — AI Landing Page Personalizer',
  description: 'Match your ad creative to your landing page with AI-powered CRO',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
