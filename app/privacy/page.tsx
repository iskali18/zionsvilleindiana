import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Privacy Policy — ZionsvilleIndiana.com',
  description: 'Privacy policy for ZionsvilleIndiana.com — how we collect and use information.',
  alternates: { canonical: 'https://zionsvilleindiana.com/privacy' },
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb items={[{ label: 'Privacy Policy', href: '/privacy' }]} />

        <div className="mt-6 mb-10">
          <h1 className="font-display text-4xl text-stone-900">Privacy Policy</h1>
          <p className="text-stone-500 mt-2">Last updated: {new Date().getFullYear()}</p>
        </div>

        <div className="prose-village">
          <h2>Overview</h2>
          <p>
            ZionsvilleIndiana.com is a community guide to events, businesses, and life in
            Zionsville, Indiana. This privacy policy explains what information we collect,
            how we use it, and your choices.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We do not collect personal information directly from visitors. We do not operate
            a user account system, mailing list, or contact form at this time.
          </p>
          <p>
            We use <strong>Google Analytics 4 (GA4)</strong> to understand how visitors use
            this site. GA4 may collect:
          </p>
          <ul>
            <li>Pages visited and time spent on the site</li>
            <li>General geographic location (country, region, city)</li>
            <li>Device type, browser, and operating system</li>
            <li>Referring website or search query</li>
          </ul>
          <p>
            This data is aggregated and anonymous. We cannot identify individual visitors
            through Google Analytics.
          </p>

          <h2>Cookies</h2>
          <p>
            Google Analytics uses cookies to distinguish visitors and track sessions. These
            are small text files stored in your browser. You can disable cookies in your
            browser settings or use a browser extension to opt out of Google Analytics
            tracking.
          </p>
          <p>
            To opt out of Google Analytics across all sites, you can install the{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brick-600 hover:text-brick-700"
            >
              Google Analytics Opt-out Browser Add-on
            </a>.
          </p>

          <h2>Third-Party Links</h2>
          <p>
            This site links to external websites including business websites, event pages,
            and government resources. These sites have their own privacy policies and we are
            not responsible for their practices.
          </p>

          <h2>Google Calendar</h2>
          <p>
            The community events calendar on this site pulls data from the Google Calendar
            API. No visitor data is sent to Google Calendar — it is used only to display
            event information.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            This site is not directed at children under 13 and does not knowingly collect
            any personal information from children.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Changes will be reflected
            by updating the date at the top of this page.
          </p>

          {/*
          <h2>Contact</h2>
          <p>
            If you have questions about this privacy policy, you can reach us at{' '}
            <a href="mailto:hello@zionsvilleindiana.com" className="text-brick-600 hover:text-brick-700">
              
            </a>.
          </p>
          */}
        </div>

        <div className="mt-12 pt-6 border-t border-stone-200 flex flex-wrap gap-6">
          <Link href="/disclaimer" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            Disclaimer →
          </Link>
          <Link href="/about" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            About Zionsville →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
