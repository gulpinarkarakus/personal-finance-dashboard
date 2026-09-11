import { apiRequest } from './client.js'

export function fetchIncome(month) {
  return apiRequest(`/api/income?month=${month}`)
}

export function saveIncome({ month, amount }) {
  return apiRequest('/api/income', {
    method: 'PUT',
    body: JSON.stringify({ month, amount }),
  })
}
