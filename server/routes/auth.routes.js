import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { requireAuth, setAuthCookie, signToken, COOKIE_NAME } from '../auth.js'

const router = Router()

router.post('/register', (req, res) => {
  const { name, email, password } = req.body ?? {}

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Ad, e-posta ve şifre zorunludur.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır.' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail)
  if (existing) {
    return res.status(409).json({ error: 'Bu e-posta ile zaten bir hesap var.' })
  }

  const passwordHash = bcrypt.hashSync(password, 10)
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name.trim(), normalizedEmail, passwordHash)

  const user = {
    id: Number(result.lastInsertRowid),
    name: name.trim(),
    email: normalizedEmail,
  }
  setAuthCookie(res, signToken(user))
  res.status(201).json({ user })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body ?? {}

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'E-posta ve şifre zorunludur.' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const row = db
    .prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?')
    .get(normalizedEmail)

  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: 'E-posta veya şifre hatalı.' })
  }

  const user = { id: row.id, name: row.name, email: row.email }
  setAuthCookie(res, signToken(user))
  res.json({ user })
})

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' })
  res.status(204).end()
})

router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: { id: req.user.sub, name: req.user.name, email: req.user.email },
  })
})

export default router
