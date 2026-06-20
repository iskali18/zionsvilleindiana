import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Zionsville, Indiana — Facts, Schools & Boone County Resources',
  description:
    'Learn about the Town of Zionsville, Indiana, in Boone County — population, schools, township, government, utilities, and community resources.',
  alternates: { canonical: 'https://zionsvilleindiana.com/about' },
}

const quickFacts = [
  { label: 'State', value: 'Indiana' },
  { label: 'County', value: 'Boone County' },
  { label: 'ZIP Code', value: '46077' },
  { label: 'Population', value: '30,603 (2020 census)' },
  { label: 'Boone County population', value: '73,052 (2020 census)' },
  { label: 'Land area', value: '67.22 square miles' },
  { label: 'Location', value: '~20 miles northwest of Indianapolis' },
  { label: 'Government', value: 'Mayor-Council (since 2015)' },
  { label: 'Known for', value: 'Historic Main Street, the Village district, community events' },
]

const resources = [
  {
    heading: 'Town Government',
    links: [
      { label: 'Town of Zionsville — Official Site', href: 'https://zionsville-in.gov' },
      { label: 'Town Hall & Departments', href: 'https://zionsville-in.gov' },
      { label: 'Town Jobs & Employment', href: 'https://zionsville-in.gov/jobs' },
      { label: 'Waste & Recycling Services', href: 'https://www.zionsville-in.gov/691/Trash-and-Utilities' },
    ],
  },
  {
    heading: 'Schools',
    links: [
      { label: 'Zionsville Community Schools', href: 'https://www.zcs.k12.in.us' },
      { label: 'ZCSC School Calendar & Breaks', href: 'https://www.zcs.k12.in.us/about-zcs/calendars' },
      { label: 'Student Enrollment FAQs', href: 'https://www.zcs.k12.in.us/about-zcs/new-students1/enrollment-frequently-asked-questions' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Zionsville Chamber of Commerce', href: 'https://www.zionsvillechamber.org' },
      { label: 'Hussey-Mayfield Memorial Public Library', href: 'https://hmmpl.org' },
      { label: 'Parks & Recreation Department', href: 'https://zionsville-in.gov/parks' },
      { label: 'Zionsville Farmers Market', href: 'https://www.zionsvillefarmersmarket.org' },
    ],
  },
  {
    heading: 'Utilities — Electric',
    links: [
      { label: 'Duke Energy', href: 'https://www.duke-energy.com' },
      { label: 'Boone REMC (rural/select areas)', href: 'https://www.boonepower.com' },
    ],
  },
  {
    heading: 'Utilities — Natural Gas',
    links: [
      { label: 'CenterPoint Energy', href: 'https://www.centerpointenergy.com' },
      { label: 'Citizens Energy Group', href: 'https://www.citizensenergygroup.com' },
    ],
  },
  {
    heading: 'Utilities — Water & Sewer',
    links: [
      { label: 'Citizens Energy Group', href: 'https://www.citizensenergygroup.com' },
      { label: 'Whitestown Municipal Utilities (western areas)', href: 'https://whitestown.in.gov/government/departments/municipal-utilities/' },
      { label: 'TriCo Regional Sewer Utility (southeast areas)', href: 'https://www.trico.eco' },
    ],
  },
  {
    heading: 'Utilities — Trash & Recycling',
    links: [
      { label: 'Priority Waste (municipal contract)', href: 'https://www.prioritywaste.com' },
      { label: 'Republic Services', href: 'https://www.republicservices.com' },
      { label: 'Town of Zionsville Waste & Recycling', href: 'https://www.zionsville-in.gov/691/Trash-and-Utilities' },
      { label: 'Waste Management & Recycling Services', href: 'https://www.wm.com' },
    ],
  },
  {
    heading: 'Utilities — Cable & Internet',
    links: [

      { label: 'AT&T / AT&T Fiber', href: 'https://www.att.com' },
      { label: 'Metronet (Fiber)', href: 'https://www.metronet.com' },
      { label: 'Spectrum', href: 'https://www.spectrum.com' },
      { label: 'TDS Telecom', href: 'https://www.tdstelecom.com' },
      { label: 'Xfinity (Comcast)', href: 'https://www.xfinity.com' },
    ],
  },
  {
    heading: 'Boone County',
    links: [
      { label: 'Boone County Government', href: 'https://www.boonecounty.in.gov' },
      { label: 'Indiana Voter Registration', href: 'https://indianavoters.in.gov' },
    ],
  },
]

const faqs = [
  {
    q: 'Where is Zionsville, Indiana?',
    a: 'Zionsville is a town in Boone County, Indiana, located about 20 miles northwest of downtown Indianapolis. The historic Village district is located around Main Street, and Zionsville is part of the broader Indianapolis metropolitan area.',
  },
  {
    q: 'What is the ZIP code for Zionsville, Indiana?',
    a: 'The primary ZIP code for Zionsville is 46077.',
  },
  {
    q: 'How far is Zionsville from Indianapolis?',
    a: 'Zionsville is approximately 20 miles northwest of downtown Indianapolis.',
  },
  {
    q: 'What school district is Zionsville in?',
    a: 'Zionsville is served by Zionsville Community Schools (ZCS), which operates elementary, middle, and high schools across the district. ZCS is a highly regarded public school district in Boone County.',
  },
  {
    q: 'What township is Zionsville in?',
    a: 'Zionsville is located within Eagle Township in Boone County, Indiana.',
  },
]

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'City',
  name: 'Zionsville',
  containedInPlace: { '@type': 'State', name: 'Indiana' },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Zionsville',
    addressRegion: 'IN',
    postalCode: '46077',
    addressCountry: 'US',
  },
  description:
    'Zionsville is a town in Boone County, Indiana, located northwest of Indianapolis. It is known for its historic brick-paved Main Street, the Village district, and community events.',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb items={[{ label: 'About', href: '/about' }]} />

        <div className="mt-6 mb-10">
          <h1 className="font-display text-4xl text-stone-900">About the Town of Zionsville, Indiana</h1>
          <p className="text-stone-500 mt-2 text-lg">
            Quick facts and community resources for residents and visitors.
          </p>
        </div>

        {/* Quick facts */}
        <section className="mb-12">
          <h2 className="font-display text-2xl text-stone-800 mb-5">Quick Facts</h2>
          <dl className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-100">
            {quickFacts.map(({ label, value }) => (
              <div key={label} className="grid grid-cols-2 sm:grid-cols-3 px-5 py-3 gap-2">
                <dt className="text-sm text-stone-400 font-medium">{label}</dt>
                <dd className="text-sm text-stone-700 col-span-1 sm:col-span-2">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* About the town — prose */}
        <section className="prose-village mb-12">
          <h2>Zionsville, Indiana</h2>
          <p>
            Zionsville is a town in Boone County, Indiana, northwest of Indianapolis.
            Its historic Village district includes brick-paved Main Street, locally
            owned shops, restaurants, cafés, and nearby residential streets.
          </p>
          <p>
            The town&apos;s character shows up in its historic architecture, local businesses,
            parks, trails, and community calendar. Annual and seasonal events include
            the Farmers Market, Fall Festival, and Christmas in the Village. Outdoor
            areas such as the Rail Trail, Lions Park, and local nature preserves
            add recreation space throughout the year.
          </p>
          <p>
            Zionsville is located within Eagle Township in Boone County and is served
            by Zionsville Community Schools, a highly regarded public school district.
            The town is also part of the broader Indianapolis metropolitan area.
          </p>
        </section>

        {/* Community resources */}
        <section className="mb-12">
          <h2 className="font-display text-2xl text-stone-800 mb-6">Community Resources</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {resources.map((section) => (
              <div key={section.heading} className="bg-white border border-stone-200 rounded-lg p-5">
                <h3 className="font-display text-base font-semibold text-stone-800 mb-3">
                  {section.heading}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brick-600 hover:text-brick-700"
                      >
                        {link.label} →
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <div className="pt-6 border-t border-stone-200 flex flex-wrap gap-6">
          <Link href="/events" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            See upcoming events →
          </Link>
          <Link href="/downtown" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            Explore downtown →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
