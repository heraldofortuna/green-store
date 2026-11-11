const MESSAGES = [
  '🎄 Promociones de Navidad · Descuentos especiales en todo el catálogo',
  '✨ Llegaron los nuevos modelos de RS21 · Descúbrelos en el catálogo',
]

export function PromoBanner() {
  const loop = [...MESSAGES, ...MESSAGES, ...MESSAGES, ...MESSAGES]

  return (
    <div className="promo-banner" role="region" aria-label="Anuncios">
      <div className="promo-banner-track" aria-hidden="true">
        {loop.map((message, index) => (
          <span key={`${index}-${message}`} className="promo-banner-item">
            {message}
          </span>
        ))}
      </div>
      <span className="visually-hidden">{MESSAGES.join('. ')}</span>
    </div>
  )
}
