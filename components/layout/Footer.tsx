import Link from 'next/link'

const columns = [
  {
    heading: 'Explore',
    links: [
      { label: 'Events', href: '/events' },
      { label: 'Downtown', href: '/downtown' },
      { label: 'Businesses', href: '/businesses' },
    ],
  },
  {
    heading: 'Downtown',
    links: [
      { label: 'Dining', href: '/downtown/dining' },
      { label: 'Shopping', href: '/downtown/shopping' },
      { label: 'Parking', href: '/downtown#parking' },
    ],
  },
  {
    heading: 'Info',
    links: [
      { label: 'About Zionsville', href: '/about' },
      { label: 'Disclaimer', href: '/disclaimer' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-white text-lg mb-2">ZionsvilleIndiana.com</p>
          <p className="text-sm text-stone-400 leading-relaxed">
            Your guide to events, dining, and community life in Zionsville, Indiana.
          </p>
          <p className="text-xs text-stone-400 mt-3">Zionsville, IN 46077 · Boone County</p>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-3">{col.heading}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-800 text-center text-xs text-stone-600 py-5">
        © {new Date().getFullYear()} ZionsvilleIndiana.com
      </div>
    </footer>
  )
}
