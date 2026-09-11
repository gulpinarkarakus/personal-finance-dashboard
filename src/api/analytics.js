import { apiRequest } from './client.js'

export function fetchSummary(month) {
  return apiRequest(`/api/analytics/summary?month=${month}`)
}

export function fetchTrend(months = 6) {
  return apiRequest(`/api/analytics/trend?months=${months}`)
}
