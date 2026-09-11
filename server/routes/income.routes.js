import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', (req, res) => {
  const { month } = req.query
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Geçerli bir ay girin (YYYY-MM).' })
  }

  const row = db
    .prepare('SELECT month, amount FROM monthly_income WHERE user_id = ? AND month = ?')
    .get(req.user.sub, month)

  res.json({ income: row ?? { month, amount: 0 } })
})

router.put('/', (req, res) => {
  const { month, amount } = req.body ?? {}

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Geçerli bir ay girin (YYYY-MM).' })
  }
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    return res.status(400).json({ error: 'Geçerli bir tutar girin.' })
  }

  db.prepare(
    `INSERT INTO monthly_income (user_id, month, amount) VALUES (?, ?, ?)
     ON CONFLICT(user_id, month) DO UPDATE SET amount = excluded.amount`,
  ).run(req.user.sub, month, numericAmount)

  res.json({ income: { month, amount: numericAmount } })
})

export default router
