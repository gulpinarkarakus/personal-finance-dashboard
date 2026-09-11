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

export const CHART_FOLD_LABEL = 'Diğer'

export const CHART_PRIMARY_CATEGORIES = [
  'Yeme & İçme',
  'Market',
  'Ulaşım',
  'Kira / Ev',
  'Faturalar',
  'Alışveriş',
  'Eğlence',
]

export function isValidCategory(value) {
  return CATEGORIES.includes(value)
}
