import { apiRequest } from './client.js'

export function fetchExpenses(month) {
  return apiRequest(`/api/expenses?month=${month}`)
}

export function createExpense({ amount, category, description, expenseDate, receiptPath }) {
  return apiRequest('/api/expenses', {
    method: 'POST',
    body: JSON.stringify({ amount, category, description, expenseDate, receiptPath }),
  })
}

export function deleteExpense(id) {
  return apiRequest(`/api/expenses/${id}`, { method: 'DELETE' })
}

export function scanReceipt(file) {
  const formData = new FormData()
  formData.append('receipt', file)
  return apiRequest('/api/expenses/scan-receipt', {
    method: 'POST',
    body: formData,
  })
}

export function receiptUrl(id) {
  return `/api/expenses/${id}/receipt`
}
