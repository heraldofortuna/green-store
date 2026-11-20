/**
 * Descarga ángulos extra desde la tienda eBiz (ebizperu.com/green)
 * y los guarda en public/images/products/gallery/.
 *
 * Empareja por SKU (productCode) del catálogo Fritz.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { emitTs, writeAtomic } from './lib/emit-catalog.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const JSON_OUT = path.join(ROOT, 'src/data/catalog.json')
const DATA_OUT = path.join(ROOT, 'src/data/products.ts')
const GALLERY_DIR = path.join(ROOT, 'public/images/products/gallery')
const EBIZ_STORE = 'green'
const EBIZ_API = 'https://ebiz-8548bd4486c1.herokuapp.com/v1/external'
const MAX_EXTRAS = 3
const PAGE_SIZE = 50

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

function isBrandOnlyAsset(name) {
  const n = String(name || '').toLowerCase()
  return (
    /marca|logo|banner|dise.o sin t/.test(n) ||
    n.endsWith('(2).png') ||
    n.includes('imagen de marcas')
  )
}

function photoUrlsFromEbizProduct(product) {
  const urls = []
  for (const entry of product.images || []) {
    const name = entry.file?.name || ''
    if (isBrandOnlyAsset(name)) continue
    const url = entry.file?.images?.medium || entry.file?.images?.thumbnail
    if (url) urls.push(url)
  }
  return [...new Set(urls)]
}

async function fetchEbizPage(page) {
  const u = new URL(`${EBIZ_API}/catalog/products/${EBIZ_STORE}`)
  u.searchParams.set('page', String(page))
  u.searchParams.set('limit', String(PAGE_SIZE))
  const res = await fetch(u, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`eBiz HTTP ${res.status} page ${page}`)
  return res.json()
}

async function loadEbizBySku() {
  const bySku = new Map()
  let page = 1
  let hasMore = true
  let total = 0

  while (hasMore) {
    const data = await fetchEbizPage(page)
    const products = Array.isArray(data.products) ? data.products : []
    total = data.count ?? total
    hasMore = Boolean(data.hasMore) && products.length > 0
    for (const product of products) {
      const urls = photoUrlsFromEbizProduct(product)
      if (!urls.length) continue
      for (const sku of product.skus || []) {
        const code = normalizeCode(sku.productCode)
        if (!code) continue
        const prev = bySku.get(code)
        if (!prev || urls.length > prev.length) {
          bySku.set(code, urls)
        }
      }
    }
    page += 1
    if (page > 500) break
  }
  console.log(`eBiz: ${total} productos en tienda, ${bySku.size} SKUs con fotos`)
  return bySku
}

async function downloadToFile(url, dest) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download ${res.status} ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, buf)
  return dest
}

function extFromUrl(url) {
  const m = String(url).match(/\.(webp|jpe?g|png)(\?|$)/i)
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'webp'
}

function parseArgs() {
  const codes = []
  let dryRun = false
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--code' && argv[i + 1]) {
      codes.push(normalizeCode(argv[++i]))
    } else if (argv[i] === '--dry-run') {
      dryRun = true
    }
  }
  return { codes, dryRun }
}

async function main() {
  const { codes: onlyCodes, dryRun } = parseArgs()
  if (!fs.existsSync(JSON_OUT)) {
    throw new Error('No existe catalog.json; corre npm run import:catalog primero')
  }

  const catalog = JSON.parse(fs.readFileSync(JSON_OUT, 'utf8'))
  const targets = onlyCodes.length
    ? catalog.filter((p) => onlyCodes.includes(normalizeCode(p.code)))
    : catalog

  if (!targets.length) {
    console.error('Ningún producto coincide con --code')
    process.exit(1)
  }

  const ebizBySku = await loadEbizBySku()
  fs.mkdirSync(GALLERY_DIR, { recursive: true })

  let matched = 0
  let downloaded = 0
  let skippedNoEbiz = 0

  for (const product of targets) {
    const code = normalizeCode(product.code)
    const remote = ebizBySku.get(code)
    if (!remote?.length) {
      skippedNoEbiz++
      continue
    }

    const extras = remote.slice(0, MAX_EXTRAS)
    const localPaths = []
    const base = slugify(`${product.brand}-${code}`)

    for (let i = 0; i < extras.length; i++) {
      const url = extras[i]
      const ext = extFromUrl(url)
      const rel = `images/products/gallery/${base}-${String(i + 1).padStart(2, '0')}.${ext}`
      const dest = path.join(ROOT, 'public', rel)
      if (!dryRun) {
        try {
          await downloadToFile(url, dest)
          downloaded++
        } catch (err) {
          console.warn(`   ✗ ${code} foto ${i + 1}: ${err.message}`)
          continue
        }
      }
      localPaths.push(rel)
    }

    if (localPaths.length) {
      const idx = catalog.findIndex((p) => normalizeCode(p.code) === code)
      if (idx >= 0) catalog[idx].gallery = localPaths
      matched++
      console.log(`✓ ${code} ${product.name} → ${localPaths.length} extras`)
    }
  }

  if (!dryRun) {
    writeAtomic(JSON_OUT, JSON.stringify(catalog, null, 2))
    writeAtomic(DATA_OUT, emitTs(catalog))
  }

  console.log('\nResumen')
  console.log('objetivo:', targets.length)
  console.log('con galería eBiz:', matched)
  console.log('sin match eBiz:', skippedNoEbiz)
  console.log('archivos descargados:', downloaded)
  if (dryRun) console.log('(dry-run: no se escribió catalog)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})