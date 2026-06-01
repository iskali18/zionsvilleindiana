import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
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

const getLinkText = (url: string) => {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '') + ' →';
};

// Collect up to 5 gallery images for a business by filename convention:
// /public/images/businesses/zionsville-{slug}-1.jpg ... zionsville-{slug}-5.jpg.
// Only files that actually exist are returned, so dropping in images is
// all that's needed — no frontmatter edits. Returns [] if none exist.
function getGalleryImages(slug: string): string[] {
  const found: string[] = []
  for (let i = 1; i <= 5; i++) {
    const rel = `/images/businesses/zionsville-${slug}-${i}.jpg`
    try {
      if (fs.existsSync(path.join(process.cwd(), 'public', rel))) {
        found.push(rel)
      }
    } catch {
      // ignore and continue
    }
  }
  return found
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

  const galleryImages = getGalleryImages(slug)

  const allParks = getAllParks()
  const nearbyParks = meta.nearbyParks
    ? allParks.filter((p) => meta.nearbyParks!.includes(p.slug))
    : []

  // FAQ schema (invisible) — emitted when the business MD has a `faqs` frontmatter array.
  const faqSchema =
    meta.faqs && meta.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: meta.faqs.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        }
      : null

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
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

        <dl className="font-mono text-sm leading-7 mb-10 bg-stone-50 border border-stone-200 rounded-lg px-5 py-4 space-y-1">
          {meta.phone && (
            <div>
              <span className="inline-block w-32 sm:w-40 text-stone-500 font-medium">Phone</span>
              <a href={`tel:${meta.phone}`} className="text-stone-900 font-semibold hover:text-brick-600">
                {meta.phone}
              </a>
            </div>
          )}
          {meta.website && (
            <div>
              <span className="inline-block w-32 sm:w-40 text-stone-500 font-medium">Website</span>
              <a
                href={meta.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brick-600 hover:text-brick-700"
              >
                {getLinkText(meta.website)}
              </a>
            </div>
          )}
          {meta.googleMapsUrl && (
            <div>
              <span className="inline-block w-32 sm:w-40 text-stone-500 font-medium">Hours</span>
              <a
                href={meta.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brick-600 hover:text-brick-700"
              >
                View on Google Maps →
              </a>
            </div>
          )}
        </dl>

        {galleryImages[0] && (
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-stone-200 shadow-sm mb-8">
            <Image
              src={galleryImages[0]}
              alt={meta.galleryAlt?.[0] || `${meta.name} in Zionsville, Indiana`}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>
        )}

        {contentHtml && (
          <div
            className="prose-village mb-6"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}

        {galleryImages.length > 1 && (
          <div className="space-y-4 mb-10">
            {galleryImages.slice(1).map((src, i) => (
              <div
                key={src}
                className="relative aspect-[4/3] rounded-lg overflow-hidden bg-stone-200 shadow-sm"
              >
                <Image
                  src={src}
                  alt={meta.galleryAlt?.[i + 1] || `${meta.name} in Zionsville, Indiana`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              </div>
            ))}
          </div>
        )}

        {(meta.address || meta.website || meta.googleMapsUrl) && (
          <div className="mt-10 pt-8 border-t border-stone-100">
            <h2 className="font-display text-xl text-stone-900 mb-4">Plan your visit</h2>
            <div className="space-y-2 text-stone-700">
              {meta.address && (
                <p>
                  <strong className="text-stone-900">Address:</strong>{' '}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meta.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brick-600 hover:text-brick-700"
                  >
                    {meta.address} →
                  </a>
                </p>
              )}
              {meta.website && (
                <p>
                  <strong className="text-stone-900">Website:</strong>{' '}
                  <a
                    href={meta.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brick-600 hover:text-brick-700"
                  >
                    {getLinkText(meta.website)}
                  </a>
                </p>
              )}
              {meta.googleMapsUrl && (
                <p className="text-sm text-stone-600">
                  Hours may change with seasons and holidays. Check the{' '}
                  <a
                    href={meta.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brick-600 hover:text-brick-700"
                  >
                    Google Maps business page →
                  </a>{' '}
                  before visiting.
                </p>
              )}
            </div>
          </div>
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
            Business directory →
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
