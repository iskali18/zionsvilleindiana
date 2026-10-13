import type { MetadataRoute } from 'next'
import { getEventPageSlugs, getAllBusinessSlugs, getAllParkSlugs, getAllArticles, getAllParks } from '@/lib/content'

const BASE = 'https://zionsvilleindiana.com'

/** Park pages aren't live yet. Set to true at launch to list them here. */
const PARKS_LIVE = false

export default function sitemap(): MetadataRoute.Sitemap {
  const eventSlugs = getEventPageSlugs()
  const businessSlugs = getAllBusinessSlugs()
  // Parks whose canonical URL is an article (Mulberry Fields, Big-4 trailheads)
  // are excluded — they'd otherwise duplicate the article entries.
  const parkSlugs = getAllParks()
    .filter((p) => !p.internalUrl)
    .map((p) => p.slug)
  // Drafts are left out, matching the articles hub.
  const articles = getAllArticles().filter((a) => !a.draft)
  const articleSlugs = articles.map((a) => a.slug)
  // Each article's own lastUpdated, so Google sees a date only when the page
  // actually changed. Articles without one are listed with no date.
  const articleUpdated = new Map(articles.map((a) => [a.slug, a.lastUpdated] as const))

  // Only the homepage and events page change daily (events come and go), so
  // only they carry today's date. Other pages leave lastModified out rather
  // than claim a change that didn't happen.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/articles`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/downtown`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/businesses`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/tools/zcs-k8-schedule`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/tools/zchs-schedule`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/disclaimer`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const eventRoutes: MetadataRoute.Sitemap = eventSlugs.map((slug) => ({
    url: `${BASE}/events/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const businessRoutes: MetadataRoute.Sitemap = businessSlugs.map((slug) => ({
    url: `${BASE}/businesses/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const parkRoutes: MetadataRoute.Sitemap = parkSlugs.map((slug) => ({
    url: `${BASE}/parks/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${BASE}/articles/${slug}`,
    ...(articleUpdated.get(slug) ? { lastModified: articleUpdated.get(slug) } : {}),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...eventRoutes,
    ...businessRoutes,
    ...(PARKS_LIVE ? parkRoutes : []),
    ...articleRoutes,
  ]
}
