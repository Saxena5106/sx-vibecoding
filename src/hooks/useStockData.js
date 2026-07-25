import { useState, useEffect } from 'react';
import { fetchStockData } from '../services/stockService';

const POLL_INTERVAL_MS = 60_000; // refresh every 60 seconds

/**
 * Fetches and auto-refreshes live NVDA stock data.
 * Returns { data, loading, error }
 *   data: { quote, priceHistory, volumeData, news }
 */
export function useStockData() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchStockData();
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return { data, loading, error };
}
