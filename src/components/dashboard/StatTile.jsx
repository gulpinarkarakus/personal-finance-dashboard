export default function StatTile({ icon, label, value, tone }) {
  return (
    <div className={`stat-tile${tone ? ` stat-tile--${tone}` : ''}`}>
      <span className="stat-tile-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="stat-tile-label">{label}</span>
      <span className="stat-tile-value">{value}</span>
    </div>
  )
}
