import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { getAllBusinesses } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Shopping in Downtown Zionsville, Indiana',
  description:
    'Boutiques, gift shops, and local stores in downtown Zionsville along Main Street in the Village district.',
  alternates: { canonical: 'https://zionsvilleindiana.com/downtown/shopping' },
}

export default function ShoppingPage() {
  const all = getAllBusinesses()
  const shopping = all.filter((b) =>
    ['shopping', 'boutique'].includes(b.category)
  )

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb
          items={[
            { label: 'Downtown', href: '/downtown' },
            { label: 'Shopping', href: '/downtown/shopping' },
          ]}
        />

        <div className="mt-6 mb-10">
          <h1 className="font-display text-4xl text-stone-900">Shopping in Zionsville</h1>
          <p className="text-stone-500 mt-2 text-lg">
            Boutiques and local shops along Main Street.
          </p>
        </div>

        {shopping.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {shopping.map((b) => (
              <Link
                key={b.slug}
                href={`/businesses/${b.slug}`}
                className="group bg-white rounded-lg border border-stone-200 hover:border-brick-300 hover:shadow-md transition-all p-5"
              >
                <h3 className="font-display text-lg text-stone-900 group-hover:text-brick-600 transition-colors mb-1">
                  {b.name}
                </h3>
                <p className="text-sm text-stone-500 line-clamp-2">{b.description}</p>
                {b.address && (
                  <p className="text-xs text-stone-400 mt-3">{b.address}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-stone-500 mb-12">Shopping listings coming soon.</p>
        )}

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <div className="pt-6 border-t border-stone-200 flex flex-wrap gap-6">
          <Link href="/downtown/dining" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            Explore downtown dining →
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
