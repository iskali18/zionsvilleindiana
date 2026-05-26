import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'
import type { ArticleMeta } from '@/types'

interface ArticleLayoutProps {
  meta: ArticleMeta
  contentHtml: string
}

export default function ArticleLayout({ meta, contentHtml }: ArticleLayoutProps) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.seoTitle,
    description: meta.description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://zionsvilleindiana.com/${meta.slug}`,
    },
    ...(meta.lastUpdated && { dateModified: meta.lastUpdated }),
    publisher: {
      '@type': 'Organization',
      name: 'Zionsville Indiana',
      url: 'https://zionsvilleindiana.com',
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://zionsvilleindiana.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: meta.title,
        item: `https://zionsvilleindiana.com/${meta.slug}`,
      },
    ],
  }

  // FAQ schema emitted invisibly when meta.faqs is present.
  // The visible FAQ section is intentionally NOT rendered on the page.
  const faqSchema = meta.faqs && meta.faqs.length > 0
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <Header />
      <main>
        {/* Hero with overlaid H1 */}
        {meta.hero_image && (
          <div className="relative h-72 sm:h-96 bg-stone-900 overflow-hidden">
            <Image
              src={meta.hero_image}
              alt={meta.title}
              fill
              className="object-cover object-[center_55%] opacity-90"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <div className="absolute top-4 left-4 sm:left-6">
              <Breadcrumb
                items={[
                  { label: meta.title, href: `/${meta.slug}` },
                ]}
                light
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-6">
              <h1 className="font-display text-3xl sm:text-4xl text-white font-bold leading-tight">
                {meta.title}
              </h1>
              {meta.hero_credit && (
                <p
                  className="absolute bottom-2 right-3 text-white/60 text-xs"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                >
                  {meta.hero_credit}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Fallback breadcrumb + H1 if no hero */}
          {!meta.hero_image && (
            <>
              <Breadcrumb
                items={[
                  { label: meta.title, href: `/${meta.slug}` },
                ]}
              />
              <h1 className="font-display text-3xl sm:text-4xl text-stone-900 font-bold mt-4 mb-8">
                {meta.title}
              </h1>
            </>
          )}

          {/* Body content */}
          <div
            className="prose-village"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Last updated */}
          {meta.lastUpdated && (
            <p className="text-sm text-stone-500 mt-10">
              Last updated: {formatDate(meta.lastUpdated)}
            </p>
          )}

          {/* CTAs */}
          {meta.ctas && meta.ctas.length > 0 && (
            <div className="mt-10 pt-6 border-t border-stone-200 flex flex-wrap gap-6">
              {meta.ctas.map((cta) => (
                <Link
                  key={cta.href}
                  href={cta.href}
                  className="text-sm text-brick-600 hover:text-brick-700 font-medium"
                >
                  {cta.label} →
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function formatDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso + 'T00:00:00') : iso
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
