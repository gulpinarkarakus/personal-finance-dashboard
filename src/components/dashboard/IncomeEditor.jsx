import { useState } from 'react'
import { saveIncome } from '../../api/income.js'
import { formatCurrency } from '../../utils/format.js'

export default function IncomeEditor({ month, income, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(income || ''))
  const [saving, setSaving] = useState(false)

  const handleSave = async (event) => {
    event.preventDefault()
    const numericValue = Number(value)
    if (!Number.isFinite(numericValue) || numericValue < 0) return

    setSaving(true)
    try {
      await saveIncome({ month, amount: numericValue })
      onSaved()
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="stat-tile">
        <span className="stat-tile-icon" aria-hidden="true">
          💰
        </span>
        <span className="stat-tile-label">Aylık Gelir</span>
        <span className="stat-tile-value">{formatCurrency(income)}</span>
        <button
          type="button"
          className="income-edit-link"
          onClick={() => {
            setValue(String(income || ''))
            setEditing(true)
          }}
        >
          Düzenle
        </button>
      </div>
    )
  }

  return (
    <form className="stat-tile" onSubmit={handleSave}>
      <span className="stat-tile-icon" aria-hidden="true">
        💰
      </span>
      <span className="stat-tile-label">Aylık Gelir</span>
      <input
        type="number"
        step="0.01"
        min="0"
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="income-input"
      />
      <div className="income-edit-actions">
        <button type="submit" className="income-edit-link" disabled={saving}>
          Kaydet
        </button>
        <button type="button" className="income-edit-link" onClick={() => setEditing(false)}>
          Vazgeç
        </button>
      </div>
    </form>
  )
}
