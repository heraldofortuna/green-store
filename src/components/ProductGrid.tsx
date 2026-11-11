import { useEffect, useMemo, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import type { Product } from '../data/products'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  onOpen: (product: Product) => void
}

function useColumnCount() {
  const [columns, setColumns] = useState(4)

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth
      if (width <= 480) setColumns(1)
      else if (width <= 720) setColumns(2)
      else if (width <= 1100) setColumns(3)
      else setColumns(4)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return columns
}

const ROW_ESTIMATE = 390

export function ProductGrid({ products, onOpen }: ProductGridProps) {
  const columns = useColumnCount()
  const rowCount = Math.ceil(products.length / columns) || 0

  const catalogOffset = useMemo(() => {
    if (typeof document === 'undefined') return 0
    const el = document.getElementById('catalogo')
    return el?.offsetTop ?? 0
  }, [products.length, columns])

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => ROW_ESTIMATE,
    overscan: 4,
    scrollMargin: catalogOffset,
  })

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h3>No hay resultados</h3>
        <p>Prueba otra marca, categoría o talla.</p>
      </div>
    )
  }

  const virtualRows = virtualizer.getVirtualItems()

  return (
    <div
      className="product-grid-virtual"
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {virtualRows.map((virtualRow) => {
        const start = virtualRow.index * columns
        const rowProducts = products.slice(start, start + columns)

        return (
          <div
            key={virtualRow.key}
            className="product-grid-row"
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${
                virtualRow.start - virtualizer.options.scrollMargin
              }px)`,
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap: '1rem',
            }}
          >
            {rowProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={onOpen}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
