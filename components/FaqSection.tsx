interface FaqSectionProps {
  faqs?: Array<{ q: string; a: string }>
  /** Heading text. Defaults to "Common questions". */
  title?: string
}

/** Renders the FAQ list that matching FAQPage JSON-LD describes, so the
 *  structured data has visible text on the page to correspond to.
 *  Renders nothing when there are no FAQs. */
export default function FaqSection({ faqs, title = 'Common questions' }: FaqSectionProps) {
  if (!faqs || faqs.length === 0) return null

  return (
    <section className="mt-16 pt-10 border-t border-stone-200">
      <h2 className="font-display text-3xl text-stone-900 mb-8">{title}</h2>
      <dl className="space-y-4">
        {faqs.map(({ q, a }) => (
          <div
            key={q}
            className="bg-stone-50 rounded-lg p-5 border border-stone-200"
          >
            <dt className="font-display text-base font-semibold text-stone-900 mb-2">
              {q}
            </dt>
            <dd className="text-stone-600 text-sm leading-relaxed">
              {a}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
