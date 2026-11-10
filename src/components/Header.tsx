import { asset } from '../lib/assets'

interface HeaderProps {
  onCatalogClick: () => void
}

export function Header({ onCatalogClick }: HeaderProps) {
  return (
    <header className="site-header">
      <a href="#top" className="brand-mark" aria-label="GREEN inicio">
        <img src={asset('images/logo-green.png')} alt="GREEN" className="brand-logo" />
      </a>

      <nav className="site-nav" aria-label="Principal">
        <button type="button" className="nav-link" onClick={onCatalogClick}>
          Catálogo
        </button>
        <a className="nav-link" href="#marcas">
          Marcas
        </a>
        <a className="nav-link" href="#contacto">
          Contacto
        </a>
      </nav>
    </header>
  )
}
