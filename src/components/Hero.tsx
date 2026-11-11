import { asset } from '../lib/assets'

interface HeroProps {
  onExplore: () => void
}

export function Hero({ onExplore }: HeroProps) {
  return (
    <section className="hero" id="top" aria-label="Presentación GREEN">
      <div className="hero-media" aria-hidden="true">
        <img
          src={asset('images/hero-atmosphere.png')}
          alt=""
          className="hero-atmosphere"
        />
        <div className="hero-veil" />
      </div>

      <div className="hero-content">
        <img
          src={asset('images/logo-green.png')}
          alt="GREEN"
          className="hero-logo"
        />
        <h1 className="hero-title">Zapatillas con presencia</h1>
        <p className="hero-copy">
          Catálogo digital de marcas, modelos y tallas listos para la calle.
        </p>
        <div className="hero-cta">
          <button type="button" className="btn btn-primary" onClick={onExplore}>
            Ver catálogo
          </button>
        </div>
      </div>
    </section>
  )
}
