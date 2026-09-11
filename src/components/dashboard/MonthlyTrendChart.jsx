import { useState } from 'react'
import { formatCurrency } from '../../utils/format.js'

const INCOME_COLOR = '#2a78d6'
const EXPENSE_COLOR = '#eb6834'
const BAR_WIDTH = 20
const BAR_GAP = 4
const GROUP_GAP = 28
const CHART_HEIGHT = 160

function monthShortLabel(monthValue) {
  const [year, month] = monthValue.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('tr-TR', { month: 'short' })
}

export default function MonthlyTrendChart({ trend }) {
  const [hovered, setHovered] = useState(null)
  const maxValue = Math.max(...trend.flatMap((entry) => [entry.income, entry.expense]), 1)

  const groupWidth = BAR_WIDTH * 2 + BAR_GAP
  const step = groupWidth + GROUP_GAP
  const chartWidth = trend.length * step

  return (
    <div className="panel">
      <div className="trend-header">
        <h2 className="panel-title">Aylık Gelir / Gider</h2>
        <div className="chart-legend">
          <span className="chart-legend-item">
            <span className="chart-legend-swatch" style={{ background: INCOME_COLOR }} />
            Gelir
          </span>
          <span className="chart-legend-item">
            <span className="chart-legend-swatch" style={{ background: EXPENSE_COLOR }} />
            Gider
          </span>
        </div>
      </div>

      <div className="timeline-scroll">
        <svg width={chartWidth} height={CHART_HEIGHT + 24} role="img" aria-label="Aylık gelir gider grafiği">
          {trend.map((entry, index) => {
            const groupX = index * step
            const incomeHeight = (entry.income / maxValue) * CHART_HEIGHT
            const expenseHeight = (entry.expense / maxValue) * CHART_HEIGHT
            const isHovered = hovered === index

            return (
              <g
                key={entry.month}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
                tabIndex={0}
              >
                <rect
                  x={groupX}
                  y={CHART_HEIGHT - incomeHeight}
                  width={BAR_WIDTH}
                  height={Math.max(incomeHeight, 2)}
                  rx={4}
                  fill={INCOME_COLOR}
                  opacity={hovered === null || isHovered ? 1 : 0.55}
                />
                <rect
                  x={groupX + BAR_WIDTH + BAR_GAP}
                  y={CHART_HEIGHT - expenseHeight}
                  width={BAR_WIDTH}
                  height={Math.max(expenseHeight, 2)}
                  rx={4}
                  fill={EXPENSE_COLOR}
                  opacity={hovered === null || isHovered ? 1 : 0.55}
                />
                <text
                  x={groupX + groupWidth / 2}
                  y={CHART_HEIGHT + 16}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#898781"
                >
                  {monthShortLabel(entry.month)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {hovered !== null && (
        <div className="timeline-tooltip">
          <span>{monthShortLabel(trend[hovered].month)}</span>
          <span>
            Gelir: <strong>{formatCurrency(trend[hovered].income)}</strong>
          </span>
          <span>
            Gider: <strong>{formatCurrency(trend[hovered].expense)}</strong>
          </span>
        </div>
      )}
    </div>
  )
}
