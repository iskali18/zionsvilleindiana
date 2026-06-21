import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { getAllArticles } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Articles & Guides — Zionsville, Indiana',
  description:
    'In-depth guides and articles about Zionsville, Indiana — covering the parks and trails, downtown Zionsville, things to do, and more.',
  alternates: { canonical: 'https://zionsvilleindiana.com/articles' },
}

export default function ArticlesPage() {
  // Hide drafts from the public hub. Drafts remain directly accessible at their URL for previewing.
  const articles = getAllArticles().filter((a) => !a.draft && a.slug !== 'things-to-do')

  // ItemList schema with the visible articles
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Articles & Guides about Zionsville, Indiana',
    url: 'https://zionsvilleindiana.com/articles',
    numberOfItems: articles.length,
    itemListElement: articles.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://zionsvilleindiana.com/articles/${a.slug}`,
      name: a.title,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb items={[{ label: 'Guides', href: '/articles' }]} />

        <div className="mt-6 mb-4">
          <h1 className="font-display text-4xl text-stone-900">Articles &amp; Guides</h1>
        </div>

        <div className="max-w-3xl mb-10">
          <p className="text-stone-600 leading-relaxed">
            In-depth guides and articles about Zionsville, Indiana — covering the parks and trails, downtown Zionsville, things to do, and more.
          </p>
        </div>

        {articles.length === 0 ? (
          <p className="text-stone-400 text-sm">No articles published yet. Check back soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group bg-white rounded-lg overflow-hidden border border-stone-200 hover:border-brick-300 hover:shadow-md transition-all"
              >
                {article.hero_image && (
                  <div className="relative aspect-[16/9] bg-stone-100">
                    <Image
                      src={article.hero_image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-display text-lg text-stone-900 group-hover:text-brick-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                    {article.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-stone-200 flex flex-wrap gap-6">
          <Link href="/events" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            See upcoming events →
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
