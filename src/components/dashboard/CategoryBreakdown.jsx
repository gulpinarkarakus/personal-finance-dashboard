import { useState } from 'react'
import { CATEGORY_EMOJI, CHART_COLORS } from '../../constants/categories.js'
import { formatCurrency, formatPercent } from '../../utils/format.js'

const RADIUS = 70
const STROKE = 30
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP_DEGREES = 2.5

export default function CategoryBreakdown({ byCategory, topCategories, totalSpent }) {
  const [hovered, setHovered] = useState(null)

  if (byCategory.length === 0) {
    return (
      <div className="panel">
        <h2 className="panel-title">Bu Ay Harcamalar Nereye Gitti?</h2>
        <p className="empty-state">Bu ay için henüz harcama girilmedi.</p>
      </div>
    )
  }

  const segments = byCategory.reduce((acc, entry) => {
    const fraction = entry.amount / totalSpent
    const sweep = Math.max(fraction * 360 - (byCategory.length > 1 ? GAP_DEGREES : 0), 0)
    const startDegrees = acc.length > 0 ? acc[acc.length - 1].startDegrees + acc[acc.length - 1].fullSweep : 0
    acc.push({ ...entry, startDegrees, sweep, fullSweep: fraction * 360 })
    return acc
  }, [])

  const centerLabel = hovered !== null ? segments[hovered] : null

  return (
    <div className="panel">
      <h2 className="panel-title">Bu Ay Harcamalar Nereye Gitti?</h2>

      {topCategories.length > 0 && (
        <div className="top-categories">
          <h3 className="top-categories-title">En çok harcadığın {topCategories.length} kategori</h3>
          <ol className="top-categories-list">
            {topCategories.map((entry, index) => (
              <li key={entry.category} className="top-categories-row">
                <span className="top-categories-rank">{index + 1}</span>
                <span className="top-categories-emoji" aria-hidden="true">
                  {CATEGORY_EMOJI[entry.category] ?? '📦'}
                </span>
                <span className="top-categories-name">{entry.category}</span>
                <span className="top-categories-amount">{formatCurrency(entry.amount)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="donut-wrapper">
        <svg width={180} height={180} viewBox="0 0 180 180" role="img" aria-label="Kategoriye göre harcama dağılımı">
          <g transform="rotate(-90 90 90)">
            {segments.map((segment, index) => {
              const dash = (segment.sweep / 360) * CIRCUMFERENCE
              const offset = -(segment.startDegrees / 360) * CIRCUMFERENCE
              return (
                <circle
                  key={segment.category}
                  cx={90}
                  cy={90}
                  r={RADIUS}
                  fill="none"
                  stroke={CHART_COLORS[segment.category] ?? '#898781'}
                  strokeWidth={STROKE}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={offset}
                  opacity={hovered === null || hovered === index ? 1 : 0.45}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                />
              )
            })}
          </g>
          <text x="90" y="84" textAnchor="middle" fontSize="11" fill="#898781">
            {centerLabel ? centerLabel.category : 'Toplam'}
          </text>
          <text x="90" y="104" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0b0b0b">
            {formatCurrency(centerLabel ? centerLabel.amount : totalSpent)}
          </text>
        </svg>

        <ul className="category-legend">
          {byCategory.map((entry) => (
            <li key={entry.category} className="category-legend-row">
              <span
                className="category-dot"
                style={{ background: CHART_COLORS[entry.category] ?? '#898781' }}
                aria-hidden="true"
              />
              <span className="category-legend-name">{entry.category}</span>
              <span className="category-legend-amount">{formatCurrency(entry.amount)}</span>
              <span className="category-legend-percent">
                gelirin {formatPercent(entry.percentOfIncome)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
