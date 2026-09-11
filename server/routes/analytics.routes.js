import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../auth.js'
import { CATEGORIES } from '../categories.js'

const router = Router()
router.use(requireAuth)

router.get('/summary', (req, res) => {
  const { month } = req.query
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Geçerli bir ay girin (YYYY-MM).' })
  }

  const incomeRow = db
    .prepare('SELECT amount FROM monthly_income WHERE user_id = ? AND month = ?')
    .get(req.user.sub, month)
  const income = incomeRow?.amount ?? 0

  const expenseRows = db
    .prepare('SELECT amount, category, expense_date FROM expenses WHERE user_id = ? AND expense_date LIKE ?')
    .all(req.user.sub, `${month}%`)

  const totalSpent = expenseRows.reduce((sum, row) => sum + row.amount, 0)
  const remaining = income - totalSpent

  const realTotals = new Map(CATEGORIES.map((category) => [category, 0]))
  for (const row of expenseRows) {
    realTotals.set(row.category, (realTotals.get(row.category) ?? 0) + row.amount)
  }

  const byCategory = [...realTotals.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      percentOfIncome: income > 0 ? (amount / income) * 100 : 0,
      percentOfTotal: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
    }))
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const topCategories = [...realTotals.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      percentOfIncome: income > 0 ? (amount / income) * 100 : 0,
    }))
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)

  const budgetRows = db
    .prepare('SELECT category, amount FROM category_budgets WHERE user_id = ? AND month = ?')
    .all(req.user.sub, month)
  const budgetMap = new Map(budgetRows.map((row) => [row.category, row.amount]))

  const budgets = CATEGORIES.map((category) => {
    const budget = budgetMap.get(category) ?? 0
    const spent = realTotals.get(category) ?? 0
    return {
      category,
      budget,
      spent,
      remaining: budget - spent,
      percent: budget > 0 ? (spent / budget) * 100 : 0,
      exceeded: budget > 0 && spent > budget,
    }
  }).filter((entry) => entry.budget > 0)

  const [year, monthIndex] = month.split('-').map(Number)
  const daysInMonth = new Date(year, monthIndex, 0).getDate()

  const dailyTotals = new Map()
  for (const row of expenseRows) {
    dailyTotals.set(row.expense_date, (dailyTotals.get(row.expense_date) ?? 0) + row.amount)
  }

  const timeline = Array.from({ length: daysInMonth }, (_, index) => {
    const day = String(index + 1).padStart(2, '0')
    const date = `${month}-${day}`
    return { date, amount: dailyTotals.get(date) ?? 0 }
  })

  let peakDay = null
  for (const entry of timeline) {
    if (!peakDay || entry.amount > peakDay.amount) {
      peakDay = entry
    }
  }

  const windowSize = Math.min(7, daysInMonth)
  let peakWeek = null
  for (let i = 0; i <= timeline.length - windowSize; i += 1) {
    const window = timeline.slice(i, i + windowSize)
    const amount = window.reduce((sum, entry) => sum + entry.amount, 0)
    if (!peakWeek || amount > peakWeek.amount) {
      peakWeek = { startDate: window[0].date, endDate: window[window.length - 1].date, amount }
    }
  }

  res.json({
    month,
    income,
    totalSpent,
    remaining,
    savingsRate: income > 0 ? (remaining / income) * 100 : 0,
    byCategory,
    topCategories,
    budgets,
    timeline,
    peakDay: peakDay?.amount > 0 ? peakDay : null,
    peakWeek: peakWeek?.amount > 0 ? peakWeek : null,
  })
})

router.get('/trend', (req, res) => {
  const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24)
  const now = new Date()

  const monthKeys = []
  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthKeys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
  }
  const earliestMonth = monthKeys[0]

  const expenseRows = db
    .prepare('SELECT amount, expense_date FROM expenses WHERE user_id = ? AND expense_date >= ?')
    .all(req.user.sub, `${earliestMonth}-01`)

  const expenseByMonth = new Map()
  for (const row of expenseRows) {
    const key = row.expense_date.slice(0, 7)
    expenseByMonth.set(key, (expenseByMonth.get(key) ?? 0) + row.amount)
  }

  const incomeRows = db
    .prepare('SELECT month, amount FROM monthly_income WHERE user_id = ? AND month >= ?')
    .all(req.user.sub, earliestMonth)
  const incomeByMonth = new Map(incomeRows.map((row) => [row.month, row.amount]))

  const trend = monthKeys.map((month) => ({
    month,
    income: incomeByMonth.get(month) ?? 0,
    expense: expenseByMonth.get(month) ?? 0,
  }))

  res.json({ trend })
})

export default router
