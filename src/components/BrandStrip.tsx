import { brands } from '../data/products'

interface BrandStripProps {
  onSelect: (brand: string) => void
}

export function BrandStrip({ onSelect }: BrandStripProps) {
  return (
    <section className="brand-strip" id="marcas" aria-label="Marcas">
      <div className="brand-strip-inner">
        <div>
          <h2 className="section-title">Marcas</h2>
          <p className="section-subtitle">
            Filtra el catálogo por la casa que buscas.
          </p>
        </div>

        <div className="brand-row">
          {brands.map((brand) => (
            <button
              key={brand}
              type="button"
              className="brand-pill"
              onClick={() => onSelect(brand)}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
