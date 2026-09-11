import { useState } from 'react'
import { CATEGORIES } from '../../constants/categories.js'
import { createExpense, scanReceipt } from '../../api/expenses.js'

function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

const initialForm = {
  amount: '',
  category: CATEGORIES[0].name,
  description: '',
  expenseDate: today(),
}

export default function ExpenseForm({ onCreated }) {
  const [form, setForm] = useState(initialForm)
  const [receiptPath, setReceiptPath] = useState(null)
  const [receiptName, setReceiptName] = useState('')
  const [scanning, setScanning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setReceiptName(file.name)
    setScanning(true)
    setError('')
    try {
      const { receiptPath: savedPath, suggested } = await scanReceipt(file)
      setReceiptPath(savedPath)
      setForm((prev) => ({
        ...prev,
        amount: prev.amount || (suggested.amount ? String(suggested.amount) : prev.amount),
        expenseDate: suggested.date || prev.expenseDate,
      }))
    } catch (err) {
      setError('Fiş okunamadı, tutarı elle girebilirsin. (' + err.message + ')')
    } finally {
      setScanning(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const numericAmount = Number(form.amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Geçerli bir tutar girin.')
      return
    }

    setSubmitting(true)
    try {
      await createExpense({ ...form, amount: numericAmount, receiptPath })
      setForm(initialForm)
      setReceiptPath(null)
      setReceiptName('')
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="panel expense-form" onSubmit={handleSubmit}>
      <h2 className="panel-title">➕ Harcama Ekle</h2>

      <div className="expense-form-grid">
        <div className="auth-field">
          <label htmlFor="amount">Tutar (₺)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="category">Kategori</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((category) => (
              <option key={category.name} value={category.name}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-field">
          <label htmlFor="expenseDate">Tarih</label>
          <input
            id="expenseDate"
            name="expenseDate"
            type="date"
            value={form.expenseDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="description">Açıklama</label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="Örn. akşam yemeği"
            value={form.description}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="receipt">Fiş görseli (opsiyonel, otomatik okunur)</label>
        <input id="receipt" name="receipt" type="file" accept="image/*" onChange={handleFileChange} />
        {scanning && <span className="receipt-status">Fiş okunuyor...</span>}
        {!scanning && receiptName && <span className="receipt-status">✓ {receiptName} okundu</span>}
      </div>

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" className="auth-submit" disabled={submitting}>
        {submitting ? 'Ekleniyor...' : 'Harcamayı Ekle'}
      </button>
    </form>
  )
}
