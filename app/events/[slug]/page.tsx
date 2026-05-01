import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { getAllEventSlugs, getEvent } from '@/lib/content'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllEventSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { meta } = await getEvent(slug)
    return {
      title: meta.metaTitle,
      description: meta.metaDescription,
      alternates: { canonical: `https://zionsvilleindiana.com/events/${slug}` },
      openGraph: {
        title: meta.metaTitle,
        description: meta.metaDescription,
        images: [{ url: meta.image }],
      },
    }
  } catch {
    return {}
  }
}

function buildEventSchema(meta: Awaited<ReturnType<typeof getEvent>>['meta']) {
  return {
    '@context': 'https://schema.org',
    '@type': meta.eventType === 'recurring' ? 'EventSeries' : 'Event',
    name: meta.title,
    description: meta.description,
    startDate: meta.startDate,
    ...(meta.endDate && { endDate: meta.endDate }),
    location: {
      '@type': 'Place',
      name: meta.location,
      address: {
        '@type': 'PostalAddress',
        streetAddress: meta.address,
        addressLocality: 'Zionsville',
        addressRegion: 'IN',
        postalCode: '46077',
        addressCountry: 'US',
      },
    },
    image: `https://zionsvilleindiana.com${meta.image}`,
    url: `https://zionsvilleindiana.com/events/${meta.slug}`,
    organizer: {
      '@type': 'Organization',
      name: 'ZionsvilleIndiana.com',
      url: 'https://zionsvilleindiana.com',
    },
  }
}

function formatEventDate(meta: Awaited<ReturnType<typeof getEvent>>['meta']): string {
  if (meta.perennial && meta.perennialLabel) return meta.perennialLabel
  if (meta.recurrenceLabel) return meta.recurrenceLabel
  if (meta.endDate && meta.endDate !== meta.startDate) {
    const start = new Date(meta.startDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    })
    const end = new Date(meta.endDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    })
    return `${start} – ${end}`
  }
  return new Date(meta.startDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
  })
}

const getLinkText = (url: string) => {
  const clean = url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
  return `${clean} →`
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params
  let data: Awaited<ReturnType<typeof getEvent>>

  try {
    data = await getEvent(slug)
  } catch {
    notFound()
  }

  const { meta, contentHtml } = data

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildEventSchema(meta)) }}
      />
      {meta.faqs && meta.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: meta.faqs.map(({ q, a }) => ({
                '@type': 'Question',
                name: q,
                acceptedAnswer: { '@type': 'Answer', text: a },
              })),
            }),
          }}
        />
      )}
      <Header />
      <main>
        {/* ── Hero with overlaid H1 ─────────────────────────────────── */}
        <div className="relative h-72 sm:h-96 bg-stone-900 overflow-hidden">
          <Image
            src={meta.image}
            alt={meta.imageAlt}
            fill
            className="object-cover object-[center_55%] opacity-90"
            priority
          />
          {/* Dark gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Breadcrumb top-left */}
          <div className="absolute top-4 left-4 sm:left-6">
            <Breadcrumb
              items={[
                { label: 'Events', href: '/events' },
                { label: meta.title, href: `/events/${slug}` },
              ]}
              light
            />
          </div>

          {/* H1 + date + location bottom-left, photo credit bottom-right */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-6">
            <p className="text-brick-300 font-medium text-sm mb-1">
              {formatEventDate(meta)}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl text-white font-bold leading-tight mb-1">
              {meta.title}
            </h1>
            <p className="text-stone-300 text-sm">{meta.location}</p>
            {meta.photoCredit && (
              <p
                className="absolute bottom-2 right-3 text-white/60 text-xs"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
              >
                {meta.photoCredit}
              </p>
            )}
          </div>

          {/* Photo credit bottom-right */}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Details strip */}
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-5 mb-10 grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">When</p>
              <p className="text-stone-700 font-medium">{formatEventDate(meta)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Where</p>
              <p className="text-stone-700 font-medium">{meta.location}</p>
            </div>
            {meta.externalUrl && !meta.perennial && (
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">More info</p>
                <a
                  href={meta.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brick-600 hover:text-brick-700 font-medium"
                >
                  {getLinkText(meta.externalUrl)}
                </a>
              </div>
            )}
          </div>

          {/* Body content */}
          <div
            className="prose-village"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Map (optional, set via mapEmbedUrl in frontmatter) */}
          {meta.mapEmbedUrl && (
            <section className="mt-10">
              <h2 className="font-display text-2xl text-stone-800 font-bold mb-2">
                Parking & nearby restaurants
              </h2>
              <p className="text-sm text-stone-600 mb-4">
                Tap a pin for details. Map opens in Google Maps for directions.
              </p>
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-stone-200 shadow-sm">
                <iframe
                  src={meta.mapEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  title={meta.mapTitle ?? `${meta.title} map`}
                />
              </div>
            </section>
          )}

          {/* Tags */}
          {meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-stone-200">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-stone-100 text-stone-500 px-3 py-1 rounded-full capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* ── CTA ──────────────────────────────────────────────────── */}
          <div className="mt-10 pt-6 border-t border-stone-200 flex flex-wrap gap-6">
            <Link href="/events" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
              ← All events
            </Link>
            <Link href="/downtown" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
              Explore downtown Zionsville →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
