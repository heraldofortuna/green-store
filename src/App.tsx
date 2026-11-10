import { useMemo, useRef, useState } from 'react'
import { BrandStrip } from './components/BrandStrip'
import { Filters, type FilterState } from './components/Filters'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ProductGrid } from './components/ProductGrid'
import { ProductModal } from './components/ProductModal'
import { products, type Product } from './data/products'
import './App.css'

const initialFilters: FilterState = {
  search: '',
  brand: '',
  category: '',
  size: '',
  sort: 'featured',
}

function App() {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [selected, setSelected] = useState<Product | null>(null)
  const [inquiries, setInquiries] = useState<
    { productId: string; size: number }[]
  >([])
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
        product.category.toLowerCase().includes(query)

      const matchesBrand = !filters.brand || product.brand === filters.brand
      const matchesCategory =
        !filters.category || product.category === filters.category
      const matchesSize =
        !filters.size || product.sizes.includes(filters.size)

      return matchesSearch && matchesBrand && matchesCategory && matchesSize
    })

    list.sort((a, b) => {
      switch (filters.sort) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'name':
          return a.name.localeCompare(b.name, 'es')
        case 'featured':
        default:
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      }
    })

    return list
  }, [filters])

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const selectBrand = (brand: string) => {
    setFilters((current) => ({ ...current, brand }))
    scrollToCatalog()
  }

  const handleAdd = (product: Product, size: number) => {
    setInquiries((current) => [...current, { productId: product.id, size }])
    setToast(`${product.brand} ${product.name} · talla ${size} agregada`)
    window.setTimeout(() => setToast(null), 2600)
  }

  return (
    <div className="app-shell">
      <Header
        onCatalogClick={scrollToCatalog}
        cartCount={inquiries.length}
      />

      <main>
        <Hero onExplore={scrollToCatalog} />
        <BrandStrip onSelect={selectBrand} />

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
              src="/images/logo-green.png"
              alt="GREEN"
              className="contact-logo"
            />
            <h2>¿Buscas un modelo en particular?</h2>
            <p>
              Escríbenos por WhatsApp o Instagram y te confirmamos stock por
              marca, modelo y talla.
            </p>
            <div className="hero-cta">
              <a
                className="btn btn-primary"
                href="https://wa.me/"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              <a className="btn btn-ghost" href="mailto:hola@green.store">
                Email
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
        onAdd={handleAdd}
      />

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}

export default App
