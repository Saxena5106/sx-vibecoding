import { useStockData } from '../hooks/useStockData'
import StockHeader from './StockHeader'
import PriceChart from './PriceChart'
import StatsGrid from './StatsGrid'
import VolumeBarChart from './VolumeBarChart'
import NewsSection from './NewsSection'
import styles from './StockPage.module.css'

/** Derive % change rows from live price history */
function buildPerformanceRows(priceHistory, currentPrice) {
  if (!priceHistory || priceHistory.length < 2) return [];
  const closes = priceHistory.map((d) => d.close);
  const pct = (from) => {
    if (!from) return null;
    const p = ((currentPrice - from) / from) * 100;
    return { value: `${p >= 0 ? '+' : ''}${p.toFixed(2)}%`, positive: p >= 0 };
  };
  return [
    { label: '1 Day',   ...pct(closes.at(-2)) },
    { label: '1 Week',  ...pct(closes.at(-6)) },
    { label: '1 Month', ...pct(closes.at(-22)) },
    { label: '3 Month', ...pct(closes.at(-66)) },
  ].filter((r) => r.value != null);
}

export default function StockPage() {
  const { data, loading, error } = useStockData()

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Loading live data…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>⚠ {error}</div>
      </div>
    )
  }

  const { quote, priceHistory, volumeData, news } = data
  const isPositive = quote.change >= 0
  const perfRows = buildPerformanceRows(priceHistory, quote.price)

  return (
    <div className={styles.page}>
      {/* Top navigation bar */}
      <nav className={styles.nav}>
        <span className={styles.navBrand}>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.navIcon}>
            <rect width="20" height="20" rx="4" fill="#58a6ff" />
            <path d="M5 15V8l5 5 5-5v7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          StockView
        </span>
        <div className={styles.navLinks}>
          <a href="#" className={styles.navLink + ' ' + styles.navLinkActive}>Markets</a>
          <a href="#" className={styles.navLink}>Watchlist</a>
          <a href="#" className={styles.navLink}>Portfolio</a>
        </div>
        <div className={styles.navBadge}>
          <span className={styles.liveDot} />
          Live
        </div>
      </nav>

      {/* Stock header */}
      <StockHeader quote={quote} />

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.grid}>
          {/* Left column */}
          <div className={styles.leftCol}>
            <PriceChart history={priceHistory} isPositive={isPositive} />
            <StatsGrid quote={quote} />
            <VolumeBarChart data={volumeData} />
          </div>

          {/* Right column */}
          <div className={styles.rightCol}>
            {/* Quick summary card */}
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>About NVIDIA</h2>
              <p className={styles.summaryText}>
                NVIDIA Corporation designs and manufactures graphics processing units (GPUs),
                system-on-chip units, and API software for the gaming, data centre, and
                professional visualisation markets. It is a primary supplier of AI accelerators
                used in large-scale machine learning and generative AI workloads.
              </p>
              <div className={styles.tagRow}>
                {['AI', 'Semiconductors', 'Data Centre', 'Gaming', 'Robotics'].map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Performance snapshot */}
            <div className={styles.perfCard}>
              <h2 className={styles.summaryTitle}>Performance</h2>
              {perfRows.map((row) => (
                <div key={row.label} className={styles.perfRow}>
                  <span className={styles.perfLabel}>{row.label}</span>
                  <span className={`${styles.perfValue} ${row.positive ? styles.perfGreen : styles.perfRed}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* News */}
            <NewsSection news={news} />
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Data shown is for demonstration purposes only · Not financial advice</p>
      </footer>
    </div>
  )
}
