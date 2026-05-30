export function BarChart({ data, colorClass = 'bg-blue-500', height = 120 }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div style={{ fontSize:'10px' }} className="text-gray-600">{d.value > 0 ? d.value.toLocaleString() : ''}</div>
          <div
            className={`w-full rounded-t-lg transition-all duration-700 relative group ${colorClass}`}
            style={{ height: `${Math.max(4, (d.value / max) * (height - 30))}px` }}>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10" style={{fontSize:'10px'}}>
              {d.label}: {d.value.toLocaleString()}
            </div>
          </div>
          <div className="text-center text-gray-500 leading-tight" style={{ fontSize:'10px' }}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

export function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) return <div className="text-center text-gray-500 text-xs py-4">لا توجد بيانات</div>

  let offset = 0
  const radius = 45
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 100 100" className="flex-shrink-0">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        {segments.map((seg, i) => {
          const pct = seg.value / total
          const dash = pct * circumference
          const gap = circumference - dash
          const rotation = -90 + (offset / total) * 360
          offset += seg.value
          return (
            <circle key={i} cx="50" cy="50" r={radius} fill="none"
              stroke={seg.color} strokeWidth="10"
              strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${rotation} 50 50)`} />
          )
        })}
        <text x="50" y="55" textAnchor="middle" fill="#e8edf5" fontSize="14" fontWeight="bold">{total}</text>
      </svg>
      <div className="space-y-1.5 flex-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }}></div>
            <span className="text-xs text-gray-400 flex-1">{seg.label}</span>
            <span className="text-xs font-semibold text-gray-300">{seg.value}</span>
            <span className="text-xs text-gray-600">{Math.round((seg.value/total)*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LineChart({ data, height = 100 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data.map(d => d.value), 1)
  const w = 300, h = height
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * (w - 20) + 10,
    y: h - 10 - ((d.value / max) * (h - 20)),
    ...d
  }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${path} L ${points[points.length-1].x} ${h-10} L ${points[0].x} ${h-10} Z`

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e90e0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0e90e0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lg)" />
      <path d={path} fill="none" stroke="#0e90e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#0e90e0" />)}
    </svg>
  )
}
