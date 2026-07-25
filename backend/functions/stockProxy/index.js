'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const https = require('https');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.CACHE_TABLE_NAME;
const API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB = 'https://finnhub.io/api/v1';
const YAHOO   = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Cache TTLs (seconds)
const TTL_QUOTE   = 60;       // 1 minute  – real-time price
const TTL_HISTORY = 3_600;    // 1 hour    – daily candles don't change intraday
const TTL_NEWS    = 300;      // 5 minutes – news feed

// ── HTTP helper ──────────────────────────────────────────────────────────────
function fetchJson(url, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        ...extraHeaders,
      },
    };
    https.get(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error(`JSON parse error for ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

// ── DynamoDB cache helpers ───────────────────────────────────────────────────
async function getCached(key) {
  try {
    const { Item } = await ddb.send(new GetCommand({ TableName: TABLE, Key: { cacheKey: key } }));
    if (Item && Item.expiresAt > Math.floor(Date.now() / 1000)) {
      return JSON.parse(Item.data);
    }
  } catch (e) {
    console.warn('Cache read failed:', e.message);
  }
  return null;
}

async function setCached(key, data, ttl) {
  try {
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: { cacheKey: key, data: JSON.stringify(data), expiresAt: Math.floor(Date.now() / 1000) + ttl },
    }));
  } catch (e) {
    console.warn('Cache write failed:', e.message);
  }
}

async function withCache(key, ttl, fetchFn) {
  const cached = await getCached(key);
  if (cached) return cached;
  const fresh = await fetchFn();
  await setCached(key, fresh, ttl);
  return fresh;
}

// ── Normalizers ──────────────────────────────────────────────────────────────
function normalizeQuote(q, profile, metrics) {
  const m = metrics.metric || {};
  return {
    symbol:           'NVDA',
    name:             profile.name            || 'NVIDIA Corporation',
    exchange:         profile.exchange        || 'NASDAQ',
    price:            q.c,
    previousClose:    q.pc,
    change:           parseFloat((q.c - q.pc).toFixed(2)),
    changePercent:    parseFloat(((q.c - q.pc) / q.pc * 100).toFixed(2)),
    open:             q.o,
    dayHigh:          q.h,
    dayLow:           q.l,
    // Finnhub returns avg volumes in millions of shares
    volume:           Math.round((m['10DayAverageTradingVolume']  || 0) * 1_000_000),
    avgVolume:        Math.round((m['3MonthAverageTradingVolume'] || 0) * 1_000_000),
    marketCap:        Math.round((profile.marketCapitalization   || 0) * 1_000_000),
    peRatio:          m.peNormalizedAnnual              || 0,
    eps:              m.epsNormalizedAnnual              || 0,
    dividendYield:    m.dividendYieldIndicatedAnnual     || 0,
    beta:             m.beta                             || 0,
    week52High:       m['52WeekHigh']                    || 0,
    week52Low:        m['52WeekLow']                     || 0,
    sharesOutstanding: Math.round((profile.shareOutstanding || 0) * 1_000_000),
    sector:           profile.finnhubIndustry || 'Technology',
    industry:         profile.finnhubIndustry || 'Semiconductors',
    lastUpdated:      new Date().toISOString(),
  };
}

function formatDate(unixSec) {
  return new Date(unixSec * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function normalizePriceHistory(yahooChart) {
  try {
    const result = yahooChart.chart.result[0];
    const timestamps = result.timestamp;
    const closes    = result.indicators.quote[0].close;
    return timestamps
      .map((t, i) => ({ date: formatDate(t), close: parseFloat((closes[i] || 0).toFixed(2)) }))
      .filter((d) => d.close > 0);
  } catch { return []; }
}

function normalizeVolumeData(yahooChart) {
  try {
    const result = yahooChart.chart.result[0];
    const timestamps = result.timestamp;
    const volumes    = result.indicators.quote[0].volume;
    const volM = volumes.map((v) => parseFloat(((v || 0) / 1_000_000).toFixed(1)));

    const withAvg = volM.map((_, i) => {
      const window = volM.slice(Math.max(0, i - 19), i + 1);
      const avg = parseFloat((window.reduce((a, b) => a + b, 0) / window.length).toFixed(1));
      return { date: formatDate(timestamps[i]), dailyVolume: volM[i], avg20d: avg };
    });
    return withAvg.slice(-12);
  } catch { return []; }
}

function relativeTime(unixSec) {
  const diff = Math.floor(Date.now() / 1000) - unixSec;
  if (diff < 3_600)  return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86_400) return `${Math.floor(diff / 3_600)} hours ago`;
  return `${Math.floor(diff / 86_400)} days ago`;
}

const POS_WORDS = ['record','beat','surge','gain','rise','strong','growth','profit','expand','partner','raises','upgrade','boosts','wins'];
const NEG_WORDS = ['fall','drop','miss','loss','decline','cut','warn','risk','scrutiny','investigation','fine','penalty','slump','downgrade'];

function detectSentiment(headline) {
  const h = headline.toLowerCase();
  const pos = POS_WORDS.filter((w) => h.includes(w)).length;
  const neg = NEG_WORDS.filter((w) => h.includes(w)).length;
  return neg > pos ? 'negative' : 'positive';
}

function normalizeNews(articles) {
  return articles.slice(0, 10).map((a) => ({
    id:        a.id,
    headline:  a.headline,
    summary:   a.summary  || '',
    source:    a.source,
    url:       a.url,
    time:      relativeTime(a.datetime),
    sentiment: detectSentiment(a.headline),
  }));
}

// ── Handler ──────────────────────────────────────────────────────────────────
exports.handler = async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const symbol      = 'NVDA';
    const todayStr    = new Date().toISOString().split('T')[0];
    const week7Str    = new Date(Date.now() - 7 * 86_400_000).toISOString().split('T')[0];

    const [quote, profile, metrics, candles, news] = await Promise.all([
      withCache(`${symbol}#quote`,   TTL_QUOTE,   () => fetchJson(`${FINNHUB}/quote?symbol=${symbol}&token=${API_KEY}`)),
      withCache(`${symbol}#profile`, TTL_HISTORY, () => fetchJson(`${FINNHUB}/stock/profile2?symbol=${symbol}&token=${API_KEY}`)),
      withCache(`${symbol}#metrics`, TTL_HISTORY, () => fetchJson(`${FINNHUB}/stock/metric?symbol=${symbol}&metric=all&token=${API_KEY}`)),
      withCache(`${symbol}#candles`, TTL_HISTORY, () => fetchJson(`${YAHOO}/${symbol}?interval=1d&range=3mo&includePrePost=false`)),
      withCache(`${symbol}#news`,    TTL_NEWS,    () => fetchJson(`${FINNHUB}/company-news?symbol=${symbol}&from=${week7Str}&to=${todayStr}&token=${API_KEY}`)),
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        quote:        normalizeQuote(quote, profile, metrics),
        priceHistory: normalizePriceHistory(candles),
        volumeData:   normalizeVolumeData(candles),
        news:         normalizeNews(Array.isArray(news) ? news : []),
      }),
    };
  } catch (err) {
    console.error('Handler error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to fetch stock data' }) };
  }
};
