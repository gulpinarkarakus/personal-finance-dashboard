import { CATEGORY_EMOJI } from '../../constants/categories.js'
import { deleteExpense, receiptUrl } from '../../api/expenses.js'
import { formatCurrency } from '../../utils/format.js'

export default function ExpenseList({ expenses, onChanged }) {
  const handleDelete = async (id) => {
    await deleteExpense(id)
    onChanged()
  }

  return (
    <div className="panel">
      <h2 className="panel-title">🧾 Harcamalar</h2>

      {expenses.length === 0 ? (
        <p className="empty-state">Bu ay için henüz harcama girilmedi.</p>
      ) : (
        <ul className="expense-list">
          {expenses.map((expense) => (
            <li key={expense.id} className="expense-list-row">
              <span className="expense-list-emoji" aria-hidden="true">
                {CATEGORY_EMOJI[expense.category] ?? '📦'}
              </span>
              <div className="expense-list-info">
                <span className="expense-list-category">{expense.category}</span>
                {expense.description && (
                  <span className="expense-list-description">{expense.description}</span>
                )}
              </div>
              <span className="expense-list-date">{expense.expense_date}</span>
              {expense.receipt_path && (
                <a
                  className="auth-link"
                  href={receiptUrl(expense.id)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Fiş
                </a>
              )}
              <span className="expense-list-amount">{formatCurrency(expense.amount)}</span>
              <button
                type="button"
                className="expense-delete"
                onClick={() => handleDelete(expense.id)}
                aria-label="Harcamayı sil"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
