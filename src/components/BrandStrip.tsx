import { brandCatalog } from '../data/brands'
import { BrandMark } from './BrandMark'

export function BrandStrip() {
  const track = [...brandCatalog, ...brandCatalog]

  return (
    <section className="brand-showcase" id="marcas" aria-label="Marcas">
      <div className="brand-showcase-heading">
        <h2 className="brand-showcase-title">
          Trabajamos con las siguientes marcas
        </h2>
      </div>

      <div className="brand-marquee" aria-hidden="true">
        <div className="brand-marquee-track">
          {track.map((brand, index) => (
            <div key={`${brand.name}-${index}`} className="brand-marquee-item">
              <BrandMark brand={brand.name} className="brand-marquee-mark" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
