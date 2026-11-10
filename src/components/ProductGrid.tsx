import type { Product } from '../data/products'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  onOpen: (product: Product) => void
}

export function ProductGrid({ products, onOpen }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h3>No hay resultados</h3>
        <p>Prueba otra marca, categoría o talla.</p>
      </div>
    )
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="product-grid-item"
          style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
        >
          <ProductCard product={product} onOpen={onOpen} />
        </div>
      ))}
    </div>
  )
}
