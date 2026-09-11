import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes.js'
import expenseRoutes from './routes/expenses.routes.js'
import incomeRoutes from './routes/income.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import budgetRoutes from './routes/budgets.routes.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/income', incomeRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/budgets', budgetRoutes)

app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT} adresinde çalışıyor`)
})
