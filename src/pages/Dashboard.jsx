import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchExpenses } from '../api/expenses.js'
import { fetchSummary, fetchTrend } from '../api/analytics.js'
import BudgetPanel from '../components/dashboard/BudgetPanel.jsx'
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown.jsx'
import ExpenseForm from '../components/dashboard/ExpenseForm.jsx'
import ExpenseList from '../components/dashboard/ExpenseList.jsx'
import IncomeEditor from '../components/dashboard/IncomeEditor.jsx'
import MonthlyTrendChart from '../components/dashboard/MonthlyTrendChart.jsx'
import SpendingTimeline from '../components/dashboard/SpendingTimeline.jsx'
import StatTile from '../components/dashboard/StatTile.jsx'
import { currentMonth, formatCurrency, formatPercent, monthLabel } from '../utils/format.js'
import './dashboard.css'

function shiftMonth(month, delta) {
  const [year, monthIndex] = month.split('-').map(Number)
  const date = new Date(year, monthIndex - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [month, setMonth] = useState(currentMonth())
  const [summary, setSummary] = useState(null)
  const [trend, setTrend] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [summaryData, expensesData, trendData] = await Promise.all([
      fetchSummary(month),
      fetchExpenses(month),
      fetchTrend(6),
    ])
    setSummary(summaryData)
    setExpenses(expensesData.expenses)
    setTrend(trendData.trend)
    setLoading(false)
  }, [month])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Merhaba, {user?.name}</h1>
          <p className="dashboard-subtitle">Finansına genel bir bakış</p>
        </div>
        <button type="button" className="logout-button" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </header>

      <div className="month-switcher">
        <button type="button" onClick={() => setMonth((m) => shiftMonth(m, -1))} aria-label="Önceki ay">
          ‹
        </button>
        <span>{monthLabel(month)}</span>
        <button type="button" onClick={() => setMonth((m) => shiftMonth(m, 1))} aria-label="Sonraki ay">
          ›
        </button>
      </div>

      {!loading && summary && trend && (
        <>
          <div className="stat-row">
            <IncomeEditor month={month} income={summary.income} onSaved={loadData} />
            <StatTile label="Aylık Gider" value={formatCurrency(summary.totalSpent)} />
            <StatTile
              label="Birikim"
              value={formatCurrency(summary.remaining)}
              tone={summary.remaining < 0 ? 'negative' : 'positive'}
            />
            <StatTile label="Tasarruf Oranı" value={formatPercent(summary.savingsRate)} />
          </div>

          <MonthlyTrendChart trend={trend} />

          <ExpenseForm onCreated={loadData} />

          <div className="dashboard-grid">
            <CategoryBreakdown
              byCategory={summary.byCategory}
              topCategories={summary.topCategories}
              totalSpent={summary.totalSpent}
            />
            <SpendingTimeline
              timeline={summary.timeline}
              peakDay={summary.peakDay}
              peakWeek={summary.peakWeek}
            />
          </div>

          <BudgetPanel month={month} budgets={summary.budgets} onSaved={loadData} />

          <ExpenseList expenses={expenses} onChanged={loadData} />
        </>
      )}
    </div>
  )
}
