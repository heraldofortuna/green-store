import { brandCatalog } from '../data/brands'
import { asset } from '../lib/assets'

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
              className="brand-pill"
              onClick={() => onSelect(brand.name)}
              aria-label={`Filtrar por ${brand.name}`}
            >
              <img
                src={asset(brand.logo)}
                alt=""
                className="brand-logo-img"
              />
              <span className="brand-name">{brand.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
