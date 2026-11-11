export interface BrandInfo {
  name: string
  /** Ruta relativa dentro de /public. Si no hay logo, se muestra el nombre. */
  logo?: string
}

/** Marcas mostradas en el carrusel demostrativo */
export const brandCatalog: BrandInfo[] = [
  { name: 'Nike', logo: 'images/brands/nike.png' },
  { name: 'Adidas', logo: 'images/brands/adidas.png' },
  { name: 'Reebok', logo: 'images/brands/reebok.png' },
  { name: 'RS21', logo: 'images/brands/rs21.png' },
]

const brandByName = new Map(
  brandCatalog.map((brand) => [brand.name.toLowerCase(), brand]),
)

export function getBrandInfo(name: string): BrandInfo {
  return brandByName.get(name.toLowerCase()) ?? { name }
}
