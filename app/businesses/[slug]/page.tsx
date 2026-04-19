import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { getAllBusinessSlugs, getBusiness, getAllParks } from '@/lib/content'
import { parkingBlurbs } from '@/lib/parking'
import type { BusinessCategory } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllBusinessSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { meta } = await getBusiness(slug)
    return {
      title: meta.seo_title || meta.metaTitle,
      description: meta.metaDescription,
      alternates: { canonical: `https://zionsvilleindiana.com/businesses/${slug}` },
    }
  } catch {
    return {}
  }
}

const categoryLabels: Record<BusinessCategory, string> = {
  dining: 'Restaurant',
  coffee: 'Coffee & Café',
  shopping: 'Shop',
  boutique: 'Boutique',
  services: 'Services',
  entertainment: 'Entertainment',
  lodging: 'Hotel & Inn',
}

const getLinkText = (name: string, url: string) => {
  const cleanUrl = url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');

  if (cleanUrl.length > 25 || cleanUrl.includes('facebook.com') || cleanUrl.includes('instagram.com')) {
    return `Visit ${name} website →`;
  }

  return `${cleanUrl} →`;
};

function formatVerifiedDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params
  let data;

  try {
    data = await getBusiness(slug)
  } catch {
    notFound()
  }

  const { meta, contentHtml } = data
  
  const areaParking = meta.area ? parkingBlurbs[meta.area as keyof typeof parkingBlurbs] : []

  const allParks = getAllParks()
  const nearbyParks = meta.nearbyParks
    ? allParks.filter((p) => meta.nearbyParks!.includes(p.slug))
    : []

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb
          items={[
            { label: 'Businesses', href: '/businesses' },
            { label: meta.name, href: `/businesses/${slug}` },
          ]}
        />

        <div className="mt-6 mb-8">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">
            {categoryLabels[meta.category as BusinessCategory]}
          </p>
          <h1 className="font-display text-4xl text-stone-900 mb-2">{meta.name} — Zionsville, Indiana</h1>
          <p className="text-stone-500">{meta.address}</p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-lg p-5 mb-10 grid sm:grid-cols-3 gap-4 text-sm">
          {meta.phone && (
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Phone</p>
              <a href={`tel:${meta.phone}`} className="text-stone-700 font-medium hover:text-brick-600">
                {meta.phone}
              </a>
            </div>
          )}
          {meta.website && (
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Website</p>
              <a
                href={meta.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brick-600 hover:text-brick-700 font-medium"
              >
                {getLinkText(meta.name, meta.website)}
              </a>
            </div>
          )}
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Listing verified</p>
            <p className="text-stone-500">{formatVerifiedDate(meta.lastVerified)}</p>
          </div>
        </div>

        {contentHtml && (
          <div
            className="prose-village mb-6"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}

        {areaParking && areaParking.length > 0 && (
          <div className="mt-10 pt-8 border-t border-stone-100">
            <h2 className="font-display text-xl text-stone-900 mb-4">Parking Information</h2>
              <ul className="list-disc ml-5 space-y-3">
                {areaParking.map((tip, index) => (
                  <li key={index} className="text-sm text-stone-700 leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
          </div>
        )}

        {nearbyParks.length > 0 && (
          <div className="bg-village-50 border border-village-200 rounded-lg p-5 mt-10 mb-8">
            <h2 className="font-display text-lg text-stone-800 mb-3">Nearby parks &amp; trails</h2>
            <ul className="space-y-2">
              {nearbyParks.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/parks/${p.slug}`}
                    className="text-sm text-village-600 hover:text-village-700 font-medium"
                  >
                    {p.name}
                  </Link>
                  <span className="text-stone-400 text-sm"> — {p.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-stone-200 flex flex-wrap gap-6">
          <Link href="/businesses" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            ← Business directory
          </Link>
          <Link href="/downtown" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            Explore downtown Zionsville →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
