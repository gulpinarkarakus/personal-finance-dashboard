import { useState } from 'react'
import { formatCurrency, formatDateRange, formatDayLabel } from '../../utils/format.js'

const BAR_WIDTH = 14
const BAR_GAP = 6
const CHART_HEIGHT = 140
const ACCENT = '#2a78d6'
const MUTED = '#c3c2b7'

export default function SpendingTimeline({ timeline, peakDay, peakWeek }) {
  const [hovered, setHovered] = useState(null)
  const maxValue = Math.max(...timeline.map((entry) => entry.amount), 0)

  if (maxValue === 0) {
    return (
      <div className="panel">
        <h2 className="panel-title">📅 Zaman İçinde Harcama</h2>
        <p className="empty-state">Bu ay için henüz harcama girilmedi.</p>
      </div>
    )
  }

  const step = BAR_WIDTH + BAR_GAP
  const chartWidth = timeline.length * step

  return (
    <div className="panel">
      <h2 className="panel-title">📅 Zaman İçinde Harcama</h2>

      {peakWeek && (
        <p className="timeline-callout">
          En çok harcama <strong>{formatDateRange(peakWeek.startDate, peakWeek.endDate)}</strong>{' '}
          arasında yapıldı: <strong>{formatCurrency(peakWeek.amount)}</strong>
        </p>
      )}

      <div className="timeline-scroll">
        <svg
          width={chartWidth}
          height={CHART_HEIGHT + 24}
          role="img"
          aria-label="Günlük harcama grafiği"
        >
          {timeline.map((entry, index) => {
            const barHeight = maxValue > 0 ? (entry.amount / maxValue) * CHART_HEIGHT : 0
            const isPeak = peakDay && entry.date === peakDay.date
            const x = index * step
            const y = CHART_HEIGHT - barHeight

            return (
              <g key={entry.date}>
                <rect
                  x={x}
                  y={CHART_HEIGHT - 2}
                  width={BAR_WIDTH}
                  height={2}
                  rx={0}
                  fill="transparent"
                />
                <rect
                  x={x}
                  y={y}
                  width={BAR_WIDTH}
                  height={Math.max(barHeight, 2)}
                  rx={4}
                  fill={isPeak ? ACCENT : MUTED}
                  opacity={hovered === index || hovered === null ? 1 : 0.55}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                />
                <text
                  x={x + BAR_WIDTH / 2}
                  y={CHART_HEIGHT + 16}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#898781"
                >
                  {index % 5 === 0 ? formatDayLabel(entry.date).split('.')[0] : ''}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {hovered !== null && (
        <div className="timeline-tooltip">
          <strong>{formatCurrency(timeline[hovered].amount)}</strong>
          <span>{formatDayLabel(timeline[hovered].date)}</span>
        </div>
      )}
    </div>
  )
}
