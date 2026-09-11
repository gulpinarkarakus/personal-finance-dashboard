import { apiRequest } from './client.js'

export function saveBudget({ month, category, amount }) {
  return apiRequest('/api/budgets', {
    method: 'PUT',
    body: JSON.stringify({ month, category, amount }),
  })
}

export function deleteBudget(category, month) {
  return apiRequest(`/api/budgets/${encodeURIComponent(category)}?month=${month}`, {
    method: 'DELETE',
  })
}
