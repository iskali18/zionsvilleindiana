import Link from 'next/link'
import type { BreadcrumbItem } from '@/types'

interface Props {
  items: BreadcrumbItem[]
  light?: boolean
}

export default function Breadcrumb({ items, light = false }: Props) {
  const full = [{ label: 'Home', href: '/' }, ...items]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: full.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: `https://zionsvilleindiana.com${item.href}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className={`text-sm ${light ? 'text-white/70' : 'text-stone-500'}`}>
        <ol className="flex items-center gap-1.5 flex-wrap">
          {full.map((item, i) => (
            <li key={item.href} className="flex items-center gap-1.5">
              {i < full.length - 1 ? (
                <>
                  <Link href={item.href} className={`transition-colors ${light ? 'hover:text-white' : 'hover:text-brick-600'}`}>
                    {item.label}
                  </Link>
                  <span aria-hidden="true">›</span>
                </>
              ) : (
                <span className={`font-medium ${light ? 'text-white' : 'text-stone-700'}`}>{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
