import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import styles from './VolumeBarChart.module.css'

const fmtVolume = (v) => `${v}M`

const CustomTooltip = ({ active, payload, label, avg20d }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className={styles.tooltipRow}>
          {entry.name}: <strong>{entry.value}M</strong>
        </p>
      ))}
      <p style={{ color: '#3fb950' }} className={styles.tooltipRow}>
        20-Day Avg: <strong>{avg20d}M</strong>
      </p>
    </div>
  )
}

export default function VolumeBarChart({ data }) {
  const avg20d = data[0]?.avg20d ?? 0

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.sectionTitle}>Volume Analysis</h2>
      <p className={styles.subtitle}>Daily Volume vs 20-Day Average (in millions of shares)</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtVolume}
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip avg20d={avg20d} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)', paddingTop: '8px' }}
          />
          <ReferenceLine
            y={avg20d}
            stroke="#3fb950"
            strokeDasharray="5 3"
            strokeWidth={2}
            label={{ value: `20-Day Avg: ${avg20d}M`, position: 'insideTopRight', fill: '#3fb950', fontSize: 11 }}
          />
          <Bar dataKey="dailyVolume" name="Daily Volume" fill="#58a6ff" radius={[3, 3, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
