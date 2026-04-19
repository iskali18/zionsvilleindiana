import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import type { EventMeta, ParkMeta, BusinessMeta } from '@/types'

const contentDir = path.join(process.cwd(), 'content')

// ─── Generic helpers ─────────────────────────────────────────────────────────

function getContentDir(section: string) {
  return path.join(contentDir, section)
}

function getSlugs(section: string): string[] {
  return fs
    .readdirSync(getContentDir(section))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

async function parseMarkdown(content: string): Promise<string> {
  const result = await remark().use(remarkGfm).use(remarkHtml).process(content)
  return result.toString()
}

function readFile(section: string, slug: string) {
  const filePath = path.join(getContentDir(section), `${slug}.md`)
  const raw = fs.readFileSync(filePath, 'utf8')
  return matter(raw)
}

// ─── Events ──────────────────────────────────────────────────────────────────

export function getAllEventSlugs(): string[] {
  return getSlugs('events')
}

export function getAllEvents(): EventMeta[] {
  return getSlugs('events')
    .map((slug) => {
      const { data } = readFile('events', slug)
      return { slug, ...data } as EventMeta
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

export function getFeaturedEvents(limit = 3): EventMeta[] {
  const now = new Date()
  const all = getAllEvents()

  // 1. Upcoming dated featured events (not perennials)
  const upcoming = all
    .filter((e) => e.featured && !e.perennial && new Date(e.startDate + 'T00:00:00') >= now)
    .slice(0, limit)

  if (upcoming.length >= limit) return upcoming

  // 2. Sort perennials by next upcoming occurrence of their perennialSortDate
  const datedSlugs = upcoming.map((e) => e.slug)

  const sortedPerennials = all
    .filter((e) => e.perennial && !datedSlugs.includes(e.perennialFor ?? ''))
    .sort((a, b) => {
      return daysUntilNext(a.perennialSortDate ?? '01-01') - daysUntilNext(b.perennialSortDate ?? '01-01')
    })

  const fillSlots = limit - upcoming.length
  return [...upcoming, ...sortedPerennials.slice(0, fillSlots)]
}

function daysUntilNext(mmdd: string): number {
  const [month, day] = mmdd.split('-').map(Number)
  const now = new Date()
  const thisYear = new Date(now.getFullYear(), month - 1, day)
  if (thisYear >= now) return thisYear.getTime() - now.getTime()
  // Already passed this year — use next year
  const nextYear = new Date(now.getFullYear() + 1, month - 1, day)
  return nextYear.getTime() - now.getTime()
}

export async function getEvent(
  slug: string
): Promise<{ meta: EventMeta; contentHtml: string }> {
  const { data, content } = readFile('events', slug)
  const contentHtml = await parseMarkdown(content)
  return { meta: { slug, ...data } as EventMeta, contentHtml }
}

// ─── Parks ───────────────────────────────────────────────────────────────────

export function getAllParkSlugs(): string[] {
  return getSlugs('parks')
}

export function getAllParks(): ParkMeta[] {
  return getSlugs('parks').map((slug) => {
    const { data } = readFile('parks', slug)
    return { slug, ...data } as ParkMeta
  })
}

export async function getPark(
  slug: string
): Promise<{ meta: ParkMeta; contentHtml: string }> {
  const { data, content } = readFile('parks', slug)
  const contentHtml = await parseMarkdown(content)
  return { meta: { slug, ...data } as ParkMeta, contentHtml }
}

// ─── Businesses ──────────────────────────────────────────────────────────────

export function getAllBusinessSlugs(): string[] {
  return getSlugs('businesses')
}

export function getAllBusinesses(): BusinessMeta[] {
  return getSlugs('businesses').map((slug) => {
    const { data } = readFile('businesses', slug)
    return { slug, ...data } as BusinessMeta
  })
}

export async function getBusiness(
  slug: string
): Promise<{ meta: BusinessMeta; contentHtml: string }> {
  const { data, content } = readFile('businesses', slug)
  const contentHtml = await parseMarkdown(content)
  return { meta: { slug, ...data } as BusinessMeta, contentHtml }
}

export function getBusinessesByCategory(
  category: BusinessMeta['category']
): BusinessMeta[] {
  return getAllBusinesses().filter((b) => b.category === category)
}
