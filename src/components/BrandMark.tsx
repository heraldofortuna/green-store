import { getBrandInfo } from '../data/brands'
import { asset } from '../lib/assets'

interface BrandMarkProps {
  brand: string
  className?: string
}

export function BrandMark({ brand, className = '' }: BrandMarkProps) {
  const info = getBrandInfo(brand)

  if (info.logo) {
    return (
      <img
        src={asset(info.logo)}
        alt={info.name}
        className={`brand-mark-logo ${className}`.trim()}
      />
    )
  }

  return <span className={`brand-mark-text ${className}`.trim()}>{info.name}</span>
}
