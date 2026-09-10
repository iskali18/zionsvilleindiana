import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllArticleSlugs, getArticle } from '@/lib/content'
import ArticleLayout from '@/components/ArticleLayout'
import ZcsCalendar from '@/components/ZcsCalendar'
import ZcsMilestones from '@/components/ZcsMilestones'
import FallFarmComparison from '@/components/FallFarmComparison'
import { DESTINATIONS } from '@/lib/fall-farms'
import SeasonalGuidesStrip from '@/components/SeasonalGuidesStrip'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllArticleSlugs()
    .filter((slug) => slug !== 'things-to-do')
    .map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { meta } = await getArticle(slug)
    return {
      title: meta.metaTitle,
      description: meta.metaDescription,
      alternates: { canonical: `https://zionsvilleindiana.com/articles/${slug}` },
      openGraph: {
        title: meta.metaTitle,
        description: meta.metaDescription,
        url: `https://zionsvilleindiana.com/articles/${slug}`,
        type: 'article',
        ...(meta.hero_image && {
          images: [{ url: meta.hero_image }],
        }),
      },
    }
  } catch {
    return {}
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params

  try {
    const { meta, contentHtml } = await getArticle(slug)

    return (
      <ArticleLayout
        meta={meta}
        contentHtml={contentHtml}
        pathPrefix="/articles"
        {...(slug === 'pumpkin-patches-corn-mazes-near-indianapolis'
          ? {
              // Built from the same data the comparison table reads, so the
              // schema cannot drift from what is on the page.
              itemListName: 'Fall farms and orchards near Zionsville and Indianapolis',
              itemList: DESTINATIONS.map((d) => ({
                name: d.name,
                href: `#${d.anchor}`,
                description: d.highlights,
              })),
            }
          : {})}
        injectAt={
          slug === 'pumpkin-patches-corn-mazes-near-indianapolis'
            ? '<!-- FALL_FARM_COMPARISON -->'
            : undefined
        }
      >
        {slug === 'zcs-school-calendar' && (
          <>
            <ZcsMilestones />
            {/* Between the milestone dates and the calendar — people have the
                date they came for, and it stays above the fold. */}
            <SeasonalGuidesStrip kind="schoolBreak" className="mb-8" />
            <ZcsCalendar />
          </>
        )}
        {slug === 'pumpkin-patches-corn-mazes-near-indianapolis' && <FallFarmComparison />}
      </ArticleLayout>
    )
  } catch {
    notFound()
  }
}
