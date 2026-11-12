export const WHATSAPP_NUMBER = '51910034199'

export type PriceType = 'emprendedor' | 'mayorista'

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function sizeInquiryMessage(
  code: string,
  brand: string,
  name: string,
  model: string,
  size: number,
  priceType: PriceType,
  priceAmount: number,
): string {
  const priceLabel =
    priceType === 'mayorista' ? 'Precio mayorista' : 'Precio emprendedor'
  const priceText = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(priceAmount)

  return [
    '¡Hola GREEN!',
    '',
    'Quiero consultar disponibilidad de esta zapatilla:',
    `• Código: ${code}`,
    `• Marca: ${brand}`,
    `• Modelo: ${name} (${model})`,
    `• Talla EU: ${size}`,
    `• ${priceLabel}: ${priceText}`,
    '',
    '¿Me confirmas si hay stock? Gracias.',
  ].join('\n')
}

export const genericInquiryMessage = [
  '¡Hola GREEN!',
  '',
  'Estoy buscando un modelo de zapatilla en particular.',
  '¿Me pueden ayudar a verificar disponibilidad?',
  '',
  'Gracias.',
].join('\n')
