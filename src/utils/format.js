const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
})

export function formatCurrency(amount) {
  return currencyFormatter.format(amount || 0)
}

export function formatPercent(value) {
  return `%${(value || 0).toFixed(1)}`
}

export function formatDayLabel(isoDate) {
  const [, month, day] = isoDate.split('-')
  return `${day}.${month}`
}

export function formatDateRange(startIso, endIso) {
  return `${formatDayLabel(startIso)} - ${formatDayLabel(endIso)}`
}

export function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(monthValue) {
  const [year, month] = monthValue.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  })
}
