export const WHATSAPP_NUMBER = '51910034199'

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function sizeInquiryMessage(
  code: string,
  brand: string,
  name: string,
  model: string,
  size: number,
): string {
  return [
    '¡Hola GREEN!',
    '',
    'Quiero consultar disponibilidad de esta zapatilla:',
    `• Código: ${code}`,
    `• Marca: ${brand}`,
    `• Modelo: ${name} (${model})`,
    `• Talla EU: ${size}`,
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
