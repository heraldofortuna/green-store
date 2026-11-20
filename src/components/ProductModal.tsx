import { useEffect, useMemo, useState } from 'react'
import { formatPrice, type Product } from '../data/products'
import { asset } from '../lib/assets'
import {
  sizeInquiryMessage,
  whatsappUrl,
  type PriceType,
} from '../lib/whatsapp'
import { BrandMark } from './BrandMark'

function productImage(src: string) {
  if (!src) return ''
  if (/^https?:\/\//i.test(src)) return src
  return asset(src)
}

interface ProductModalProps {
  product: Product | null
  onClose: () => void
  onInquire: (product: Product, size: number) => void
}

export function ProductModal({
  product,
  onClose,
  onInquire,
}: ProductModalProps) {
  const [size, setSize] = useState<number | null>(null)
  const [priceType, setPriceType] = useState<PriceType>('emprendedor')
  const [shotIndex, setShotIndex] = useState(0)

  const shots = useMemo(() => {
    if (!product) return [] as string[]
    const primary = product.image ? [product.image] : []
    const extras = (product.gallery || []).filter((src) => src !== product.image)
    return [...primary, ...extras]
  }, [product])

  useEffect(() => {
    if (!product) {
      setSize(null)
      setPriceType('emprendedor')
      setShotIndex(0)
      return
    }

    setSize(product.sizes.length === 1 ? product.sizes[0] : null)
    setPriceType('emprendedor')
    setShotIndex(0)
  }, [product])

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

  const selectedAmount =
    priceType === 'mayorista' ? product.wholesalePrice : product.price

  const consultUrl =
    size === null
      ? undefined
      : whatsappUrl(
          sizeInquiryMessage(
            product.code || product.id,
            product.brand,
            product.name,
            product.model,
            size,
            priceType,
            selectedAmount,
          ),
        )

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

        <div
          className={
            product.image ? 'modal-media' : 'modal-media is-placeholder'
          }
        >
          <BrandMark brand={product.brand} className="modal-media-brand" />
          <div className="modal-media-shot-wrap">
            <img
              className="modal-media-shot"
              src={
                shots[shotIndex]
                  ? productImage(shots[shotIndex])
                  : product.image
                    ? productImage(product.image)
                    : asset('images/logo-green.png')
              }
              alt={product.name}
            />
          </div>
          {shots.length > 1 ? (
            <div className="modal-gallery" role="tablist" aria-label="Fotos del producto">
              {shots.map((src, index) => (
                <button
                  key={src + index}
                  type="button"
                  role="tab"
                  aria-selected={shotIndex === index}
                  aria-label={`Ver imagen ${index + 1}`}
                  className={
                    shotIndex === index
                      ? 'modal-gallery-thumb is-active'
                      : 'modal-gallery-thumb'
                  }
                  onClick={() => setShotIndex(index)}
                >
                  <img src={productImage(src)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="modal-body">
          <h2 id="product-modal-title" className="modal-title">
            {product.name}
          </h2>
          <p className="modal-meta">
            {product.category} · {product.gender} ·{' '}
            {product.code || product.id}
          </p>

          <div className="modal-block">
            <p className="modal-label" id="price-type-label">
              Elige el precio
            </p>
            <div
              className="price-type-grid"
              role="radiogroup"
              aria-labelledby="price-type-label"
            >
              <button
                type="button"
                role="radio"
                aria-checked={priceType === 'emprendedor'}
                className={
                  priceType === 'emprendedor'
                    ? 'price-type-option is-active'
                    : 'price-type-option'
                }
                onClick={() => setPriceType('emprendedor')}
              >
                <span className="price-type-name">Emprendedor</span>
                <span className="price-type-amount">
                  {formatPrice(product.price)}
                </span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={priceType === 'mayorista'}
                className={
                  priceType === 'mayorista'
                    ? 'price-type-option is-active'
                    : 'price-type-option'
                }
                onClick={() => setPriceType('mayorista')}
              >
                <span className="price-type-name">Precio mayorista</span>
                <span className="price-type-amount">
                  {formatPrice(product.wholesalePrice)}
                </span>
              </button>
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

          <div className="modal-cta">
            {size === null ? (
              <button
                type="button"
                className="btn btn-primary btn-block"
                disabled
              >
                Selecciona una talla
              </button>
            ) : (
              <a
                className="btn btn-primary btn-block"
                href={consultUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  onInquire(product, size)
                  onClose()
                }}
              >
                Consultar talla {size}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
