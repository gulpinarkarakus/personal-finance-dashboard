import { Router } from 'express'
import multer from 'multer'
import crypto from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import db from '../db.js'
import { requireAuth } from '../auth.js'
import { isValidCategory } from '../categories.js'
import { scanReceipt } from '../ocr.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '..', 'uploads', 'receipts')
fs.mkdirSync(uploadsDir, { recursive: true })

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Sadece görsel dosyaları yüklenebilir.'))
    }
    cb(null, true)
  },
})

const router = Router()
router.use(requireAuth)

router.get('/', (req, res) => {
  const { month, from, to } = req.query

  let rows
  if (month) {
    rows = db
      .prepare(
        `SELECT * FROM expenses WHERE user_id = ? AND expense_date LIKE ? ORDER BY expense_date DESC, id DESC`,
      )
      .all(req.user.sub, `${month}%`)
  } else if (from && to) {
    rows = db
      .prepare(
        `SELECT * FROM expenses WHERE user_id = ? AND expense_date BETWEEN ? AND ? ORDER BY expense_date DESC, id DESC`,
      )
      .all(req.user.sub, from, to)
  } else {
    rows = db
      .prepare(`SELECT * FROM expenses WHERE user_id = ? ORDER BY expense_date DESC, id DESC`)
      .all(req.user.sub)
  }

  res.json({ expenses: rows })
})

router.post('/', (req, res) => {
  const { amount, category, description, expenseDate, receiptPath } = req.body ?? {}

  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Geçerli bir tutar girin.' })
  }
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Geçerli bir kategori seçin.' })
  }
  if (!expenseDate || !/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) {
    return res.status(400).json({ error: 'Geçerli bir tarih girin.' })
  }

  const result = db
    .prepare(
      `INSERT INTO expenses (user_id, amount, category, description, expense_date, receipt_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      req.user.sub,
      numericAmount,
      category,
      description?.trim() || null,
      expenseDate,
      receiptPath || null,
    )

  const expense = db
    .prepare('SELECT * FROM expenses WHERE id = ?')
    .get(Number(result.lastInsertRowid))

  res.status(201).json({ expense })
})

router.delete('/:id', (req, res) => {
  const expense = db
    .prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.sub)

  if (!expense) {
    return res.status(404).json({ error: 'Harcama bulunamadı.' })
  }

  db.prepare('DELETE FROM expenses WHERE id = ?').run(expense.id)

  if (expense.receipt_path) {
    fs.unlink(path.join(uploadsDir, expense.receipt_path), () => {})
  }

  res.status(204).end()
})

router.post('/scan-receipt', upload.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Fiş görseli gerekli.' })
  }

  try {
    const { rawText, amount, date } = await scanReceipt(req.file.buffer)

    const ext = path.extname(req.file.originalname) || '.jpg'
    const filename = `${crypto.randomUUID()}${ext}`
    fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer)

    res.json({
      receiptPath: filename,
      suggested: { amount, date },
      rawText,
    })
  } catch (error) {
    res.status(500).json({ error: 'Fiş okunamadı: ' + error.message })
  }
})

router.get('/:id/receipt', (req, res) => {
  const expense = db
    .prepare('SELECT receipt_path FROM expenses WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.sub)

  if (!expense?.receipt_path) {
    return res.status(404).json({ error: 'Fiş bulunamadı.' })
  }

  res.sendFile(path.join(uploadsDir, expense.receipt_path))
})

export default router
