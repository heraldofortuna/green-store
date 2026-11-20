/**
 * Fotos extra Adidas vía CDN INTERTOP (misma fuente que GW6423 / Tensaur).
 * Usar cuando gallery:ebiz no tiene match.
 *
 * CDN: https://s1.media.intertop.com/load/{mediaId}/original/{view}.webp
 * Vistas 2, 3, 5 suelen ser ángulos distintos (evitar /large/ — repite thumb).
 */
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { emitTs, writeAtomic } from './lib/emit-catalog.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const JSON_OUT = path.join(ROOT, 'src/data/catalog.json')
const DATA_OUT = path.join(ROOT, 'src/data/products.ts')
const GALLERY_DIR = path.join(ROOT, 'public/images/products/gallery')
const MEDIA_MAP = path.join(__dirname, 'adidas-intertop-media.json')
const CDN = 'https://s1.media.intertop.com/load'
const VIEW_INDICES = [2, 3, 5]
const MAX_EXTRAS = 3

function normalizeCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function loadMediaMap() {
  const raw = JSON.parse(fs.readFileSync(MEDIA_MAP, 'utf8'))
  const map = new Map()
  for (const [key, val] of Object.entries(raw)) {
    if (key.startsWith('_')) continue
    map.set(normalizeCode(key), String(val).trim())
  }
  return map
}

async function downloadToFile(url, dest) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 2048) throw new Error('archivo demasiado pequeño')
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, buf)
  return crypto.createHash('md5').update(buf).digest('hex')
}

function parseArgs() {
  const codes = []
  let allAdidasMissing = false
  let dryRun = false
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--code' && argv[i + 1]) {
      codes.push(normalizeCode(argv[++i]))
    } else if (argv[i] === '--all-adidas') {
      allAdidasMissing = true
    } else if (argv[i] === '--dry-run') {
      dryRun = true
    }
  }
  return { codes, allAdidasMissing, dryRun }
}

async function main() {
  const { codes, allAdidasMissing, dryRun } = parseArgs()
  if (!fs.existsSync(JSON_OUT)) {
    throw new Error('No existe catalog.json')
  }

  const catalog = JSON.parse(fs.readFileSync(JSON_OUT, 'utf8'))
  const mediaBySku = loadMediaMap()

  let targets
  if (allAdidasMissing) {
    targets = catalog.filter(
      (p) =>
        String(p.brand).toLowerCase() === 'adidas' &&
        !(p.gallery && p.gallery.length),
    )
  } else if (codes.length) {
    targets = catalog.filter((p) => codes.includes(normalizeCode(p.code)))
  } else {
    console.error('Usa --code SKU o --all-adidas')
    process.exit(1)
  }

  if (!targets.length) {
    console.error('Sin productos objetivo')
    process.exit(1)
  }

  fs.mkdirSync(GALLERY_DIR, { recursive: true })

  let matched = 0
  let downloaded = 0
  let skippedNoMap = 0

  for (const product of targets) {
    const code = normalizeCode(product.code)
    const mediaId = mediaBySku.get(code)
    if (!mediaId) {
      skippedNoMap++
      console.warn(`○ ${code} — sin mediaId en adidas-intertop-media.json`)
      continue
    }

    const hashes = new Set()
    const localPaths = []
    const base = slugify(`${product.brand}-${code}`)

    for (const view of VIEW_INDICES) {
      if (localPaths.length >= MAX_EXTRAS) break
      const url = `${CDN}/${mediaId}/original/${view}.webp`
      const rel = `images/products/gallery/${base}-${String(localPaths.length + 1).padStart(2, '0')}.webp`
      const dest = path.join(ROOT, 'public', rel)
      try {
        if (!dryRun) {
          const md5 = await downloadToFile(url, dest)
          if (hashes.has(md5)) {
            fs.unlinkSync(dest)
            continue
          }
          hashes.add(md5)
          downloaded++
        }
        localPaths.push(rel)
      } catch (err) {
        console.warn(`   ✗ ${code} vista ${view}: ${err.message}`)
      }
    }

    if (localPaths.length) {
      const idx = catalog.findIndex((p) => normalizeCode(p.code) === code)
      if (idx >= 0) catalog[idx].gallery = localPaths
      matched++
      console.log(`✓ ${code} INTERTOP ${mediaId} → ${localPaths.length} extras`)
    }
  }

  if (!dryRun) {
    writeAtomic(JSON_OUT, JSON.stringify(catalog, null, 2))
    writeAtomic(DATA_OUT, emitTs(catalog))
  }

  console.log('\nResumen')
  console.log('objetivo:', targets.length)
  console.log('con galería INTERTOP:', matched)
  console.log('sin mediaId en mapa:', skippedNoMap)
  console.log('archivos descargados:', downloaded)
  if (dryRun) console.log('(dry-run: no se escribió catalog)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})