import styles from './StockHeader.module.css'

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

export default function StockHeader({ quote }) {
  const isPositive = quote.change >= 0

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo + identity */}
        <div className={styles.identity}>
          <div className={styles.logo}>
            <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <rect width="40" height="40" rx="8" fill="#76b900" />
              <path
                d="M8 28V14.5c3.5-4.5 10-5.5 14 0v2.5c-2.5-3-8-3-10 0V28H8z"
                fill="white"
              />
              <path
                d="M20 16c4-5.5 12-4.5 12 4v8h-4v-7.5c0-3-4-4-6-1.5L20 16z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <div className={styles.symbolRow}>
              <span className={styles.symbol}>{quote.symbol}</span>
              <span className={styles.exchange}>{quote.exchange}</span>
            </div>
            <p className={styles.companyName}>{quote.name}</p>
            <p className={styles.sectorTag}>{quote.sector} · {quote.industry}</p>
          </div>
        </div>

        {/* Price block */}
        <div className={styles.priceBlock}>
          <span className={styles.price}>{fmt(quote.price)}</span>
          <div className={`${styles.changeBadge} ${isPositive ? styles.positive : styles.negative}`}>
            <span>{isPositive ? '▲' : '▼'}</span>
            <span>{Math.abs(quote.change).toFixed(2)}</span>
            <span>({Math.abs(quote.changePercent).toFixed(2)}%)</span>
          </div>
          <p className={styles.asOf}>
            As of {new Date(quote.lastUpdated).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })} · Market closed
          </p>
        </div>
      </div>
    </header>
  )
}
