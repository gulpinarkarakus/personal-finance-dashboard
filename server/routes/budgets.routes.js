import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../auth.js'
import { isValidCategory } from '../categories.js'

const router = Router()
router.use(requireAuth)

router.put('/', (req, res) => {
  const { month, category, amount } = req.body ?? {}

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Geçerli bir ay girin (YYYY-MM).' })
  }
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Geçerli bir kategori seçin.' })
  }
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    return res.status(400).json({ error: 'Geçerli bir tutar girin.' })
  }

  db.prepare(
    `INSERT INTO category_budgets (user_id, month, category, amount) VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, month, category) DO UPDATE SET amount = excluded.amount`,
  ).run(req.user.sub, month, category, numericAmount)

  res.json({ budget: { month, category, amount: numericAmount } })
})

router.delete('/:category', (req, res) => {
  const { month } = req.query
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Geçerli bir ay girin (YYYY-MM).' })
  }

  db.prepare('DELETE FROM category_budgets WHERE user_id = ? AND month = ? AND category = ?').run(
    req.user.sub,
    month,
    req.params.category,
  )

  res.status(204).end()
})

export default router
