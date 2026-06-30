import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'
import type { ArticleMeta } from '@/types'

interface ArticleLayoutProps {
  meta: ArticleMeta
  contentHtml: string
  /** URL path prefix for the article. Empty string for root-level routes (e.g. /things-to-do).
   *  Use "/articles" for articles under the articles hub. Affects schema URLs and breadcrumbs. */
  pathPrefix?: string
  /** Optional content rendered inside the main content area, AFTER the article body
   *  and BEFORE the lastUpdated/CTAs section. Use for interactive components like calendars. */
  children?: React.ReactNode
}

export default function ArticleLayout({ meta, contentHtml, pathPrefix = '', children }: ArticleLayoutProps) {
  const fullPath = `${pathPrefix}/${meta.slug}`

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.seoTitle,
    description: meta.description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://zionsvilleindiana.com${fullPath}`,
    },
    ...(meta.lastUpdated && { dateModified: meta.lastUpdated }),
    publisher: {
      '@type': 'Organization',
      name: 'Zionsville Indiana',
      url: 'https://zionsvilleindiana.com',
    },
  }

  const breadcrumbItems = pathPrefix === '/articles'
    ? [
        { label: 'Articles', href: '/articles' },
        { label: meta.title, href: fullPath },
      ]
    : [
        { label: meta.title, href: fullPath },
      ]

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
      ...(pathPrefix === '/articles'
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Articles',
              item: 'https://zionsvilleindiana.com/articles',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: meta.title,
              item: `https://zionsvilleindiana.com${fullPath}`,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 2,
              name: meta.title,
              item: `https://zionsvilleindiana.com${fullPath}`,
            },
          ]),
    ],
  }

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
        {meta.hero_image && !meta.hide_hero && (
          <div className="relative h-72 sm:h-96 bg-stone-900 overflow-hidden">
            <Image
              src={meta.hero_image}
              alt={meta.title}
              fill
              className="object-cover opacity-90"
              style={{ objectPosition: meta.hero_position || 'center 55%' }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <div className="absolute top-4 left-4 sm:left-6">
              <Breadcrumb
                items={breadcrumbItems}
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
          {/* Fallback breadcrumb + H1 if no hero, or if hero is hidden */}
          {(!meta.hero_image || meta.hide_hero) && (
            <>
              <Breadcrumb
                items={breadcrumbItems}
              />
              <h1 className="font-display text-3xl sm:text-4xl text-stone-900 font-bold mt-4 mb-8">
                {meta.title}
              </h1>
            </>
          )}

          <div
            className={meta.print_hide_body ? "prose-village print:hidden" : "prose-village"}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Optional children (e.g. interactive components like the ZCS calendar) */}
          {children}

          {meta.lastUpdated && (
            <p className="text-sm text-stone-500 mt-10">
              Last updated: {formatDate(meta.lastUpdated)}
            </p>
          )}

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
