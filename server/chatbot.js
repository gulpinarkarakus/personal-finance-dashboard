import db from './db.js'

const currency = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
})

function formatTRY(amount) {
  return currency.format(amount || 0)
}

function normalize(text) {
  return text.toLocaleLowerCase('tr-TR')
}

const MONTH_NAMES = [
  'ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran',
  'temmuz', 'ağustos', 'eylül', 'ekim', 'kasım', 'aralık',
]

const CATEGORY_KEYWORDS = {
  'Yeme & İçme': ['yemek', 'yeme', 'içme', 'icme', 'restoran', 'kahve'],
  Market: ['market', 'manav', 'bakkal'],
  Ulaşım: ['ulaşım', 'ulasim', 'benzin', 'taksi', 'otobüs', 'otobus', 'yakıt'],
  'Kira / Ev': ['kira', 'ev'],
  Faturalar: ['fatura', 'faturalar', 'elektrik', 'doğalgaz', 'dogalgaz', 'internet'],
  Alışveriş: ['alışveriş', 'alisveris', 'giyim', 'kıyafet', 'kiyafet'],
  Eğlence: ['eğlence', 'eglence', 'sinema', 'oyun'],
  Sağlık: ['sağlık', 'saglik', 'doktor', 'ilaç', 'ilac'],
  Eğitim: ['eğitim', 'egitim', 'kurs', 'okul'],
  Tatil: ['tatil', 'seyahat', 'uçak', 'ucak', 'otel'],
  Abonelikler: ['abonelik', 'abonelikler', 'netflix', 'spotify'],
  Diğer: ['diğer', 'diger'],
}

function currentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function shiftMonthKey(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function resolveMonth(text) {
  if (/\bgeçen ay\b|\bönceki ay\b|\bgecen ay\b/.test(text)) {
    return { month: shiftMonthKey(currentMonthKey(), -1), label: 'geçen ay' }
  }

  const monthIndex = MONTH_NAMES.findIndex((name) => text.includes(name))
  if (monthIndex !== -1) {
    const now = new Date()
    let year = now.getFullYear()
    if (monthIndex > now.getMonth()) {
      year -= 1
    }
    const month = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
    return { month, label: `${MONTH_NAMES[monthIndex]} ayında` }
  }

  return { month: currentMonthKey(), label: 'bu ay' }
}

function resolveCategory(text) {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category
    }
  }
  return null
}

function getIncome(userId, month) {
  const row = db
    .prepare('SELECT amount FROM monthly_income WHERE user_id = ? AND month = ?')
    .get(userId, month)
  return row?.amount ?? 0
}

function getExpenseRows(userId, month) {
  return db
    .prepare('SELECT amount, category, expense_date FROM expenses WHERE user_id = ? AND expense_date LIKE ?')
    .all(userId, `${month}%`)
}

function getBudgets(userId, month) {
  return db
    .prepare('SELECT category, amount FROM category_budgets WHERE user_id = ? AND month = ?')
    .all(userId, month)
}

function handleGreeting() {
  return 'Merhaba! Sana harcamaların, gelirin ve bütçen hakkında yardımcı olabilirim. Örneğin "bu ay ne kadar harcadım?" veya "yemek bütçemi aştım mı?" diye sorabilirsin.'
}

function handleHelp() {
  return [
    'Şunları sorabilirsin:',
    '• "Bu ay ne kadar harcadım?"',
    '• "Geçen ay markete ne kadar harcadım?"',
    '• "Gelirim ne kadar?"',
    '• "Tasarruf oranım nedir?"',
    '• "Bütçemi aştığım kategoriler var mı?"',
    '• "En çok nereye harcıyorum?"',
    '• "Bu hafta ne kadar harcadım?"',
  ].join('\n')
}

function handleTotalSpending(userId, text) {
  const { month, label } = resolveMonth(text)
  const rows = getExpenseRows(userId, month)
  const total = rows.reduce((sum, row) => sum + row.amount, 0)

  if (rows.length === 0) {
    return `${label.charAt(0).toUpperCase() + label.slice(1)} için henüz hiç harcama girmemişsin.`
  }
  return `${label.charAt(0).toUpperCase() + label.slice(1)} toplam ${formatTRY(total)} harcamışsın (${rows.length} işlem).`
}

function handleCategorySpending(userId, text, category) {
  const { month, label } = resolveMonth(text)
  const rows = getExpenseRows(userId, month).filter((row) => row.category === category)
  const total = rows.reduce((sum, row) => sum + row.amount, 0)

  if (rows.length === 0) {
    return `${label.charAt(0).toUpperCase() + label.slice(1)} "${category}" kategorisinde hiç harcaman yok.`
  }
  return `${label.charAt(0).toUpperCase() + label.slice(1)} "${category}" kategorisinde ${formatTRY(total)} harcamışsın (${rows.length} işlem).`
}

function handleIncome(userId, text) {
  const { month, label } = resolveMonth(text)
  const income = getIncome(userId, month)

  if (income === 0) {
    return `${label.charAt(0).toUpperCase() + label.slice(1)} için henüz bir gelir girmemişsin.`
  }
  return `${label.charAt(0).toUpperCase() + label.slice(1)} gelirin ${formatTRY(income)}.`
}

function handleSavings(userId, text) {
  const { month, label } = resolveMonth(text)
  const income = getIncome(userId, month)
  const rows = getExpenseRows(userId, month)
  const totalSpent = rows.reduce((sum, row) => sum + row.amount, 0)
  const remaining = income - totalSpent

  if (income === 0) {
    return 'Tasarruf oranını hesaplayabilmem için önce aylık gelirini girmen gerekiyor.'
  }

  const rate = (remaining / income) * 100
  const verb = remaining >= 0 ? 'biriktirdin' : 'açık verdin'
  return `${label.charAt(0).toUpperCase() + label.slice(1)} gelirinin %${rate.toFixed(1)}'ini ${verb} (${formatTRY(Math.abs(remaining))}).`
}

function handleBudgetStatus(userId, text) {
  const { month, label } = resolveMonth(text)
  const budgets = getBudgets(userId, month)

  if (budgets.length === 0) {
    return `${label.charAt(0).toUpperCase() + label.slice(1)} için henüz bir bütçe belirlememişsin.`
  }

  const rows = getExpenseRows(userId, month)
  const spentByCategory = new Map()
  for (const row of rows) {
    spentByCategory.set(row.category, (spentByCategory.get(row.category) ?? 0) + row.amount)
  }

  const exceeded = []
  const onTrack = []
  for (const budget of budgets) {
    const spent = spentByCategory.get(budget.category) ?? 0
    if (spent > budget.amount) {
      exceeded.push(`${budget.category} (${formatTRY(spent)} / ${formatTRY(budget.amount)})`)
    } else {
      onTrack.push(`${budget.category} (${formatTRY(spent)} / ${formatTRY(budget.amount)})`)
    }
  }

  if (exceeded.length === 0) {
    return `Harika! ${label.charAt(0).toUpperCase() + label.slice(1)} hiçbir bütçeni aşmamışsın. ✅`
  }

  let reply = `⚠️ ${label.charAt(0).toUpperCase() + label.slice(1)} şu bütçeleri aştın: ${exceeded.join(', ')}.`
  if (onTrack.length > 0) {
    reply += ` Yolunda gidenler: ${onTrack.join(', ')}.`
  }
  return reply
}

function handleTopCategory(userId, text) {
  const { month, label } = resolveMonth(text)
  const rows = getExpenseRows(userId, month)

  if (rows.length === 0) {
    return `${label.charAt(0).toUpperCase() + label.slice(1)} için henüz hiç harcama girmemişsin.`
  }

  const totals = new Map()
  for (const row of rows) {
    totals.set(row.category, (totals.get(row.category) ?? 0) + row.amount)
  }
  const [topCategory, topAmount] = [...totals.entries()].sort((a, b) => b[1] - a[1])[0]

  return `${label.charAt(0).toUpperCase() + label.slice(1)} en çok "${topCategory}" kategorisine harcamışsın: ${formatTRY(topAmount)}.`
}

function handleWeekSpending(userId) {
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(now.getDate() - 6)

  const toISO = (date) => date.toISOString().slice(0, 10)
  const rows = db
    .prepare('SELECT amount FROM expenses WHERE user_id = ? AND expense_date BETWEEN ? AND ?')
    .all(userId, toISO(weekAgo), toISO(now))

  const total = rows.reduce((sum, row) => sum + row.amount, 0)
  if (rows.length === 0) {
    return 'Son 7 günde hiç harcama girmemişsin.'
  }
  return `Son 7 günde toplam ${formatTRY(total)} harcamışsın (${rows.length} işlem).`
}

export function getChatReply(userId, message) {
  const text = normalize(message || '')

  if (!text.trim()) {
    return handleHelp()
  }
  if (/\b(merhaba|selam|iyi günler|naber)\b/.test(text)) {
    return handleGreeting()
  }
  if (/\byardım\b|\bne sorabilirim\b|\bnasıl kullan/.test(text)) {
    return handleHelp()
  }
  if (/\bbu hafta\b|\bson 7 gün\b|\bgeçen hafta\b/.test(text)) {
    return handleWeekSpending(userId)
  }
  if (/bütçe/.test(text) && (/aş/.test(text) || /durum/.test(text) || /nas/.test(text))) {
    return handleBudgetStatus(userId, text)
  }
  if (/gelir|maaş/.test(text) && !/harca/.test(text)) {
    return handleIncome(userId, text)
  }
  if (/tasarruf|birikim|biriktir/.test(text)) {
    return handleSavings(userId, text)
  }
  if (/en çok|en fazla/.test(text) && (/harca|kategori|nereye/.test(text))) {
    return handleTopCategory(userId, text)
  }

  const category = resolveCategory(text)
  if (category && /harca/.test(text)) {
    return handleCategorySpending(userId, text, category)
  }
  if (/harca|gider|masraf/.test(text)) {
    return handleTotalSpending(userId, text)
  }

  return `Bunu tam anlayamadım. ${handleHelp()}`
}
