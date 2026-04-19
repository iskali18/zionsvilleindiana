import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { getAllBusinesses } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Dining in Downtown Zionsville, Indiana',
  description:
    'Restaurants, coffee shops, and cafés in downtown Zionsville — from casual brunch spots to sit-down dinners on Main Street.',
  alternates: { canonical: 'https://zionsvilleindiana.com/downtown/dining' },
}

export default function DiningPage() {
  const all = getAllBusinesses()
  const dining = all.filter((b) => b.category === 'dining')
  const coffee = all.filter((b) => b.category === 'coffee')

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb
          items={[
            { label: 'Downtown', href: '/downtown' },
            { label: 'Dining', href: '/downtown/dining' },
          ]}
        />

        <div className="mt-6 mb-10">
          <h1 className="font-display text-4xl text-stone-900">Dining in Zionsville</h1>
          <p className="text-stone-500 mt-2 text-lg">
            Restaurants and cafés in the Village district.
          </p>
        </div>

        {coffee.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-2xl text-stone-800 mb-5">Coffee &amp; Cafés</h2>
            <BusinessGrid businesses={coffee} />
          </section>
        )}

        {dining.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-2xl text-stone-800 mb-5">Restaurants</h2>
            <BusinessGrid businesses={dining} />
          </section>
        )}

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <div className="mt-6 pt-6 border-t border-stone-200 flex flex-wrap gap-6">
          <Link href="/downtown/shopping" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            Explore downtown shopping →
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

function BusinessGrid({ businesses }: { businesses: ReturnType<typeof getAllBusinesses> }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {businesses.map((b) => (
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
  )
}
