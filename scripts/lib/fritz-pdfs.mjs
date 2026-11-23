export const FRITZ_PAGE_URL = 'https://www.fritzsportcatalogo.pe/pdf'
export const FRITZ_CDN = 'https://cdn.fritzsport.pe/productos'
export const WATCH_BRANDS = ['Adidas', 'Nike', 'RS21', 'Reebok']

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

/** Adidas línea + liquidación → marca Adidas para import. */
export function brandFromFilename(fileName) {
  const u = fileName.toUpperCase()
  if (u.includes('CATALOGO_ADIDAS') || u.includes('_ADIDAS_')) return 'Adidas'
  if (u.includes('CATALOGO_NIKE') || u.includes('_NIKE_')) return 'Nike'
  if (u.includes('RS_21') || u.includes('RS21')) return 'RS21'
  if (u.includes('REEBOK')) return 'Reebok'
  return null
}

export function parseCatalogDate(fileName) {
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

export function extractPdfsFromHtml(html) {
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
      url: `${FRITZ_CDN}/${rel}`,
      ...parseCatalogDate(fileName),
    })
  }
  return out.sort((a, b) => a.brand.localeCompare(b.brand) || a.fileName.localeCompare(b.fileName))
}

export async function fetchFritzPage() {
  const res = await fetch(FRITZ_PAGE_URL, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'GREEN-catalog-check/1.0',
    },
  })
  if (!res.ok) throw new Error(`Fritz página HTTP ${res.status}`)
  return res.text()
}

export async function listFritzCatalogs() {
  const html = await fetchFritzPage()
  return extractPdfsFromHtml(html)
}
