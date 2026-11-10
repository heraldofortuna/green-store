import { useEffect, useState } from 'react'
import { formatPrice, type Product } from '../data/products'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
  onAdd: (product: Product, size: number) => void
}

export function ProductModal({ product, onClose, onAdd }: ProductModalProps) {
  const [size, setSize] = useState<number | null>(null)

  useEffect(() => {
    setSize(null)
  }, [product?.id])

  useEffect(() => {
    if (!product) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [product, onClose])

  if (!product) return null

  return (
    <div className="modal-root" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="modal-media">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="modal-body">
          <p className="product-brand">{product.brand}</p>
          <h2 id="product-modal-title" className="modal-title">
            {product.name}
          </h2>
          <p className="modal-meta">
            {product.category} · Modelo {product.model}
          </p>
          <p className="modal-price">{formatPrice(product.price)}</p>
          <p className="modal-copy">{product.description}</p>

          <div className="modal-block">
            <p className="modal-label">Colores</p>
            <div className="chip-row">
              {product.colors.map((color) => (
                <span key={color} className="chip">
                  {color}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-block">
            <p className="modal-label">Elige tu talla (EU)</p>
            <div className="size-grid">
              {product.sizes.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={
                    size === value ? 'size-btn is-active' : 'size-btn'
                  }
                  onClick={() => setSize(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={size === null}
            onClick={() => {
              if (size === null) return
              onAdd(product, size)
              onClose()
            }}
          >
            {size === null
              ? 'Selecciona una talla'
              : `Consultar talla ${size}`}
          </button>
        </div>
      </div>
    </div>
  )
}
