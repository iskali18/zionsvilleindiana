import type { MetadataRoute } from 'next'
import { getAllEventSlugs, getAllBusinessSlugs, getAllParkSlugs, getAllArticleSlugs } from '@/lib/content'

const BASE = 'https://zionsvilleindiana.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const eventSlugs = getAllEventSlugs()
  const businessSlugs = getAllBusinessSlugs()
  const parkSlugs = getAllParkSlugs()
  const articleSlugs = getAllArticleSlugs()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/articles`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/downtown`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/businesses`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/tools/zcs-k8-schedule`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/tools/zchs-schedule`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const eventRoutes: MetadataRoute.Sitemap = eventSlugs.map((slug) => ({
    url: `${BASE}/events/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const businessRoutes: MetadataRoute.Sitemap = businessSlugs.map((slug) => ({
    url: `${BASE}/businesses/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const parkRoutes: MetadataRoute.Sitemap = parkSlugs.map((slug) => ({
    url: `${BASE}/parks/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${BASE}/articles/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...eventRoutes, ...businessRoutes, ...parkRoutes, ...articleRoutes]
}
