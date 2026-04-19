import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { getAllBusinesses } from '@/lib/content'
import type { BusinessCategory } from '@/types'

export const metadata: Metadata = {
  title: 'Zionsville Business Directory',
  description:
    'A directory of local businesses in Zionsville, Indiana — dining, coffee, boutiques, and more in the Village district.',
  alternates: { canonical: 'https://zionsvilleindiana.com/businesses' },
}

const categoryLabels: Record<BusinessCategory, string> = {
  dining: 'Dining',
  coffee: 'Coffee & Cafés',
  shopping: 'Shopping',
  boutique: 'Boutiques',
  services: 'Services',
  entertainment: 'Entertainment',
  lodging: 'Hotels & Inns',
}

export default function BusinessesPage() {
  const businesses = getAllBusinesses()

  const byCategory = businesses.reduce<Partial<Record<BusinessCategory, typeof businesses>>>(
    (acc, b) => {
      if (!acc[b.category]) acc[b.category] = []
      acc[b.category]!.push(b)
      return acc
    },
    {}
  )

  // Sort each category alphabetically by name
  for (const cat of Object.keys(byCategory) as BusinessCategory[]) {
    byCategory[cat]!.sort((a, b) => a.name.localeCompare(b.name))
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Zionsville Business Directory',
    itemListElement: businesses.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://zionsvilleindiana.com/businesses/${b.slug}`,
      name: b.name,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb items={[{ label: 'Businesses', href: '/businesses' }]} />

        <div className="mt-6 mb-10">
          <h1 className="font-display text-4xl text-stone-900">Zionsville Businesses</h1>
          <p className="text-stone-500 mt-2 text-lg">
            Local businesses in the Village and surrounding Zionsville area.
          </p>
        </div>

        {(Object.keys(categoryLabels) as BusinessCategory[]).map((cat) => {
          const items = byCategory[cat]
          if (!items?.length) return null
          return (
            <section key={cat} className="mb-12">
              <h2 className="font-display text-2xl text-stone-800 mb-4">{categoryLabels[cat]}</h2>
              <div className="overflow-x-auto rounded-lg border border-stone-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider w-[35%]">Business</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider w-[35%]">Description</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider w-[30%]">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {items.map((b) => (
                      <tr key={b.slug} className="hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <Link
                            href={`/businesses/${b.slug}`}
                            className="text-brick-600 hover:text-brick-700"
                          >
                            {b.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-stone-600">{b.shortDescription ?? b.description}</td>
                        <td className="px-4 py-3 text-stone-500">{b.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )
        })}

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <div className="mt-4 pt-6 border-t border-stone-200 flex flex-wrap gap-6">
          <Link href="/downtown" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            Explore downtown Zionsville →
          </Link>
          <Link href="/events" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            See upcoming events →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
