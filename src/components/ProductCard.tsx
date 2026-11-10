import { formatPrice, type Product } from '../data/products'

interface ProductCardProps {
  product: Product
  onOpen: (product: Product) => void
}

export function ProductCard({ product, onOpen }: ProductCardProps) {
  return (
    <article className="product-card">
      <button
        type="button"
        className="product-card-hit"
        onClick={() => onOpen(product)}
        aria-label={`Ver ${product.brand} ${product.name}`}
      >
        <div className="product-media">
          <img src={product.image} alt="" loading="lazy" />
          {product.featured ? (
            <span className="product-badge">Destacado</span>
          ) : null}
        </div>

        <div className="product-body">
          <p className="product-brand">{product.brand}</p>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-meta">
            {product.category} · {product.gender} · {product.model}
          </p>
          <div className="product-footer">
            <span className="product-price">{formatPrice(product.price)}</span>
            <span className="product-sizes">
              {product.sizes.length} tallas
            </span>
          </div>
        </div>
      </button>
    </article>
  )
}
