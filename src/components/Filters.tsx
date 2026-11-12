import { useEffect, useId, useRef, useState } from 'react'
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

type AdvancedFilters = Pick<
  FilterState,
  'brand' | 'category' | 'gender' | 'size'
>

interface FiltersProps {
  filters: FilterState
  onChange: (next: FilterState) => void
  resultCount: number
}

function advancedFrom(filters: FilterState): AdvancedFilters {
  return {
    brand: filters.brand,
    category: filters.category,
    gender: filters.gender,
    size: filters.size,
  }
}

function advancedCountOf(values: AdvancedFilters) {
  return [values.brand, values.category, values.gender, values.size].filter(
    Boolean,
  ).length
}

export function Filters({ filters, onChange, resultCount }: FiltersProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<AdvancedFilters>(() => advancedFrom(filters))
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  const appliedAdvanced = advancedCountOf(advancedFrom(filters))
  const draftAdvanced = advancedCountOf(draft)
  const hasAny = Boolean(filters.search) || appliedAdvanced > 0

  const openPanel = () => {
    setDraft(advancedFrom(filters))
    setOpen(true)
  }

  const closeWithoutApply = () => {
    setDraft(advancedFrom(filters))
    setOpen(false)
  }

  const applyAndClose = () => {
    onChange({
      ...filters,
      ...draft,
    })
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector<HTMLElement>('select, button')?.focus()

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

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

        {hasAny ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() =>
              onChange({
                search: '',
                brand: '',
                category: '',
                gender: '',
                size: '',
              })
            }
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>

      <div className="filters-bar">
        <label className="field field-search">
          <span>Buscar</span>
          <input
            type="search"
            placeholder="Marca, modelo o nombre…"
            value={filters.search}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value })
            }
          />
        </label>

        <button
          type="button"
          className={
            appliedAdvanced > 0
              ? 'filters-trigger is-active'
              : 'filters-trigger'
          }
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? titleId : undefined}
          onClick={openPanel}
        >
          <svg
            className="filters-trigger-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M4 6.75A.75.75 0 0 1 4.75 6h14.5a.75.75 0 0 1 .53 1.28l-5.28 5.28v5.19a.75.75 0 0 1-1.13.65l-3-1.7A.75.75 0 0 1 10 16v-3.44L4.22 7.28A.75.75 0 0 1 4 6.75Z"
            />
          </svg>
          <span className="filters-trigger-label">Filtros</span>
          {appliedAdvanced > 0 ? (
            <span className="filters-trigger-badge" aria-hidden="true">
              {appliedAdvanced}
            </span>
          ) : null}
        </button>
      </div>

      {open ? (
        <div className="filters-overlay" role="presentation">
          <div
            ref={panelRef}
            className="filters-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="filters-panel-head">
              <h3 id={titleId} className="filters-panel-title">
                Filtros
              </h3>
              <button
                type="button"
                className="filters-panel-close"
                aria-label="Cerrar filtros"
                onClick={closeWithoutApply}
              >
                ×
              </button>
            </div>

            <div className="filters-panel-grid">
              <label className="field">
                <span>Marca</span>
                <select
                  value={draft.brand}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, brand: e.target.value }))
                  }
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
                  value={draft.category}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      category: e.target.value as Category | '',
                    }))
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
                  value={draft.gender}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      gender: e.target.value as Gender | '',
                    }))
                  }
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
                  value={draft.size}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      size: e.target.value ? Number(e.target.value) : '',
                    }))
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

            <div className="filters-panel-actions">
              {draftAdvanced > 0 ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    setDraft({
                      brand: '',
                      category: '',
                      gender: '',
                      size: '',
                    })
                  }
                >
                  Limpiar
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={applyAndClose}
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
