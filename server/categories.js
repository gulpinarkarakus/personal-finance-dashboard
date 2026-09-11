export const CATEGORIES = [
  'Yeme & İçme',
  'Market',
  'Ulaşım',
  'Kira / Ev',
  'Faturalar',
  'Alışveriş',
  'Eğlence',
  'Sağlık',
  'Eğitim',
  'Tatil',
  'Abonelikler',
  'Diğer',
]

export function isValidCategory(value) {
  return CATEGORIES.includes(value)
}
