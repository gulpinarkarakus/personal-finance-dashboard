export const CATEGORIES = [
  { name: 'Yeme & İçme', emoji: '🍔' },
  { name: 'Market', emoji: '🛒' },
  { name: 'Ulaşım', emoji: '🚗' },
  { name: 'Kira / Ev', emoji: '🏠' },
  { name: 'Faturalar', emoji: '💡' },
  { name: 'Alışveriş', emoji: '🛍️' },
  { name: 'Eğlence', emoji: '🎮' },
  { name: 'Sağlık', emoji: '💊' },
  { name: 'Eğitim', emoji: '🎓' },
  { name: 'Tatil', emoji: '✈️' },
  { name: 'Abonelikler', emoji: '📱' },
  { name: 'Diğer', emoji: '📦' },
]

export const CATEGORY_EMOJI = Object.fromEntries(
  CATEGORIES.map(({ name, emoji }) => [name, emoji]),
)

export const CHART_COLORS = {
  'Yeme & İçme': '#a5c4e9',
  Market: '#e9bca5',
  Ulaşım: '#a5e9cf',
  'Kira / Ev': '#e9d2a5',
  Faturalar: '#e9a5bc',
  Alışveriş: '#a5e9a5',
  Eğlence: '#b9a5e9',
  Sağlık: '#e9a9a5',
  Eğitim: '#a5dee9',
  Tatil: '#c5a187',
  Abonelikler: '#e3e9a5',
  Diğer: '#b8b8b8',
}
