import {
  brands,
  categories,
  genders,
  allSizes,
  type Category,
  type Gender,
} from '../data/products'

export interface FilterState {
  search: string
  brand: string
  category: Category | ''
  gender: Gender | ''
  size: number | ''
}

interface FiltersProps {
  filters: FilterState
  onChange: (next: FilterState) => void
  resultCount: number
}

export function Filters({ filters, onChange, resultCount }: FiltersProps) {
  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value })
  }

  const clear = () => {
    onChange({
      search: '',
      brand: '',
      category: '',
      gender: '',
      size: '',
    })
  }

  const hasActive =
    filters.search ||
    filters.brand ||
    filters.category ||
    filters.gender ||
    filters.size

  return (
    <section className="filters" aria-label="Filtros del catálogo">
      <div className="filters-top">
        <div>
          <h2 className="section-title">Catálogo</h2>
          <p className="section-subtitle">
            {resultCount === 1
              ? '1 modelo disponible'
              : `${resultCount} modelos disponibles`}
          </p>
        </div>

        {hasActive ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
            Limpiar filtros
          </button>
        ) : null}
      </div>

      <div className="filters-grid">
        <label className="field field-search">
          <span>Buscar</span>
          <input
            type="search"
            placeholder="Marca, modelo o nombre…"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
          />
        </label>

        <label className="field">
          <span>Marca</span>
          <select
            value={filters.brand}
            onChange={(e) => update('brand', e.target.value)}
          >
            <option value="">Todas</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Categoría</span>
          <select
            value={filters.category}
            onChange={(e) =>
              update('category', e.target.value as Category | '')
            }
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Género</span>
          <select
            value={filters.gender}
            onChange={(e) => update('gender', e.target.value as Gender | '')}
          >
            <option value="">Todos</option>
            {genders.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Talla</span>
          <select
            value={filters.size}
            onChange={(e) =>
              update(
                'size',
                e.target.value ? Number(e.target.value) : '',
              )
            }
          >
            <option value="">Todas</option>
            {allSizes.map((size) => (
              <option key={size} value={size}>
                EU {size}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
