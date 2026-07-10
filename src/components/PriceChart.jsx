import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import styles from './PriceChart.module.css'

const RANGES = [
  { label: '1M', days: 22 },
  { label: '3M', days: 44 },
  { label: '6M', days: 62 },
  { label: 'All', days: Infinity },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipDate}>{label}</p>
        <p className={styles.tooltipPrice}>
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    )
  }
  return null
}

export default function PriceChart({ history, isPositive }) {
  const [activeRange, setActiveRange] = useState('All')

  const range = RANGES.find((r) => r.label === activeRange)
  const data = range.days === Infinity
    ? history
    : history.slice(-range.days)

  const minPrice = Math.min(...data.map((d) => d.close))
  const maxPrice = Math.max(...data.map((d) => d.close))
  const padding = (maxPrice - minPrice) * 0.1

  const color = isPositive ? '#3fb950' : '#f85149'
  const colorDim = isPositive ? 'rgba(63,185,80,0.08)' : 'rgba(248,81,73,0.08)'

  // Show a subset of X-axis ticks to avoid crowding
  const tickInterval = Math.max(1, Math.floor(data.length / 6))
  const ticks = data
    .filter((_, i) => i % tickInterval === 0 || i === data.length - 1)
    .map((d) => d.date)

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Price History</h2>
        <div className={styles.rangeButtons}>
          {RANGES.map((r) => (
            <button
              key={r.label}
              className={`${styles.rangeBtn} ${activeRange === r.label ? styles.active : ''}`}
              onClick={() => setActiveRange(r.label)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tick={{ fill: '#8b949e', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[minPrice - padding, maxPrice + padding]}
              tick={{ fill: '#8b949e', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke={color}
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: 'var(--bg-card)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
