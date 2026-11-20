/**
 * Revisa https://www.fritzsportcatalogo.pe/pdf por PDFs nuevos (Adidas, Nike, RS21, Reebok).
 * Detecta novedad por nombre de archivo en CDN (timestamp + fecha en el nombre).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const STATE_PATH = path.join(__dirname, 'fritz-catalog-state.json')
const PAGE_URL = 'https://www.fritzsportcatalogo.pe/pdf'
const CDN = 'https://cdn.fritzsport.pe/productos'

const WATCH_BRANDS = ['Adidas', 'Nike', 'RS21', 'Reebok']

const MONTHS = {
  ENERO: 1,
  FEBRERO: 2,
  MARZO: 3,
  ABRIL: 4,
  MAYO: 5,
  JUNIO: 6,
  JULIO: 7,
  AGOSTO: 8,
  SETIEMBRE: 9,
  OCTUBRE: 10,
  NOVIEMBRE: 11,
  DICIEMBRE: 12,
}

function parseArgs() {
  const argv = process.argv.slice(2)
  return {
    writeState: argv.includes('--write-state'),
    json: argv.includes('--json'),
  }
}

function writeAtomic(file, contents) {
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, contents)
  fs.renameSync(tmp, file)
}

/** Adidas línea + liquidación → marca Adidas para import. */
function brandFromFilename(fileName) {
  const u = fileName.toUpperCase()
  if (u.includes('CATALOGO_ADIDAS') || u.includes('_ADIDAS_')) return 'Adidas'
  if (u.includes('CATALOGO_NIKE') || u.includes('_NIKE_')) return 'Nike'
  if (u.includes('RS_21') || u.includes('RS21')) return 'RS21'
  if (u.includes('REEBOK')) return 'Reebok'
  return null
}

function parseCatalogDate(fileName) {
  const m = fileName.match(/_(\d{1,2})_([A-ZÁÉÍÓÚ]+)_(\d{4})\.pdf$/i)
  if (m) {
    const day = Number(m[1])
    const monthName = m[2].toUpperCase().replace('Á', 'A').replace('É', 'E')
    const year = Number(m[3])
    const month = MONTHS[monthName]
    if (month) {
      return {
        iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        label: `${day} ${monthName} ${year}`,
      }
    }
  }
  const ts = fileName.match(/^(\d{13})_/)
  if (ts) {
    const d = new Date(Number(ts[1]))
    if (!Number.isNaN(d.getTime())) {
      return { iso: d.toISOString().slice(0, 10), label: d.toLocaleDateString('es-PE') }
    }
  }
  return { iso: null, label: '(sin fecha en nombre)' }
}

function extractPdfsFromHtml(html) {
  const re = /catalog-pdfs\/[a-f0-9-]+\/\d+_[^"'\\]+\.pdf/gi
  const seen = new Set()
  const out = []
  for (const match of html.matchAll(re)) {
    const rel = match[0]
    if (seen.has(rel)) continue
    seen.add(rel)
    const fileName = rel.split('/').pop()
    const brand = brandFromFilename(fileName)
    if (!brand || !WATCH_BRANDS.includes(brand)) continue
    out.push({
      brand,
      fileName,
      relPath: rel,
      url: `${CDN}/${rel}`,
      ...parseCatalogDate(fileName),
    })
  }
  return out.sort((a, b) => a.brand.localeCompare(b.brand) || a.fileName.localeCompare(b.fileName))
}

function loadState() {
  if (!fs.existsSync(STATE_PATH)) return { known: {} }
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'))
  } catch {
    return { known: {} }
  }
}

async function fetchPage() {
  const res = await fetch(PAGE_URL, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'GREEN-catalog-check/1.0',
    },
  })
  if (!res.ok) throw new Error(`Fritz página HTTP ${res.status}`)
  return res.text()
}

async function main() {
  const { writeState, json } = parseArgs()
  const html = await fetchPage()
  const catalogs = extractPdfsFromHtml(html)
  const state = loadState()
  const known = state.known && typeof state.known === 'object' ? state.known : {}

  const nuevo = []
  const conocido = []

  for (const cat of catalogs) {
    const prev = known[cat.url]
    if (prev === cat.fileName) {
      conocido.push(cat)
    } else if (prev && prev !== cat.fileName) {
      nuevo.push({ ...cat, reason: 'reemplazo', previousFile: prev })
    } else if (!prev) {
      nuevo.push({ ...cat, reason: known && Object.keys(known).length ? 'nuevo' : 'primera_ejecucion' })
    }
  }

  const report = {
    checkedAt: new Date().toISOString(),
    page: PAGE_URL,
    watchedBrands: WATCH_BRANDS,
    totalOnPage: catalogs.length,
    nuevo,
    conocido,
    byBrand: Object.fromEntries(
      WATCH_BRANDS.map((b) => [b, catalogs.filter((c) => c.brand === b)]),
    ),
  }

  if (json) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log(`Fritz catálogos — ${report.checkedAt.slice(0, 10)} ${report.checkedAt.slice(11, 19)}`)
    console.log(`Página: ${PAGE_URL}`)
    console.log(`PDFs vigilados en CDN: ${catalogs.length}`)
    for (const b of WATCH_BRANDS) {
      const list = report.byBrand[b] || []
      console.log(`\n## ${b} (${list.length})`)
      for (const c of list) {
        const tag = nuevo.some((n) => n.url === c.url) ? '🆕' : '  '
        console.log(`${tag} ${c.fileName}`)
        console.log(`     fecha: ${c.label} · ${c.url}`)
      }
      if (!list.length) console.log('   (ninguno en la página)')
    }
    console.log('\n--- Resumen ---')
    if (!Object.keys(known).length) {
      console.log('Primera corrida: guarda estado con --write-state para detectar cambios mañana.')
    }
    const realNew = nuevo.filter((n) => n.reason !== 'primera_ejecucion')
    console.log('nuevos o reemplazados:', realNew.length || (nuevo.length ? `${nuevo.length} (baseline)` : 0))
    if (realNew.length) {
      for (const n of realNew) {
        console.log(`→ ${n.brand}: ${n.fileName} (${n.reason})`)
      }
      console.log('\nImportar ejemplo:')
      console.log('  npm run import:catalog -- --brand Adidas --file "C:/ruta/descarga.pdf"')
    }
  }

  if (writeState) {
    const nextKnown = { ...known }
    for (const cat of catalogs) {
      nextKnown[cat.url] = cat.fileName
    }
    writeAtomic(
      STATE_PATH,
      JSON.stringify(
        { lastCheck: report.checkedAt, known: nextKnown },
        null,
        2,
      ),
    )
    if (!json) console.log(`\nEstado guardado en scripts/fritz-catalog-state.json`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})