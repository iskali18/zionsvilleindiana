'use client'

/** Accent colours for the selected state.
 *
 *  Class strings are written out in full rather than built from the prop.
 *  Tailwind scans source files for complete class names, so an interpolated
 *  string like `bg-${accent}-600` would never be seen and the style would be
 *  missing from the compiled CSS. Add a new accent by adding a line here. */
const ACCENTS = {
  village: {
    button: 'border-village-600 bg-village-600',
    check: 'text-village-600',
  },
  amber: {
    button: 'border-amber-700 bg-amber-700',
    check: 'text-amber-700',
  },
} as const

export type ToggleAccent = keyof typeof ACCENTS

interface ToggleProps {
  label: string
  active: boolean
  onClick: () => void
  /** Selected-state colour. Defaults to `village`. */
  accent?: ToggleAccent
}

/** Pill-shaped filter chip with a check circle. Used by the ZCS calendar,
 *  the fall farm comparison and any other filterable list on the site. */
export default function Toggle({ label, active, onClick, accent = 'village' }: ToggleProps) {
  const colour = ACCENTS[accent]

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onClick}
      className={
        active
          ? `inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border ${colour.button} text-white font-medium transition-colors`
          : 'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-stone-300 bg-white text-stone-600 font-medium hover:border-stone-400 hover:text-stone-900 transition-colors'
      }
    >
      <span
        className={
          active
            ? `inline-flex items-center justify-center w-4 h-4 rounded-full bg-white ${colour.check} text-[10px] font-bold`
            : 'inline-flex items-center justify-center w-4 h-4 rounded-full border border-stone-300 text-transparent text-[10px]'
        }
        aria-hidden="true"
      >
        ✓
      </span>
      {label}
    </button>
  )
}
