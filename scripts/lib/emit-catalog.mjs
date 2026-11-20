import fs from 'fs'

/** Regenera src/data/products.ts desde el array de productos (misma forma que import-catalog). */
export function emitTs(products) {
  const brands = [...new Set(products.map((p) => p.brand))].sort()
  const categoriesUi = [
    'Running',
    'Urbanas',
    'Chimpunes',
    'Chocolateras',
    'Sportswear',
    'Basketball',
    'Training',
    'Todoterreno',
    'Sandalias',
    'Tenis',
    'Escolar',
    'Skate',
  ]

  return `export type Category =
  | 'Running'
  | 'Basketball'
  | 'Training'
  | 'Todoterreno'
  | 'Skate'
  | 'Urbanas'
  | 'Chimpunes'
  | 'Chocolateras'
  | 'Sandalias'
  | 'Tenis'
  | 'Sportswear'
  | 'Escolar'

export type Gender = 'Hombre' | 'Mujer' | 'Unisex' | 'Niños'

export interface Product {
  id: string
  code: string
  name: string
  brand: string
  model: string
  category: Category
  gender: Gender
  retailPrice: number
  price: number
  wholesalePrice: number
  sizes: number[]
  colors: string[]
  image: string
  gallery?: string[]
  description: string
  featured?: boolean
}

export const brands = ${JSON.stringify(brands, null, 2)} as const

export const categories: Category[] = ${JSON.stringify(categoriesUi, null, 2)}

export const genders: Gender[] = ['Hombre', 'Mujer', 'Unisex', 'Niños']

export const allSizes = ${JSON.stringify(
    [...new Set(products.flatMap((p) => p.sizes))].sort((a, b) => a - b),
  )}

export const products: Product[] = [
${products
  .map((p) => {
    const galleryLine = p.gallery?.length
      ? `\n    gallery: ${JSON.stringify(p.gallery)},`
      : ''
    return `  {
    id: ${JSON.stringify(p.id)},
    code: ${JSON.stringify(p.code)},
    name: ${JSON.stringify(p.name)},
    brand: ${JSON.stringify(p.brand)},
    model: ${JSON.stringify(p.model)},
    category: ${JSON.stringify(p.category)},
    gender: ${JSON.stringify(p.gender)},
    retailPrice: ${p.retailPrice},
    price: ${p.price},
    wholesalePrice: ${p.wholesalePrice},
    sizes: ${JSON.stringify(p.sizes)},
    colors: ${JSON.stringify(p.colors)},
    image: ${JSON.stringify(p.image)},${galleryLine}
    description: ${JSON.stringify(p.description)},
  }`
  })
  .join(',\n')}
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(price)
}
`
}

export function writeAtomic(file, contents) {
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, contents)
  fs.renameSync(tmp, file)
}