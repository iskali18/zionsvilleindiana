'use client'

import { useEffect, useRef, useState } from 'react'

interface ShareButtonProps {
  /** Full page URL to share. Passed in from the server (the canonical URL), so
   *  shared links never carry tracking tags or other query strings. */
  url: string
  /** Page title, shown in the phone's share menu. */
  title: string
  /** 'light' is white text for dark backgrounds such as the event hero. */
  tone?: 'default' | 'light'
  className?: string
}

/** How long "Link copied" stays up before the label returns to "Share". */
const COPIED_MS = 2000

/** Text colors for each tone. */
const TONES = {
  default: 'text-brick-600 hover:text-brick-700',
  light: 'text-white hover:text-brick-300',
}

/** One button that fits the device.
 *  - Phones and tablets: opens the device's own share menu (Messages,
 *    Facebook, email and so on).
 *  - Computers: copies the link and shows "Link copied".
 *  Touch is checked on click, not on render, so the server and browser render
 *  the same button. */
export default function ShareButton({
  url,
  title,
  tone = 'default',
  className = '',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear the pending reset if the page is left while "Link copied" shows.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  function showCopied() {
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), COPIED_MS)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      showCopied()
      return
    } catch {
      // Clipboard API missing or blocked. Fall through to the older method.
    }
    const field = document.createElement('textarea')
    field.value = url
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    try {
      if (document.execCommand('copy')) showCopied()
    } finally {
      document.body.removeChild(field)
    }
  }

  async function handleClick() {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url })
        return
      } catch (err) {
        // Closing the share menu is not an error. Anything else falls back to copying.
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    await copyLink()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${TONES[tone]} ${className}`}
    >
      {copied ? (
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        // Share icon: three nodes joined by two lines.
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
          <circle cx="15" cy="4.5" r="2.25" />
          <circle cx="5" cy="10" r="2.25" />
          <circle cx="15" cy="15.5" r="2.25" />
          <path d="M7 8.9l6-3.3M7 11.1l6 3.3" strokeLinecap="round" />
        </svg>
      )}
      {/* Screen readers hear the change, because the label sits in a live region. */}
      <span aria-live="polite">{copied ? 'Link copied' : 'Share'}</span>
    </button>
  )
}
