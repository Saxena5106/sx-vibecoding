const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches live NVDA stock data from the StockView backend API.
 * Returns: { quote, priceHistory, volumeData, news }
 */
export async function fetchStockData() {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not set. Add it to your .env file or Amplify environment variables.');
  }
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`API responded with status ${response.status}`);
  }
  return response.json();
}
