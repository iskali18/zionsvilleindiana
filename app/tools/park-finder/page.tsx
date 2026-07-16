import type { Metadata } from 'next'
import ParkFinder from './ParkFinder'

export const metadata: Metadata = {
  title: 'Zionsville Park Finder | ZionsvilleIndiana.com',
  description:
    'Find a Zionsville park by amenity — playground, restrooms, dog park, fishing, splash pad, and more.',
  alternates: {
    canonical: 'https://zionsvilleindiana.com/tools/park-finder',
  },
  openGraph: {
    title: 'Zionsville Park Finder',
    description:
      'Find a Zionsville park by amenity — playground, restrooms, dog park, fishing, splash pad, and more.',
    url: 'https://zionsvilleindiana.com/tools/park-finder',
    type: 'website',
  },
}

export default function ParkFinderPage() {
  return <ParkFinder />
}
