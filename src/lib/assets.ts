/** Prefijo correcto para assets públicos (local y GitHub Pages). */
export function asset(path: string): string {
  const normalized = path.replace(/^\/+/, '')
  return `${import.meta.env.BASE_URL}${normalized}`
}
