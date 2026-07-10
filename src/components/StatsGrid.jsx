import styles from './StatsGrid.module.css'

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

const fmtLargeNum = (n) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`
  return n.toLocaleString()
}

const fmtVolume = (n) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`
  return n.toLocaleString()
}

export default function StatsGrid({ quote }) {
  const stats = [
    { label: 'Open',         value: fmtCurrency(quote.open) },
    { label: "Day's High",   value: fmtCurrency(quote.dayHigh) },
    { label: "Day's Low",    value: fmtCurrency(quote.dayLow) },
    { label: 'Prev. Close',  value: fmtCurrency(quote.previousClose) },
    { label: 'Volume',       value: fmtVolume(quote.volume) },
    { label: 'Avg. Volume',  value: fmtVolume(quote.avgVolume) },
    { label: 'Market Cap',   value: fmtLargeNum(quote.marketCap) },
    { label: 'P/E Ratio',    value: quote.peRatio.toFixed(1) },
    { label: 'EPS (TTM)',    value: fmtCurrency(quote.eps) },
    { label: 'Div. Yield',   value: `${quote.dividendYield.toFixed(2)}%` },
    { label: 'Beta',         value: quote.beta.toFixed(2) },
    { label: '52W High',     value: fmtCurrency(quote.week52High), highlight: 'high' },
    { label: '52W Low',      value: fmtCurrency(quote.week52Low),  highlight: 'low'  },
    { label: 'Shares Out.',  value: fmtLargeNum(quote.sharesOutstanding).replace('$', '') },
  ]

  // 52-week position bar
  const rangePercent =
    ((quote.price - quote.week52Low) / (quote.week52High - quote.week52Low)) * 100

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.sectionTitle}>Key Statistics</h2>

      {/* 52-week range bar */}
      <div className={styles.rangeCard}>
        <div className={styles.rangeLabels}>
          <span>52W Low: {fmtCurrency(quote.week52Low)}</span>
          <span className={styles.currentLabel}>
            Current: <strong>{fmtCurrency(quote.price)}</strong>
          </span>
          <span>52W High: {fmtCurrency(quote.week52High)}</span>
        </div>
        <div className={styles.rangeTrack}>
          <div
            className={styles.rangeThumb}
            style={{ left: `${Math.min(Math.max(rangePercent, 2), 98)}%` }}
          />
          <div className={styles.rangeFill} style={{ width: `${rangePercent}%` }} />
        </div>
      </div>

      {/* Stats grid */}
      <div className={styles.grid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.statLabel}>{s.label}</span>
            <span
              className={`${styles.statValue} ${
                s.highlight === 'high' ? styles.greenVal :
                s.highlight === 'low'  ? styles.redVal  : ''
              }`}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
