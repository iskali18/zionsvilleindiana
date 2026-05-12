import type { Metadata } from 'next'
import { getArticle } from '@/lib/content'
import ArticleLayout from '@/components/ArticleLayout'

const SLUG = 'things-to-do'

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getArticle(SLUG)
  return {
    title: meta.seoTitle,
    description: meta.description,
    alternates: {
      canonical: `/${SLUG}`,
    },
    openGraph: {
      title: meta.seoTitle,
      description: meta.description,
      url: `https://zionsvilleindiana.com/${SLUG}`,
      type: 'article',
      ...(meta.hero_image && {
        images: [{ url: meta.hero_image }],
      }),
    },
  }
}

export default async function ThingsToDoPage() {
  const { meta, contentHtml } = await getArticle(SLUG)
  return <ArticleLayout meta={meta} contentHtml={contentHtml} />
}
