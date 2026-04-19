import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Disclaimer — ZionsvilleIndiana.com',
  description: 'Disclaimer for ZionsvilleIndiana.com — a community guide to events, businesses, and life in Zionsville, Indiana.',
  alternates: { canonical: 'https://zionsvilleindiana.com/disclaimer' },
}

export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb items={[{ label: 'Disclaimer', href: '/disclaimer' }]} />

        <div className="mt-6 mb-10">
          <h1 className="font-display text-4xl text-stone-900">Disclaimer</h1>
          <p className="text-stone-500 mt-2">Last updated: {new Date().getFullYear()}</p>
        </div>

        <div className="prose-village">
          <h2>General Information Only</h2>
          <p>
            ZionsvilleIndiana.com is an independently operated community guide to events,
            businesses, and life in Zionsville, Indiana. The information on this site is
            provided for general informational purposes only. It is not affiliated with the
            Town of Zionsville, Boone County, or any government agency.
          </p>

          <h2>Accuracy of Business Listings</h2>
          <p>
            Business listings on this site — including addresses, phone numbers, hours of
            operation, and descriptions — are maintained on a best-effort basis and may not
            reflect current conditions. Businesses change hours, relocate, or close without
            notice. We recommend verifying information directly with the business before
            visiting.
          </p>

          <h2>Event Information</h2>
          <p>
            Event dates, times, locations, and details are subject to change or cancellation
            at any time. Always confirm event details with the official organizer before
            attending. ZionsvilleIndiana.com is not responsible for changes to events listed
            on this site.
          </p>

          <h2>External Links</h2>
          <p>
            This site contains links to third-party websites. These links are provided for
            convenience only. ZionsvilleIndiana.com has no control over the content of
            external sites and does not endorse or take responsibility for their content,
            accuracy, or availability.
          </p>

          <h2>No Warranties</h2>
          <p>
            This site is provided "as is" without any representations or warranties, express
            or implied. ZionsvilleIndiana.com makes no warranties regarding the completeness,
            accuracy, reliability, or suitability of the information on this site for any
            particular purpose.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            ZionsvilleIndiana.com will not be liable for any loss or damage — including
            indirect or consequential loss or damage — arising from the use of, or inability
            to use, information on this site.
          </p>

          {/*
          <h2>Contact</h2>
          <p>
            If you believe any information on this site is inaccurate, please reach out so
            we can review and correct it.
          </p>
          */}
        </div>

        <div className="mt-12 pt-6 border-t border-stone-200 flex flex-wrap gap-6">
          <Link href="/privacy" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            Privacy Policy →
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
