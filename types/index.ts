// ─── Event ───────────────────────────────────────────────────────────────────

export type EventType = 'recurring' | 'annual' | 'oneoff'

export interface EventMeta {
  slug: string
  title: string
  description: string
  eventType: EventType
  /** ISO date string for one-off or next occurrence of recurring/annual */
  startDate: string
  endDate?: string
  /** e.g. "Every Saturday, May 16 – September 27" */
  recurrenceLabel?: string
  location: string
  address: string
  image: string
  imageAlt: string
  tags: string[]
  externalUrl?: string
  photoCredit?: string
  photoCreditHeroOnly?: boolean
  seo_title?: string
  area?: string
  faqs?: Array<{ q: string; a: string }>
  featured?: boolean
  perennial?: boolean
  perennialFor?: string
  perennialSortDate?: string
  perennialSeason?: string
  perennialLabel?: string
  /** Optional Google MyMaps embed URL (e.g., parking and nearby restaurants for an event) */
  mapEmbedUrl?: string
  /** Optional title for the embedded map (used for iframe accessibility) */
  mapTitle?: string
  metaTitle: string
  metaDescription: string
}

// ─── Park ────────────────────────────────────────────────────────────────────

export type ParkDifficulty = 'easy' | 'moderate' | 'challenging'
export type ParkType = 'park' | 'trail' | 'nature-preserve' | 'nature-center'

export interface ParkMeta {
  slug: string
  name: string
  parkType: ParkType
  description: string
  address: string
  lat: number
  lng: number
  difficulty?: ParkDifficulty
  /** e.g. "2.1 miles" */
  trailLength?: string
  /** e.g. "Paved" | "Natural surface" */
  surface?: string
  amenities: string[]
  /** Slug(s) of nearby businesses for internal linking */
  nearbyBusinesses?: string[]
  /** Slug(s) of nearby parks */
  nearbyParks?: string[]
  externalUrl?: string
  image: string
  imageAlt: string
  comingSoon?: boolean
  metaTitle: string
  metaDescription: string
}

// ─── Business ────────────────────────────────────────────────────────────────

export type BusinessCategory =
  | 'dining'
  | 'coffee'
  | 'shopping'
  | 'boutique'
  | 'services'
  | 'entertainment'
  | 'lodging'

export interface BusinessMeta {
  slug: string
  name: string
  category: BusinessCategory
  description: string
  shortDescription?: string
  address: string
  phone?: string
  website?: string
  /** ISO date string — last time listing was manually verified */
  lastVerified: string
  image?: string
  imageAlt?: string
  /** Slug(s) of nearby parks for internal linking */
  nearbyParks?: string[]
  metaTitle: string
  metaDescription: string
  area?: string
  seo_title?: string
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string
  href: string
}
