import styles from './NewsSection.module.css'

export default function NewsSection({ news }) {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.sectionTitle}>Latest News</h2>
      <ul className={styles.list}>
        {news.map((item) => (
          <li key={item.id} className={styles.item}>
            <div
              className={`${styles.dot} ${
                item.sentiment === 'positive' ? styles.dotGreen : styles.dotRed
              }`}
            />
            <div className={styles.content}>
              <p className={styles.headline}>{item.headline}</p>
              <div className={styles.meta}>
                <span className={styles.source}>{item.source}</span>
                <span className={styles.time}>{item.time}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
