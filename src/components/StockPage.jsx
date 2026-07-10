import { nvdaQuote, nvdaPriceHistory, nvdaNews, nvdaVolumeData } from '../data/nvdaMockData'
import StockHeader from './StockHeader'
import PriceChart from './PriceChart'
import StatsGrid from './StatsGrid'
import VolumeBarChart from './VolumeBarChart'
import NewsSection from './NewsSection'
import styles from './StockPage.module.css'

export default function StockPage() {
  const isPositive = nvdaQuote.change >= 0

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
          Mock Data
        </div>
      </nav>

      {/* Stock header */}
      <StockHeader quote={nvdaQuote} />

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.grid}>
          {/* Left column */}
          <div className={styles.leftCol}>
            <PriceChart history={nvdaPriceHistory} isPositive={isPositive} />
            <StatsGrid quote={nvdaQuote} />
            <VolumeBarChart data={nvdaVolumeData} />
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
              {[
                { label: '1 Day',  value: '+2.39%', positive: true  },
                { label: '1 Week', value: '+5.12%', positive: true  },
                { label: '1 Month',value: '+10.8%', positive: true  },
                { label: '3 Month',value: '+45.3%', positive: true  },
                { label: 'YTD',    value: '+72.4%', positive: true  },
                { label: '1 Year', value: '+86.7%', positive: true  },
              ].map((row) => (
                <div key={row.label} className={styles.perfRow}>
                  <span className={styles.perfLabel}>{row.label}</span>
                  <span className={`${styles.perfValue} ${row.positive ? styles.perfGreen : styles.perfRed}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* News */}
            <NewsSection news={nvdaNews} />
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Data shown is for demonstration purposes only · Not financial advice</p>
      </footer>
    </div>
  )
}
