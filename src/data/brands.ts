export interface BrandInfo {
  name: string
  /** Ruta relativa dentro de /public. Si no hay logo, se muestra el nombre. */
  logo?: string
}

export const brandCatalog: BrandInfo[] = [
  { name: 'Nike', logo: 'images/brands/nike.png' },
  { name: 'Adidas', logo: 'images/brands/adidas.png' },
  { name: 'New Balance' },
  { name: 'Puma', logo: 'images/brands/puma.png' },
  { name: 'Vans' },
  { name: 'Converse', logo: 'images/brands/converse.png' },
  { name: 'Reebok', logo: 'images/brands/reebok.png' },
]

const brandByName = new Map(
  brandCatalog.map((brand) => [brand.name.toLowerCase(), brand]),
)

export function getBrandInfo(name: string): BrandInfo {
  return brandByName.get(name.toLowerCase()) ?? { name }
}
