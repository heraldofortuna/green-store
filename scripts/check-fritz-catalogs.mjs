/**
 * Revisa https://www.fritzsportcatalogo.pe/pdf por PDFs nuevos (Adidas, Nike, RS21, Reebok).
 * Detecta novedad por nombre de archivo en CDN (timestamp + fecha en el nombre).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FRITZ_PAGE_URL,
  WATCH_BRANDS,
  listFritzCatalogs,
} from './lib/fritz-pdfs.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STATE_PATH = path.join(__dirname, 'fritz-catalog-state.json')

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

function loadState() {
  if (!fs.existsSync(STATE_PATH)) return { known: {} }
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'))
  } catch {
    return { known: {} }
  }
}

async function main() {
  const { writeState, json } = parseArgs()
  const catalogs = await listFritzCatalogs()
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
    page: FRITZ_PAGE_URL,
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
    console.log(`Página: ${FRITZ_PAGE_URL}`)
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
      console.log('  npm run import:catalog -- --from-fritz')
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
