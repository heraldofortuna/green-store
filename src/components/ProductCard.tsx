import { BrandMark } from './BrandMark'
import { formatPrice, type Product } from '../data/products'
import { asset } from '../lib/assets'

interface ProductCardProps {
  product: Product
  onOpen: (product: Product) => void
}

function productImage(src: string) {
  if (!src) return ''
  if (/^https?:\/\//i.test(src)) return src
  return asset(src)
}

export function ProductCard({ product, onOpen }: ProductCardProps) {
  const hasImage = Boolean(product.image)
  const sizeCount = product.sizes.length

  return (
    <article className="product-card">
      <button
        type="button"
        className="product-card-hit"
        onClick={() => onOpen(product)}
        aria-label={`Ver ${product.brand} ${product.name}`}
      >
        <div
          className={
            hasImage ? 'product-media' : 'product-media is-placeholder'
          }
        >
          <BrandMark brand={product.brand} className="product-media-brand" />
          <img
            className="product-media-shot"
            src={
              hasImage
                ? productImage(product.image)
                : asset('images/logo-green.png')
            }
            alt=""
            loading="lazy"
            decoding="async"
          />
          {product.featured ? (
            <span className="product-badge">Destacado</span>
          ) : null}
        </div>

        <div className="product-body">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-meta">
            {product.category} · {product.gender}
          </p>
          <div className="product-footer">
            <div className="product-prices">
              <div className="product-price-row">
                <span className="product-retail">
                  {formatPrice(product.retailPrice)}
                </span>
                <span className="product-price">
                  {formatPrice(product.price)}
                </span>
              </div>
              <span className="product-wholesale">
                Precio mayorista {formatPrice(product.wholesalePrice)}
              </span>
            </div>
            <span className="product-sizes">
              {sizeCount === 1 ? '1 talla' : `${sizeCount} tallas`}
            </span>
          </div>
        </div>
      </button>
    </article>
  )
}
