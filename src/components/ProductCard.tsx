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
        <div className={hasImage ? 'product-media' : 'product-media is-placeholder'}>
          <img
            src={hasImage ? productImage(product.image) : asset('images/logo-green.png')}
            alt=""
            loading="lazy"
            decoding="async"
          />
          {product.featured ? (
            <span className="product-badge">Destacado</span>
          ) : null}
        </div>

        <div className="product-body">
          <p className="product-brand">{product.brand}</p>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-meta">
            {product.category} · {product.gender}
          </p>
          <div className="product-footer">
            <span className="product-price">{formatPrice(product.price)}</span>
            <span className="product-sizes">
              {sizeCount === 1 ? '1 talla' : `${sizeCount} tallas`}
            </span>
          </div>
        </div>
      </button>
    </article>
  )
}
