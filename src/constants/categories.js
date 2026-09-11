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

// Chart-only palette: 7 dedicated hues + one neutral "Diğer" rollup bucket
// (the backend folds low-volume categories into "Diğer" for chart aggregation
// so no chart ever exceeds the validated 8-color categorical palette).
export const CHART_COLORS = {
  'Yeme & İçme': '#2a78d6',
  Market: '#eb6834',
  Ulaşım: '#1baf7a',
  'Kira / Ev': '#eda100',
  Faturalar: '#e87ba4',
  Alışveriş: '#008300',
  Eğlence: '#4a3aa7',
  Diğer: '#898781',
}
