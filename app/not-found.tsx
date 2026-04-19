import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-brick-400 text-sm font-medium uppercase tracking-widest mb-4">404</p>
        <h1 className="font-display text-4xl text-stone-900 mb-4">Page not found</h1>
        <p className="text-stone-500 mb-10 max-w-md mx-auto">
          This page doesn't exist or may have moved. Try one of these instead.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="bg-brick-500 hover:bg-brick-600 text-white px-5 py-2.5 rounded font-medium transition-colors text-sm">
            Home
          </Link>
          <Link href="/events" className="border border-stone-300 hover:border-brick-400 text-stone-700 px-5 py-2.5 rounded font-medium transition-colors text-sm">
            Events
          </Link>
          <Link href="/parks" className="border border-stone-300 hover:border-brick-400 text-stone-700 px-5 py-2.5 rounded font-medium transition-colors text-sm">
            Parks
          </Link>
          <Link href="/downtown" className="border border-stone-300 hover:border-brick-400 text-stone-700 px-5 py-2.5 rounded font-medium transition-colors text-sm">
            Downtown
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
