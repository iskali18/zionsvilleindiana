import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Lora, Source_Sans_3 } from 'next/font/google'
import './globals.css'

const display = Lora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const sans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://zionsvilleindiana.com'),
  title: {
    default: 'Zionsville, Indiana — Events, Parks & Village Guide',
    template: '%s | ZionsvilleIndiana.com',
  },
  description:
    'Your guide to Zionsville, Indiana. Browse the 2026 events calendar, explore downtown shops and dining, and discover parks and trails in the village.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zionsvilleindiana.com',
    siteName: 'ZionsvilleIndiana.com',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: { index: true, follow: true },
}

const GA_ID = 'G-25FXRPT58S' // ← replace with your GA4 measurement ID

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        {/* Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `,
          }}
        />
      </head>
      <body className="bg-stone-50 text-stone-800 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
