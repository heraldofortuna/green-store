/**
 * Importa catálogos PDF Fritz Sport.
 * Precio = EMPRENDEDOR (2º de 3: Retail / Emprendedor / Mayorista)
 * Imagen = foto grande ~600x600 extraída con pdfimages
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const pdfjsLib = await import(
  pathToFileURL(require.resolve('pdfjs-dist/legacy/build/pdf.mjs')).href
)

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'public/images/products')
const DATA_OUT = path.join(ROOT, 'src/data/products.ts')
const JSON_OUT = path.join(ROOT, 'src/data/catalog.json')
const TMP_DIR = path.join(ROOT, '.tmp-pdf-import')

function parseArgs(argv) {
  const args = { brand: null, files: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--brand') args.brand = argv[++i]
    else if (a === '--file') args.files.push(argv[++i])
  }
  return args
}

function loadExistingCatalog() {
  if (!fs.existsSync(JSON_OUT)) return []
  try {
    return JSON.parse(fs.readFileSync(JSON_OUT, 'utf8'))
  } catch {
    return []
  }
}

function stripInternalFields(products) {
  return products.map(
    ({ id, code, name, brand, model, category, gender, price, sizes, colors, image, description }) => ({
      id,
      code,
      name,
      brand,
      model,
      category,
      gender,
      price,
      sizes,
      colors,
      image,
      description,
    }),
  )
}

const POPPLER_BIN =
  'C:/Users/heral/AppData/Local/Microsoft/WinGet/Packages/oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe/poppler-25.07.0/Library/bin'

const PDFS = [
  {
    brand: 'Nike',
    file: 'C:/Users/heral/Downloads/1794268716487_CATALOGO_NIKE_9_NOVIEMBRE_2026.pdf',
  },
  {
    brand: 'Adidas',
    file: 'C:/Users/heral/Downloads/1794268714033_CATALOGO_ADIDAS_LINEA_9_NOVIEMBRE_2026.pdf',
  },
  {
    brand: 'Adidas',
    file: 'C:/Users/heral/Downloads/1794268714484_CATALOGO_ADIDAS_LIQUIDACION_9_NOVIEMBRE_2026.pdf',
  },
  {
    brand: 'Reebok',
    file: 'C:/Users/heral/Downloads/1794268716008_CATALOGO_REEBOK_Y_CHAMPION_9_NOVIEMBRE_2026.pdf',
  },
  {
    brand: 'RS21',
    file: 'C:/Users/heral/Downloads/1794268715559_CATALOGO_RS_21_9_NOVIEMBRE_2026.pdf',
  },
]

const SKU_RE = /^[A-Z0-9][A-Z0-9-]{4,}$/i
const SIZE_RE = /^\d{2}(?:\.\d)?(?:\s*\/\s*\d{2}(?:\.\d)?)+$/
const SINGLE_SIZE_RE = /^(3[5-9]|4[0-9]|50)(?:\.\d)?$/
const PRICE_RE = /^\d{2,4}\.\d{2}$/

function isSizeToken(str) {
  const normalized = str.replace(/\s+/g, ' ')
  return SIZE_RE.test(normalized) || SINGLE_SIZE_RE.test(normalized)
}
const CAT_RE =
  /^(TRAIL-?RUNNING|RUNNING|URBANO|TRAINING|BASQUET|BASKETBALL|OUTDOOR|SPORTSWEAR|PLATAFORMA|CASUAL|FUTBOL|FÚTBOL|CHIMPUNES|TENIS|SANDALIAS|ZAPATILLAS|LIFESTYLE)\s*-\s*(HOMBRE|MUJER|NIÑOS|NINOS|UNISEX)$/i
// Nike: AA1234-001 · Adidas: JQ0601 · Reebok/RS21: 100272330
const NIKE_SKU_RE = /^[A-Z]{1,3}\d{3,5}-\d{2,4}$/i
const ADIDAS_SKU_RE = /^[A-Z]{2}\d{3,5}$/i
const NUMERIC_SKU_RE = /^\d{6,12}$/

function mapGender(raw) {
  const g = raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
  if (g.includes('NINO')) return 'Niños'
  if (g.includes('MUJER')) return 'Mujer'
  if (g.includes('HOMBRE')) return 'Hombre'
  return 'Unisex'
}

function mapCategory(raw) {
  const c = raw.split('-')[0].trim().toUpperCase()
  if (c.includes('RUN') || c.includes('TRAIL')) return 'Running'
  if (c.includes('BASQUET') || c.includes('BASKET')) return 'Basketball'
  if (c.includes('TRAIN')) return 'Training'
  if (c.includes('OUTDOOR') || c.includes('PLATAFORMA')) return 'Outdoor'
  if (c.includes('FUTBOL') || c.includes('FÚTBOL') || c.includes('CHIMPUNES')) {
    return 'Outdoor'
  }
  return 'Lifestyle'
}

function resolveBrand(defaultBrand, name) {
  if (/champion/i.test(name)) return 'Champion'
  return defaultBrand
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function isProductPhoto(width, height) {
  return width >= 420 && height >= 420 && width <= 1200 && height <= 1200
}

function runPdfImagesList(pdfPath) {
  const result = spawnSync(
    path.join(POPPLER_BIN, 'pdfimages.exe'),
    ['-list', pdfPath],
    { encoding: 'utf8' },
  )
  if (result.status !== 0) {
    throw new Error(result.stderr || 'pdfimages -list failed')
  }
  const rows = []
  for (const line of result.stdout.split(/\r?\n/)) {
    const m = line.match(
      /^\s*(\d+)\s+(\d+)\s+(\S+)\s+(\d+)\s+(\d+)\s+(\S+)/,
    )
    if (!m) continue
    rows.push({
      page: Number(m[1]),
      num: Number(m[2]),
      type: m[3],
      width: Number(m[4]),
      height: Number(m[5]),
      color: m[6],
    })
  }
  return rows
}

function extractPdfImages(pdfPath, destPrefix) {
  const result = spawnSync(
    path.join(POPPLER_BIN, 'pdfimages.exe'),
    ['-all', pdfPath, destPrefix],
    { encoding: 'utf8' },
  )
  if (result.status !== 0) {
    throw new Error(result.stderr || 'pdfimages extract failed')
  }
}

function jpegSize(filePath) {
  // minimal JPEG SOF parser
  const buf = fs.readFileSync(filePath)
  let i = 2
  while (i < buf.length) {
    if (buf[i] !== 0xff) break
    const marker = buf[i + 1]
    const len = buf.readUInt16BE(i + 2)
    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3
    ) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    }
    i += 2 + len
  }
  return null
}

function pngSize(filePath) {
  const buf = fs.readFileSync(filePath)
  if (buf.toString('ascii', 1, 4) !== 'PNG') return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

async function loadPdf(file) {
  const data = new Uint8Array(fs.readFileSync(file))
  return pdfjsLib.getDocument({ data, disableWorker: true }).promise
}

async function getPageTextItems(page) {
  const text = await page.getTextContent()
  return text.items
    .filter((i) => i.str && i.str.trim())
    .map((i) => ({
      str: i.str.trim(),
      x: i.transform[4],
      y: i.transform[5],
    }))
}

function isSkuToken(str, brand) {
  if (!str || PRICE_RE.test(str) || CAT_RE.test(str)) return false
  if (SIZE_RE.test(str.replace(/\s+/g, ' '))) return false
  if (/^ZAP\b/i.test(str)) return false
  const b = (brand || '').toLowerCase()
  if (b === 'nike') return NIKE_SKU_RE.test(str)
  if (b === 'adidas') return ADIDAS_SKU_RE.test(str) || NIKE_SKU_RE.test(str)
  if (b === 'reebok' || b === 'rs21' || b === 'champion') {
    return NUMERIC_SKU_RE.test(str) || NIKE_SKU_RE.test(str)
  }
  return (
    NIKE_SKU_RE.test(str) ||
    ADIDAS_SKU_RE.test(str) ||
    NUMERIC_SKU_RE.test(str) ||
    (SKU_RE.test(str) && str.length >= 5)
  )
}

function cleanProductName(str) {
  return str
    .replace(/^ZAP\s+NIK\s+[A-Z0-9-]+\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isNameToken(str) {
  if (!str || str.length < 3) return false
  if (PRICE_RE.test(str) || CAT_RE.test(str)) return false
  if (isSizeToken(str)) return false
  if (/^\d+$/.test(str)) return false
  if (NIKE_SKU_RE.test(str) || ADIDAS_SKU_RE.test(str) || NUMERIC_SKU_RE.test(str)) {
    return false
  }
  return /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(str)
}

function parseSizes(raw) {
  return (raw || '')
    .split('/')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n) && n >= 20 && n <= 50)
}

function findPriceRows(items) {
  const priceLines = new Map()
  for (const i of items) {
    if (!PRICE_RE.test(i.str)) continue
    const key = Math.round(i.y)
    if (!priceLines.has(key)) priceLines.set(key, [])
    priceLines.get(key).push(i)
  }
  const rows = []
  for (const row of priceLines.values()) {
    if (row.length < 2) continue
    const sorted = [...row].sort((a, b) => a.x - b.x)
    const avgX = sorted.reduce((s, p) => s + p.x, 0) / sorted.length
    const avgY = sorted.reduce((s, p) => s + p.y, 0) / sorted.length
    rows.push({ items: sorted, x: avgX, y: avgY })
  }
  return rows
}

function buildProduct({ skuItem, catItem, nameItem, priceRow, sizesItem, defaultBrand }) {
  const prices = priceRow.items.map((p) => Number(p.str))
  const emprendedor = prices.length >= 2 ? prices[1] : prices[0]
  const sizes = parseSizes(sizesItem?.str)
  if (!sizes.length || !emprendedor) return null

  const name = cleanProductName(nameItem.str)
  if (!name) return null
  const brand = resolveBrand(defaultBrand, name)
  const code = skuItem.str.toUpperCase()

  return {
    id: slugify(`${brand}-${code}`),
    code,
    name,
    brand,
    model: name,
    category: mapCategory(catItem.str),
    gender: mapGender(catItem.str),
    price: emprendedor,
    sizes,
    colors: ['Único'],
    image: '',
    description: `${brand} ${name}. Código ${code}.`,
    x: (skuItem.x + nameItem.x) / 2,
    y: (skuItem.y + nameItem.y) / 2,
    page: 0,
  }
}

/**
 * Catálogos Fritz (Nike/Adidas/Reebok): en cada fila el SKU está en una columna
 * y cat/nombre/precio en la otra. Empareje por bandas horizontales en cruz.
 */
function clusterCrossColumnProducts(items, defaultBrand) {
  const midX =
    items.reduce((s, i) => s + i.x, 0) / Math.max(items.length, 1) || 300

  const skus = items
    .filter((i) => isSkuToken(i.str, defaultBrand))
    .sort((a, b) => b.y - a.y || a.x - b.x)

  const priceRows = findPriceRows(items)
  const cats = items.filter((i) => CAT_RE.test(i.str))
  const names = items.filter((i) => isNameToken(i.str))
  const sizeItems = items.filter((i) => isSizeToken(i.str))

  const bodies = []
  for (const priceRow of priceRows) {
    const catItem = cats
      .filter((c) => c.y > priceRow.y && c.y < priceRow.y + 120)
      .sort(
        (a, b) =>
          Math.hypot(a.x - priceRow.x, a.y - (priceRow.y + 60)) -
          Math.hypot(b.x - priceRow.x, b.y - (priceRow.y + 60)),
      )[0]
    if (!catItem) continue

    const nameItem = names
      .filter(
        (n) =>
          n.y < catItem.y &&
          n.y > priceRow.y &&
          Math.abs(n.x - catItem.x) < 160,
      )
      .sort(
        (a, b) =>
          Math.hypot(a.x - catItem.x, a.y - (catItem.y - 25)) -
          Math.hypot(b.x - catItem.x, b.y - (catItem.y - 25)),
      )[0]
    if (!nameItem) continue

    // Tallas van con el body (misma columna), no con el SKU cruzado.
    const bodySideLeft = priceRow.x < midX
    const sizesItem = sizeItems
      .filter((s) => Math.abs(s.y - priceRow.y) < 220)
      .sort((a, b) => {
        const aSame = a.x < midX === bodySideLeft ? 0 : 1
        const bSame = b.x < midX === bodySideLeft ? 0 : 1
        if (aSame !== bSame) return aSame - bSame
        return (
          Math.hypot(a.x - priceRow.x, a.y - priceRow.y) -
          Math.hypot(b.x - priceRow.x, b.y - priceRow.y)
        )
      })[0]

    bodies.push({
      catItem,
      nameItem,
      priceRow,
      sizesItem,
      x: priceRow.x,
      y: nameItem.y,
      side: priceRow.x < midX ? 'L' : 'R',
    })
  }

  // Bandas horizontales (~1 fila de catálogo)
  const bandYs = [...skus.map((s) => s.y), ...bodies.map((b) => b.y)].sort(
    (a, b) => b - a,
  )
  const bands = []
  for (const y of bandYs) {
    const existing = bands.find((b) => Math.abs(b.y - y) < 140)
    if (existing) {
      existing.y = (existing.y * existing.n + y) / (existing.n + 1)
      existing.n += 1
    } else {
      bands.push({ y, n: 1, skus: [], bodies: [] })
    }
  }

  for (const sku of skus) {
    const band = bands.sort(
      (a, b) => Math.abs(a.y - sku.y) - Math.abs(b.y - sku.y),
    )[0]
    if (band && Math.abs(band.y - sku.y) < 160) band.skus.push(sku)
  }
  for (const body of bodies) {
    const band = bands.sort(
      (a, b) => Math.abs(a.y - body.y) - Math.abs(b.y - body.y),
    )[0]
    if (band && Math.abs(band.y - body.y) < 160) band.bodies.push(body)
  }

  const products = []
  const usedSkus = new Set()
  const usedBodies = new Set()

  for (const band of bands.sort((a, b) => b.y - a.y)) {
    const freeSkus = band.skus.filter((s) => !usedSkus.has(s.str))
    const freeBodies = band.bodies.filter(
      (b) => !usedBodies.has(`${b.nameItem.str}@${b.y}`),
    )
    if (!freeSkus.length || !freeBodies.length) continue

    const pairs = []
    if (freeSkus.length === 1 && freeBodies.length === 1) {
      pairs.push([freeSkus[0], freeBodies[0]])
    } else {
      // Cruce de columnas: SKU L ↔ body R, SKU R ↔ body L
      for (const sku of freeSkus) {
        const skuSide = sku.x < midX ? 'L' : 'R'
        const opposite = freeBodies
          .filter((b) => b.side !== skuSide && !pairs.some(([, bb]) => bb === b))
          .sort((a, b) => Math.abs(a.y - sku.y) - Math.abs(b.y - sku.y))[0]
        const fallback = freeBodies
          .filter((b) => !pairs.some(([, bb]) => bb === b))
          .sort((a, b) => Math.abs(a.y - sku.y) - Math.abs(b.y - sku.y))[0]
        const body = opposite || fallback
        if (body) pairs.push([sku, body])
      }
    }

    for (const [skuItem, body] of pairs) {
      const key = `${body.nameItem.str}@${body.y}`
      if (usedSkus.has(skuItem.str) || usedBodies.has(key)) continue
      const sizesItem =
        body.sizesItem ||
        sizeItems
          .filter((s) => Math.abs(s.y - skuItem.y) < 50)
          .sort(
            (a, b) =>
              Math.hypot(a.x - skuItem.x, a.y - skuItem.y) -
              Math.hypot(b.x - skuItem.x, b.y - skuItem.y),
          )[0]

      const product = buildProduct({
        skuItem,
        catItem: body.catItem,
        nameItem: body.nameItem,
        priceRow: body.priceRow,
        sizesItem,
        defaultBrand,
      })
      if (!product) continue
      usedSkus.add(skuItem.str)
      usedBodies.add(key)
      products.push(product)
    }
  }

  const byCode = new Map()
  for (const p of products) {
    if (!byCode.has(p.code)) byCode.set(p.code, p)
  }
  return [...byCode.values()]
}

function clusterProducts(items, defaultBrand) {
  // Fritz Sport PDFs (Nike / Adidas / Reebok / RS21) usan el mismo layout cruzado.
  return clusterCrossColumnProducts(items, defaultBrand)
}

function emitTs(products) {
  const brands = [...new Set(products.map((p) => p.brand))].sort()
  return `export type Category =
  | 'Lifestyle'
  | 'Running'
  | 'Basketball'
  | 'Training'
  | 'Outdoor'
  | 'Skate'
  | 'Casual'

export type Gender = 'Hombre' | 'Mujer' | 'Unisex' | 'Niños'

export interface Product {
  id: string
  code: string
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

export const brands = ${JSON.stringify(brands, null, 2)} as const

export const categories: Category[] = [
  'Lifestyle',
  'Running',
  'Basketball',
  'Training',
  'Outdoor',
  'Casual',
]

export const genders: Gender[] = ['Hombre', 'Mujer', 'Unisex', 'Niños']

export const allSizes = ${JSON.stringify(
    [...new Set(products.flatMap((p) => p.sizes))].sort((a, b) => a - b),
  )}

export const products: Product[] = [
${products
  .map(
    (p) => `  {
    id: ${JSON.stringify(p.id)},
    code: ${JSON.stringify(p.code)},
    name: ${JSON.stringify(p.name)},
    brand: ${JSON.stringify(p.brand)},
    model: ${JSON.stringify(p.model)},
    category: ${JSON.stringify(p.category)},
    gender: ${JSON.stringify(p.gender)},
    price: ${p.price},
    sizes: ${JSON.stringify(p.sizes)},
    colors: ${JSON.stringify(p.colors)},
    image: ${JSON.stringify(p.image)},
    description: ${JSON.stringify(p.description)},
  }`,
  )
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

async function importOne(entry, seq) {
  const brandKey = slugify(entry.brand)
  const workDir = path.join(TMP_DIR, brandKey + '-' + Date.now())
  fs.mkdirSync(workDir, { recursive: true })
  const prefix = path.join(workDir, 'img')

  console.log(`   extrayendo imágenes…`)
  const list = runPdfImagesList(entry.file)
  extractPdfImages(entry.file, prefix)

  // Map extracted files in pdfimages order (numeric index, NOT lexical:
  // lexical puts img-1000 before img-112 and breaks alignment past 999).
  const extracted = fs
    .readdirSync(workDir)
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .sort((a, b) => {
      const na = Number(a.match(/(\d+)/)?.[1] ?? 0)
      const nb = Number(b.match(/(\d+)/)?.[1] ?? 0)
      return na - nb
    })

  if (extracted.length !== list.length) {
    console.warn(
      `   aviso: list=${list.length} files=${extracted.length} (se alinea por índice mínimo)`,
    )
  }

  const photosByPage = new Map()
  const n = Math.min(list.length, extracted.length)
  let photoCount = 0
  for (let i = 0; i < n; i++) {
    const meta = list[i]
    if (meta.type === 'smask' || meta.color === 'gray') continue
    if (!isProductPhoto(meta.width, meta.height)) continue
    const src = path.join(workDir, extracted[i])
    // double-check dimensions from file when possible
    const size =
      /\.png$/i.test(src) ? pngSize(src) : jpegSize(src)
    if (size && !isProductPhoto(size.width, size.height)) continue

    photoCount++
    seq.n += 1
    // Global seq avoids línea/liquidación overwriting the same adidas-pXX-YYY name.
    const fileName = `${brandKey}-${String(seq.n).padStart(4, '0')}${path.extname(src).toLowerCase()}`
    const dest = path.join(OUT_DIR, fileName)
    fs.copyFileSync(src, dest)
    if (!photosByPage.has(meta.page)) photosByPage.set(meta.page, [])
    photosByPage.get(meta.page).push(`images/products/${fileName}`)
  }
  console.log(`   fotos producto: ${photoCount}`)

  console.log(`   parseando textos…`)
  const doc = await loadPdf(entry.file)
  const products = []
  for (let pageIndex = 0; pageIndex < doc.numPages; pageIndex++) {
    const page = await doc.getPage(pageIndex + 1)
    const items = await getPageTextItems(page)
    if (!items.length) continue
    const pageProducts = clusterProducts(items, entry.brand)
      .sort((a, b) => b.y - a.y || a.x - b.x)
    const pagePhotos = photosByPage.get(pageIndex + 1) || []
    pageProducts.forEach((p, idx) => {
      p.page = pageIndex + 1
      if (pagePhotos[idx]) p.image = pagePhotos[idx]
    })
    products.push(...pageProducts)
  }

  // cleanup temp
  fs.rmSync(workDir, { recursive: true, force: true })
  return products
}

async function main() {
  const cli = parseArgs(process.argv.slice(2))
  const replaceMode = Boolean(cli.brand && cli.files.length)

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.mkdirSync(TMP_DIR, { recursive: true })

  const pdfJobs = replaceMode
    ? cli.files.map((file) => ({ brand: cli.brand, file }))
    : PDFS

  if (replaceMode) {
    console.log(`\nModo reemplazo: solo marca "${cli.brand}"`)
    // borra solo imágenes de esa marca
    const prefix = `${slugify(cli.brand)}-`
    for (const file of fs.readdirSync(OUT_DIR)) {
      if (file.toLowerCase().startsWith(prefix) && /\.(jpg|jpeg|png)$/i.test(file)) {
        fs.unlinkSync(path.join(OUT_DIR, file))
      }
    }
  } else {
    for (const file of fs.readdirSync(OUT_DIR)) {
      if (/\.(jpg|jpeg|png)$/i.test(file)) fs.unlinkSync(path.join(OUT_DIR, file))
    }
  }

  const imported = []
  const photoSeq = { n: 0 }
  for (const entry of pdfJobs) {
    console.log(`\n→ ${entry.brand}: ${path.basename(entry.file)}`)
    const items = await importOne(entry, photoSeq)
    console.log(`   productos: ${items.length}`)
    imported.push(...items)
  }

  let merged
  if (replaceMode) {
    const existing = loadExistingCatalog()
    const kept = existing.filter(
      (p) => p.brand.toLowerCase() !== cli.brand.toLowerCase(),
    )
    merged = [...kept, ...imported]
    console.log(
      `   conservados otras marcas: ${kept.length} | nuevos ${cli.brand}: ${imported.length}`,
    )
  } else {
    merged = imported
  }

  const unique = []
  const seen = new Set()
  for (const p of merged) {
    if (seen.has(p.code)) continue
    seen.add(p.code)
    unique.push(p)
  }
  unique.sort(
    (a, b) =>
      a.price - b.price ||
      a.brand.localeCompare(b.brand) ||
      a.name.localeCompare(b.name),
  )

  const clean = stripInternalFields(unique)
  fs.writeFileSync(JSON_OUT, JSON.stringify(clean, null, 2))
  fs.writeFileSync(DATA_OUT, emitTs(clean))
  console.log(`\n✓ ${clean.length} products → ${DATA_OUT}`)
  console.log(`✓ mirror JSON → ${JSON_OUT}`)
  console.log(
    Object.fromEntries(
      [...new Set(clean.map((p) => p.brand))].map((b) => [
        b,
        clean.filter((p) => p.brand === b).length,
      ]),
    ),
  )
  console.log(
    'with images:',
    clean.filter((p) => p.image).length,
    '/',
    clean.length,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
