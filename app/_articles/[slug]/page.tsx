import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllArticleSlugs, getArticle } from '@/lib/content'
import ArticleLayout from '@/components/ArticleLayout'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { meta } = await getArticle(slug)
    return {
      title: meta.seoTitle,
      description: meta.description,
      alternates: { canonical: `https://zionsvilleindiana.com/articles/${slug}` },
      openGraph: {
        title: meta.seoTitle,
        description: meta.description,
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
    return <ArticleLayout meta={meta} contentHtml={contentHtml} pathPrefix="/articles" />
  } catch {
    notFound()
  }
}
