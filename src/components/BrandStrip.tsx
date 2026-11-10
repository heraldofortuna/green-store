import { brandCatalog } from '../data/brands'
import { BrandMark } from './BrandMark'

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
          {brandCatalog.map((brand) => (
            <button
              key={brand.name}
              type="button"
              className={brand.logo ? 'brand-pill brand-pill-logo' : 'brand-pill'}
              onClick={() => onSelect(brand.name)}
              aria-label={`Filtrar por ${brand.name}`}
            >
              <BrandMark brand={brand.name} />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
