import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Lora, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const display = Lora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://zionsvilleindiana.com'),
  title: {
    default: 'Zionsville Indiana — Events, Parks & Village Guide',
    template: '%s | Zionsville Indiana',
  },
  description:
    'Your guide to Zionsville, Indiana. Browse the 2026 events calendar, explore downtown shops and restaurants, and find parks and trails in the village.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zionsvilleindiana.com',
    siteName: 'Zionsville Indiana',
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
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        {/* WebSite schema — tells Google what to display as the site name in search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Zionsville Indiana',
              alternateName: 'ZionsvilleIndiana.com',
              url: 'https://zionsvilleindiana.com',
            }),
          }}
        />
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
      <body className="bg-stone-50 text-stone-800 font-sans font-medium antialiased">
        {children}
      </body>
    </html>
  )
}
