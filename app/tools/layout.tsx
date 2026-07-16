import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="print:hidden">
        <Header />
      </div>
      <main>{children}</main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  )
}
