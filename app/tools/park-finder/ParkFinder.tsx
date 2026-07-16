'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  AMENITIES,
  type AmenityId,
  type Park,
  PARKS,
  getGoogleMapsUrl,
  getParkLinkLabel,
  getParkLinkUrl,
  isExternalParkLink,
} from '@/lib/parks'

// Filter pill groupings — display order matches this
const AMENITY_CATEGORIES: Array<{
  name: string
  amenities: AmenityId[]
}> = [
  {
    name: 'Park basics',
    amenities: [
      'restrooms',
      'water',
      'ada-accessible',
      'picnic-tables',
      'picnic-shelters',
    ],
  },
  {
    name: 'Play & pets',
    amenities: [
      'playground',
      'splash-pad',
      'dogs-on-leash',
      'off-leash-dog-park',
    ],
  },
  {
    name: 'Activities',
    amenities: [
      'bikes-allowed',
      'creek-access',
      'fishing',
      'sports-facilities',
      'golf',
      'disc-golf',
      'skate-park',
    ],
  },
]

// Canonical amenity display order — matches sign categories
const AMENITY_ORDER: AmenityId[] = AMENITY_CATEGORIES.flatMap((c) => c.amenities)

// Hover-tooltip content for amenities that need explanation
const AMENITY_TOOLTIPS: Partial<Record<AmenityId, string>> = {
  'sports-facilities':
    'Sports facilities include athletic fields, basketball courts, pickleball courts, tennis courts, or similar park amenities.',
}

export default function ParkFinder() {
  const [selected, setSelected] = useState<Set<AmenityId>>(new Set())

  const toggleAmenity = (id: AmenityId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const clearFilters = () => setSelected(new Set())

  // Filter: parks must have ALL selected amenities. Alphabetical sort.
  const matchingParks = useMemo(() => {
    const list =
      selected.size === 0
        ? [...PARKS]
        : PARKS.filter((p) =>
            Array.from(selected).every((a) => p.amenities.includes(a))
          )
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [selected])

  const countLine = () => {
    if (matchingParks.length === 0) return 'No parks match your filters.'
    if (selected.size === 0)
      return `Showing all ${matchingParks.length} Zionsville parks.`
    return `${matchingParks.length} ${matchingParks.length === 1 ? 'park matches' : 'parks match'} your filters.`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl sm:text-4xl text-stone-900 font-bold mb-4">
        Zionsville Park Finder
      </h1>

      <p className="text-stone-700 mb-8">
        Find a Zionsville park with the amenities you need. Select one or more
        amenities below and we'll show parks that have all of them.
      </p>

      {/* Filter card */}
      <section className="mb-10 p-6 bg-stone-50 border border-stone-200 rounded-lg">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-stone-900 leading-tight">
            Filter by amenity
          </h2>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-stone-600 hover:text-stone-900 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="space-y-4">
          {AMENITY_CATEGORIES.map((category) => (
            <div key={category.name}>
              <h3 className="text-xs uppercase tracking-widest font-medium text-brick-600 mb-2 leading-tight">
                {category.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.amenities.map((amenityId) => {
                  const isSelected = selected.has(amenityId)
                  const tooltip = AMENITY_TOOLTIPS[amenityId]
                  return (
                    <button
                      key={amenityId}
                      type="button"
                      onClick={() => toggleAmenity(amenityId)}
                      aria-pressed={isSelected}
                      title={tooltip}
                      className={
                        isSelected
                          ? 'px-3 py-1.5 text-sm rounded-full border border-village-600 bg-village-600 text-white font-medium transition-colors'
                          : 'px-3 py-1.5 text-sm rounded-full border border-stone-300 bg-white text-stone-700 font-medium hover:border-stone-400 hover:text-stone-900 transition-colors'
                      }
                    >
                      {AMENITIES[amenityId]}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Results count */}
      <p className="text-stone-700 mb-4">{countLine()}</p>

      {matchingParks.length === 0 && (
        <p className="text-stone-600 mb-6">
          Try removing one or more filters, or{' '}
          <button
            type="button"
            onClick={clearFilters}
            className="text-brick-600 hover:text-brick-700 hover:underline"
          >
            clear all
          </button>{' '}
          to see every park.
        </p>
      )}

      {/* Parks list — styled to match articles via prose-village */}
      <div className="prose-village">
        {matchingParks.map((park) => (
          <ParkItem key={park.id} park={park} />
        ))}
      </div>
    </div>
  )
}

// ─── Park item ─────────────────────────────────────────────────────────────

interface ParkItemProps {
  park: Park
}

function ParkItem({ park }: ParkItemProps) {
  const primaryLinkUrl = getParkLinkUrl(park)
  const primaryLinkLabel = getParkLinkLabel(park)
  const isExternal = isExternalParkLink(park)
  const googleMapsUrl = getGoogleMapsUrl(park)

  // Order amenities by canonical order (Park basics → Play & pets → Activities)
  const orderedAmenities = AMENITY_ORDER.filter((a) => park.amenities.includes(a))
  const amenitiesText = orderedAmenities.map((a) => AMENITIES[a]).join(' · ')

  return (
    <>
      <h3>{park.name}</h3>
      <ul>
        {park.address && (
          <li>
            <strong>Address:</strong>{' '}
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              {park.address}
            </a>
          </li>
        )}
        <li>
          <strong>{primaryLinkLabel}:</strong>{' '}
          {isExternal ? (
            <a href={primaryLinkUrl} target="_blank" rel="noopener noreferrer">
              {park.name}
            </a>
          ) : (
            <Link href={primaryLinkUrl}>{park.name}</Link>
          )}
        </li>
        {park.dogParkUrl && (
          <li>
            <strong>Dog park page:</strong>{' '}
            <a href={park.dogParkUrl} target="_blank" rel="noopener noreferrer">
              {park.name} Dog Park
            </a>
          </li>
        )}
        {park.description && <li>{park.description}</li>}
        <li>
          <strong>Amenities:</strong> {amenitiesText}
        </li>
      </ul>
    </>
  )
}
