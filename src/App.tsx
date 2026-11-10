import { useMemo, useRef, useState } from 'react'
import { BrandStrip } from './components/BrandStrip'
import { Filters, type FilterState } from './components/Filters'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ProductGrid } from './components/ProductGrid'
import { ProductModal } from './components/ProductModal'
import { products, type Product } from './data/products'
import { asset } from './lib/assets'
import { genericInquiryMessage, whatsappUrl } from './lib/whatsapp'
import './App.css'

const initialFilters: FilterState = {
  search: '',
  brand: '',
  category: '',
  gender: '',
  size: '',
}

function App() {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [selected, setSelected] = useState<Product | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const catalogRef = useRef<HTMLElement>(null)

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase()

    const list = products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.model.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.gender.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query)

      const matchesBrand = !filters.brand || product.brand === filters.brand
      const matchesCategory =
        !filters.category || product.category === filters.category
      const matchesGender =
        !filters.gender || product.gender === filters.gender
      const matchesSize =
        !filters.size || product.sizes.includes(filters.size)

      return (
        matchesSearch &&
        matchesBrand &&
        matchesCategory &&
        matchesGender &&
        matchesSize
      )
    })

    list.sort((a, b) => a.price - b.price)

    return list
  }, [filters])

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleInquire = (product: Product, size: number) => {
    setToast(`Abriendo WhatsApp · ${product.name} talla ${size}`)
    window.setTimeout(() => setToast(null), 2600)
  }

  return (
    <div className="app-shell">
      <Header onCatalogClick={scrollToCatalog} />

      <main>
        <Hero onExplore={scrollToCatalog} />
        <BrandStrip />

        <section className="catalog" id="catalogo" ref={catalogRef}>
          <div className="catalog-inner">
            <Filters
              filters={filters}
              onChange={setFilters}
              resultCount={filtered.length}
            />
            <ProductGrid products={filtered} onOpen={setSelected} />
          </div>
        </section>

        <section className="contact" id="contacto">
          <div className="contact-inner">
            <img
              src={asset('images/logo-green.png')}
              alt="GREEN"
              className="contact-logo"
            />
            <h2>¿Buscas un modelo en particular?</h2>
            <p>
              Escríbenos por WhatsApp y te confirmamos stock por marca, modelo
              y talla.
            </p>
            <div className="hero-cta">
              <a
                className="btn btn-primary"
                href={whatsappUrl(genericInquiryMessage)}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} GREEN · Catálogo digital de zapatillas</p>
      </footer>

      <ProductModal
        product={selected}
        onClose={() => setSelected(null)}
        onInquire={handleInquire}
      />

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}

export default App
