import { useState } from 'react'
import { CATEGORIES, CATEGORY_EMOJI } from '../../constants/categories.js'
import { saveBudget } from '../../api/budgets.js'
import { formatCurrency, formatPercent } from '../../utils/format.js'

function progressColor(percent) {
  if (percent > 100) return '#d03b3b'
  if (percent >= 80) return '#fab219'
  return '#2a78d6'
}

export default function BudgetPanel({ month, budgets, onSaved }) {
  const [category, setCategory] = useState(CATEGORIES[0].name)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Geçerli bir tutar girin.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      await saveBudget({ month, category, amount: numericAmount })
      setAmount('')
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="panel">
      <h2 className="panel-title">Bütçe</h2>

      {budgets.length === 0 ? (
        <p className="empty-state">Henüz bir kategori bütçesi belirlemedin.</p>
      ) : (
        <ul className="budget-list">
          {budgets.map((budget) => {
            const percent = Math.min(budget.percent, 100)
            const color = progressColor(budget.percent)

            return (
              <li key={budget.category} className="budget-row">
                <div className="budget-row-header">
                  <span>
                    {CATEGORY_EMOJI[budget.category] ?? '📦'} {budget.category} bütçen:{' '}
                    {formatCurrency(budget.budget)}
                  </span>
                  <span>Harcanan: {formatCurrency(budget.spent)}</span>
                </div>
                <div className="budget-progress-track">
                  <div
                    className="budget-progress-fill"
                    style={{ width: `${percent}%`, background: color }}
                  />
                </div>
                {budget.exceeded ? (
                  <p className="budget-warning">
                    ⚠️ {budget.category} bütçeni {formatCurrency(Math.abs(budget.remaining))} aştın.
                  </p>
                ) : (
                  <p className="budget-remaining">
                    Kalan: {formatCurrency(budget.remaining)} ({formatPercent(budget.percent)} kullanıldı)
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <form className="budget-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="budget-category">Kategori</label>
          <select
            id="budget-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-field">
          <label htmlFor="budget-amount">Aylık Bütçe (₺)</label>
          <input
            id="budget-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? 'Kaydediliyor...' : 'Bütçeyi Kaydet'}
        </button>
      </form>
    </div>
  )
}
