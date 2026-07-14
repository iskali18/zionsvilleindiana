'use client'

import Link from 'next/link'
import { useState } from 'react'

type NavItem = {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

const nav: NavItem[] = [
  { label: 'Events', href: '/events' },
  {
    label: 'Downtown',
    href: '/downtown',
    children: [
      { label: 'Itineraries', href: '/downtown' },
      { label: 'Restaurants', href: '/articles/downtown-zionsville-restaurants' },
      { label: 'Shopping', href: '/articles/shopping-in-downtown-zionsville' },
      { label: 'Downtown Map', href: '/articles/downtown-zionsville-map' },
      { label: 'DORA (Outdoor Drinks)', href: '/articles/dora' },
    ],
  },
  { label: 'Things to Do', href: '/things-to-do' },
  { label: 'Guides', href: '/articles' },
  { label: 'About Zionsville', href: '/about' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50 print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="font-display text-xl text-stone-900 hover:text-brick-600 transition-colors">
          Zionsville <span className="text-stone-400 font-normal">Indiana</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {nav.map((item) =>
            item.children ? (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="text-sm font-medium text-stone-600 hover:text-brick-600 transition-colors inline-flex items-center gap-1"
                >
                  {item.label}
                  <span className="text-base" aria-hidden="true">▾</span>
                </Link>
                {openDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 min-w-[14rem]">
                    <div className="bg-white border border-stone-200 rounded-lg shadow-md py-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-stone-600 hover:text-brick-600 hover:bg-stone-50 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-stone-600 hover:text-brick-600 transition-colors"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-stone-600"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-3 flex flex-col gap-3">
          {nav.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className="text-sm font-medium text-stone-700 hover:text-brick-600 block"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="ml-4 mt-2 flex flex-col gap-2 border-l border-stone-200 pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="text-sm text-stone-600 hover:text-brick-600 block"
                      onClick={() => setOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  )
}
