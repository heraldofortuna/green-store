import { brandCatalog } from '../data/brands'
import { BrandMark } from './BrandMark'

export function BrandStrip() {
  const track = [...brandCatalog, ...brandCatalog]

  return (
    <div className="brand-marquee" id="marcas" role="region" aria-label="Marcas">
      <div className="brand-marquee-track" aria-hidden="true">
        {track.map((brand, index) => (
          <div key={`${brand.name}-${index}`} className="brand-marquee-item">
            <BrandMark brand={brand.name} className="brand-marquee-mark" />
          </div>
        ))}
      </div>
    </div>
  )
}
