export type Category = 'Lifestyle' | 'Running' | 'Basketball' | 'Skate' | 'Casual'
export type Gender = 'Hombre' | 'Mujer' | 'Unisex'

export interface Product {
  id: string
  name: string
  brand: string
  model: string
  category: Category
  gender: Gender
  price: number
  sizes: number[]
  colors: string[]
  image: string
  description: string
  featured?: boolean
}

export const brands = [
  'Nike',
  'Adidas',
  'New Balance',
  'Puma',
  'Vans',
  'Converse',
] as const

export const categories: Category[] = [
  'Lifestyle',
  'Running',
  'Basketball',
  'Skate',
  'Casual',
]

export const genders: Gender[] = ['Hombre', 'Mujer', 'Unisex']

export const allSizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45]

export const products: Product[] = [
  {
    id: 'nk-af1-white',
    name: 'Air Force 1 Low',
    brand: 'Nike',
    model: 'Air Force 1',
    category: 'Lifestyle',
    gender: 'Unisex',
    price: 429.9,
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: ['Blanco', 'Negro'],
    image:
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=800&q=80',
    description:
      'El ícono streetwear por excelencia. Cuero premium, silueta limpia y presencia en cualquier outfit.',
    featured: true,
  },
  {
    id: 'nk-dunk-panda',
    name: 'Dunk Low Panda',
    brand: 'Nike',
    model: 'Dunk Low',
    category: 'Lifestyle',
    gender: 'Unisex',
    price: 489.9,
    sizes: [37, 38, 39, 40, 41, 42, 43],
    colors: ['Negro', 'Blanco'],
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    description:
      'Contraste panda clásico. Perfecta para el día a día y colecciones urbanas.',
    featured: true,
  },
  {
    id: 'nk-pegasus-41',
    name: 'Pegasus 41',
    brand: 'Nike',
    model: 'Pegasus',
    category: 'Running',
    gender: 'Hombre',
    price: 519.9,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: ['Negro', 'Volt'],
    image:
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
    description:
      'Amortiguación reactiva para entrenamientos diarios y carreras de media distancia.',
  },
  {
    id: 'ad-samba-og',
    name: 'Samba OG',
    brand: 'Adidas',
    model: 'Samba',
    category: 'Casual',
    gender: 'Unisex',
    price: 399.9,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43],
    colors: ['Negro', 'Blanco'],
    image:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    description:
      'Clásico atemporal del fútbol convertido en staple de moda. Suela gum y tipografía vintage.',
    featured: true,
  },
  {
    id: 'ad-campus-00s',
    name: 'Campus 00s',
    brand: 'Adidas',
    model: 'Campus',
    category: 'Lifestyle',
    gender: 'Mujer',
    price: 419.9,
    sizes: [37, 38, 39, 40, 41, 42, 43, 44],
    colors: ['Verde', 'Gris'],
    image:
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffc26e5?auto=format&fit=crop&w=800&q=80',
    description:
      'Gamuza suave, proporciones oversized y vibra college renovada.',
  },
  {
    id: 'ad-ultraboost-5',
    name: 'Ultraboost 5',
    brand: 'Adidas',
    model: 'Ultraboost',
    category: 'Running',
    gender: 'Hombre',
    price: 649.9,
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Negro', 'Blanco'],
    image:
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80',
    description:
      'Energía Boost y upper Primeknit para máxima comodidad kilómetro tras kilómetro.',
  },
  {
    id: 'nb-550-white',
    name: '550 White Green',
    brand: 'New Balance',
    model: '550',
    category: 'Lifestyle',
    gender: 'Unisex',
    price: 459.9,
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: ['Blanco', 'Verde'],
    image:
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
    description:
      'Basket revival con acentos verdes. Ideal para looks limpios y premium.',
    featured: true,
  },
  {
    id: 'nb-9060-rain',
    name: '9060 Rain Cloud',
    brand: 'New Balance',
    model: '9060',
    category: 'Lifestyle',
    gender: 'Hombre',
    price: 549.9,
    sizes: [39, 40, 41, 42, 43, 44],
    colors: ['Gris', 'Plata'],
    image:
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80',
    description:
      'Silueta chunky con capas técnicas y sensación futurista en la calle.',
  },
  {
    id: 'nb-1080-v13',
    name: 'Fresh Foam 1080 v13',
    brand: 'New Balance',
    model: '1080',
    category: 'Running',
    gender: 'Hombre',
    price: 599.9,
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Negro', 'Azul'],
    image:
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80',
    description:
      'Máxima amortiguación Fresh Foam X para runners que buscan comodidad total.',
  },
  {
    id: 'pm-suede-classic',
    name: 'Suede Classic XXI',
    brand: 'Puma',
    model: 'Suede Classic',
    category: 'Casual',
    gender: 'Unisex',
    price: 349.9,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43],
    colors: ['Negro', 'Rojo', 'Verde'],
    image:
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80',
    description:
      'Gamuza icónica y vibe old-school. Un básico que nunca falla.',
  },
  {
    id: 'pm-rsx-efekt',
    name: 'RS-X Efekt',
    brand: 'Puma',
    model: 'RS-X',
    category: 'Lifestyle',
    gender: 'Hombre',
    price: 429.9,
    sizes: [39, 40, 41, 42, 43, 44],
    colors: ['Blanco', 'Negro'],
    image:
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
    description:
      'Diseño bold con capas y amortiguación RS para un look statement.',
  },
  {
    id: 'vn-old-skool',
    name: 'Old Skool Black',
    brand: 'Vans',
    model: 'Old Skool',
    category: 'Skate',
    gender: 'Unisex',
    price: 299.9,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: ['Negro', 'Blanco'],
    image:
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    description:
      'La side stripe legendaria. Lona resistente y suela waffle para skate y calle.',
    featured: true,
  },
  {
    id: 'vn-sk8-hi',
    name: 'SK8-Hi',
    brand: 'Vans',
    model: 'SK8-Hi',
    category: 'Skate',
    gender: 'Unisex',
    price: 329.9,
    sizes: [37, 38, 39, 40, 41, 42, 43],
    colors: ['Negro', 'Checkerboard'],
    image:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    description:
      'Caña alta para protección y estilo. Un clásico del skateboarding.',
  },
  {
    id: 'cv-chuck-70',
    name: 'Chuck 70 Hi',
    brand: 'Converse',
    model: 'Chuck 70',
    category: 'Casual',
    gender: 'Mujer',
    price: 319.9,
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    colors: ['Negro', 'Blanco', 'Verde'],
    image:
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80',
    description:
      'Versión premium del Chuck Taylor: lona más gruesa, detalles vintage y mayor confort.',
  },
  {
    id: 'nk-lebron-xxi',
    name: 'LeBron XXI',
    brand: 'Nike',
    model: 'LeBron',
    category: 'Basketball',
    gender: 'Hombre',
    price: 699.9,
    sizes: [40, 41, 42, 43, 44, 45],
    colors: ['Negro', 'Dorado'],
    image:
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
    description:
      'Rendimiento de cancha con cushioning avanzado y soporte lateral agresivo.',
  },
  {
    id: 'ad-harden-vol8',
    name: 'Harden Vol. 8',
    brand: 'Adidas',
    model: 'Harden',
    category: 'Basketball',
    gender: 'Hombre',
    price: 579.9,
    sizes: [40, 41, 42, 43, 44],
    colors: ['Negro', 'Rojo'],
    image:
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80',
    description:
      'Tracción multidireccional y Boost para cambios de ritmo en la pintura.',
  },
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(price)
}
