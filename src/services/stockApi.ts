// Twelve Data API Utility Service
// Supports US Stocks, Indian Stocks (NSE/BSE), Forex, and Crypto
// Twelve Data API Key: 83ef983ad1e1433485c05957a560aa5c

const TWELVE_DATA_API_KEY = (import.meta as any).env?.VITE_TWELVE_DATA_API_KEY || "83ef983ad1e1433485c05957a560aa5c";
const BASE_URL = "https://api.twelvedata.com";
const CACHE_TTL_MS = 60000; // 60-second client-side cache layer

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const quoteCache = new Map<string, CacheEntry<StockQuote>>();
const timeSeriesCache = new Map<string, CacheEntry<TimeSeriesPoint[]>>();
const batchQuoteCache = new Map<string, CacheEntry<Record<string, StockQuote>>>();

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent_change: number;
  high: number;
  low: number;
  volume: number;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  currency: string;
  datetime: string;
  is_market_open: boolean;
  exchange?: string;
}

export interface TimeSeriesPoint {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Default baseline data when network or API limits are encountered
const FALLBACK_QUOTES: Record<string, StockQuote> = {
  "AAPL": {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 224.25,
    change: 3.45,
    percent_change: 1.56,
    high: 226.10,
    low: 221.80,
    volume: 48250000,
    fifty_two_week_high: 237.23,
    fifty_two_week_low: 164.08,
    currency: "USD",
    datetime: new Date().toISOString(),
    is_market_open: true,
    exchange: "NASDAQ"
  },
  "NVDA": {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 128.80,
    change: 4.12,
    percent_change: 3.30,
    high: 130.50,
    low: 125.10,
    volume: 72100000,
    fifty_two_week_high: 140.76,
    fifty_two_week_low: 39.23,
    currency: "USD",
    datetime: new Date().toISOString(),
    is_market_open: true,
    exchange: "NASDAQ"
  },
  "TSLA": {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 218.40,
    change: -2.15,
    percent_change: -0.98,
    high: 223.00,
    low: 215.50,
    volume: 53100000,
    fifty_two_week_high: 271.00,
    fifty_two_week_low: 138.80,
    currency: "USD",
    datetime: new Date().toISOString(),
    is_market_open: true,
    exchange: "NASDAQ"
  },
  "MSFT": {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 442.10,
    change: 2.80,
    percent_change: 0.64,
    high: 445.00,
    low: 439.20,
    volume: 21000000,
    fifty_two_week_high: 468.35,
    fifty_two_week_low: 309.45,
    currency: "USD",
    datetime: new Date().toISOString(),
    is_market_open: true,
    exchange: "NASDAQ"
  },
  "RELIANCE:NSE": {
    symbol: "RELIANCE:NSE",
    name: "Reliance Industries Ltd",
    price: 2985.50,
    change: 38.20,
    percent_change: 1.30,
    high: 3010.00,
    low: 2950.00,
    volume: 8450000,
    fifty_two_week_high: 3217.90,
    fifty_two_week_low: 2220.30,
    currency: "INR",
    datetime: new Date().toISOString(),
    is_market_open: true,
    exchange: "NSE"
  },
  "TCS:NSE": {
    symbol: "TCS:NSE",
    name: "Tata Consultancy Services",
    price: 4210.80,
    change: -18.40,
    percent_change: -0.44,
    high: 4250.00,
    low: 4190.00,
    volume: 2100000,
    fifty_two_week_high: 4585.90,
    fifty_two_week_low: 3310.00,
    currency: "INR",
    datetime: new Date().toISOString(),
    is_market_open: true,
    exchange: "NSE"
  },
  "INFY:NSE": {
    symbol: "INFY:NSE",
    name: "Infosys Limited",
    price: 1820.25,
    change: 22.10,
    percent_change: 1.23,
    high: 1840.00,
    low: 1802.00,
    volume: 5300000,
    fifty_two_week_high: 1978.00,
    fifty_two_week_low: 1355.00,
    currency: "INR",
    datetime: new Date().toISOString(),
    is_market_open: true,
    exchange: "NSE"
  },
  "BTC/USD": {
    symbol: "BTC/USD",
    name: "Bitcoin",
    price: 64250.00,
    change: 1850.00,
    percent_change: 2.96,
    high: 65100.00,
    low: 62200.00,
    volume: 28400000000,
    fifty_two_week_high: 73750.00,
    fifty_two_week_low: 25800.00,
    currency: "USD",
    datetime: new Date().toISOString(),
    is_market_open: true,
    exchange: "Crypto"
  },
  "ETH/USD": {
    symbol: "ETH/USD",
    name: "Ethereum",
    price: 3480.00,
    change: 95.00,
    percent_change: 2.81,
    high: 3520.00,
    low: 3360.00,
    volume: 14200000000,
    fifty_two_week_high: 4090.00,
    fifty_two_week_low: 1520.00,
    currency: "USD",
    datetime: new Date().toISOString(),
    is_market_open: true,
    exchange: "Crypto"
  }
};

/**
  Fetch Live Quote for a symbol using Twelve Data API
  Example endpoints:
  - US Stocks: AAPL, NVDA, TSLA
  - Indian Stocks: RELIANCE:NSE, TCS:NSE
  - Forex/Crypto: BTC/USD, EUR/USD
 */
export async function getLiveQuote(symbol: string): Promise<StockQuote> {
  const cleanSymbol = symbol.trim().toUpperCase();
  const cacheKey = `quote:${cleanSymbol}`;
  const now = Date.now();

  const cached = quoteCache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const url = `${BASE_URL}/quote?symbol=${encodeURIComponent(cleanSymbol)}&apikey=${TWELVE_DATA_API_KEY}`;

  try {
    const res = await fetch(url);
    if (res.status === 429) {
      console.warn(`Twelve Data 429 Rate Limit Hit for ${cleanSymbol}. Serving fallback.`);
      const fallback = getFallbackQuote(cleanSymbol);
      quoteCache.set(cacheKey, { data: fallback, timestamp: now });
      return fallback;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.status === "error" || data.code === 429 || !data.price) {
      console.warn(`Twelve Data API fallback for ${cleanSymbol}:`, data.message || "No price data");
      const fallback = getFallbackQuote(cleanSymbol);
      quoteCache.set(cacheKey, { data: fallback, timestamp: now });
      return fallback;
    }

    const price = parseFloat(data.price || data.close || "0");
    const change = parseFloat(data.change || "0");
    const percent_change = parseFloat(data.percent_change || "0");

    const result: StockQuote = {
      symbol: data.symbol || cleanSymbol,
      name: data.name || cleanSymbol,
      price: isNaN(price) ? 100 : price,
      change: isNaN(change) ? 0 : change,
      percent_change: isNaN(percent_change) ? 0 : percent_change,
      high: parseFloat(data.high || price * 1.02),
      low: parseFloat(data.low || price * 0.98),
      volume: parseInt(data.volume || "1000000", 10),
      fifty_two_week_high: parseFloat(data.fifty_two_week?.high || price * 1.25),
      fifty_two_week_low: parseFloat(data.fifty_two_week?.low || price * 0.75),
      currency: data.currency || "USD",
      datetime: data.datetime || new Date().toISOString(),
      is_market_open: data.is_market_open ?? true,
      exchange: data.exchange || "GLOBAL"
    };

    quoteCache.set(cacheKey, { data: result, timestamp: now });
    return result;
  } catch (error) {
    console.warn(`Twelve Data fetch error for ${cleanSymbol}, using fallback:`, error);
    const fallback = getFallbackQuote(cleanSymbol);
    quoteCache.set(cacheKey, { data: fallback, timestamp: now });
    return fallback;
  }
}

/**
 * Fetch Time Series (Historical OHLCV data) for chart rendering
 */
export async function getTimeSeries(
  symbol: string, 
  interval: "1min" | "5min" | "15min" | "1day" | "1week" | "1month" = "1day", 
  outputsize = 30
): Promise<TimeSeriesPoint[]> {
  const cleanSymbol = symbol.trim().toUpperCase();
  const cacheKey = `series:${cleanSymbol}:${interval}:${outputsize}`;
  const now = Date.now();

  const cached = timeSeriesCache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const url = `${BASE_URL}/time_series?symbol=${encodeURIComponent(cleanSymbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVE_DATA_API_KEY}`;

  try {
    const res = await fetch(url);
    if (res.status === 429) {
      console.warn(`Twelve Data 429 TimeSeries Rate Limit for ${cleanSymbol}. Serving fallback.`);
      const fallback = generateFallbackTimeSeries(cleanSymbol, outputsize);
      timeSeriesCache.set(cacheKey, { data: fallback, timestamp: now });
      return fallback;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.status === "error" || data.code === 429 || !Array.isArray(data.values)) {
      console.warn(`Twelve Data TimeSeries fallback for ${cleanSymbol}`);
      const fallback = generateFallbackTimeSeries(cleanSymbol, outputsize);
      timeSeriesCache.set(cacheKey, { data: fallback, timestamp: now });
      return fallback;
    }

    const points = data.values.map((v: any) => ({
      datetime: v.datetime,
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
      volume: parseInt(v.volume || "0", 10)
    })).reverse(); // Reverse so earliest is first

    timeSeriesCache.set(cacheKey, { data: points, timestamp: now });
    return points;
  } catch (error) {
    console.warn(`Twelve Data TimeSeries error for ${cleanSymbol}:`, error);
    const fallback = generateFallbackTimeSeries(cleanSymbol, outputsize);
    timeSeriesCache.set(cacheKey, { data: fallback, timestamp: now });
    return fallback;
  }
}

/**
 * Fetch Batch Quotes for multiple symbols
 */
export async function getBatchQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
  if (!symbols.length) return {};
  
  const symbolString = symbols.map(s => s.trim().toUpperCase()).sort().join(",");
  const cacheKey = `batch:${symbolString}`;
  const now = Date.now();

  const cached = batchQuoteCache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const url = `${BASE_URL}/quote?symbol=${encodeURIComponent(symbolString)}&apikey=${TWELVE_DATA_API_KEY}`;

  try {
    const res = await fetch(url);
    if (res.status === 429) {
      console.warn("Twelve Data 429 BatchQuote Rate Limit Hit, returning cached/fallback quotes");
      const results: Record<string, StockQuote> = {};
      symbols.forEach(s => {
        const clean = s.trim().toUpperCase();
        results[clean] = getFallbackQuote(clean);
      });
      batchQuoteCache.set(cacheKey, { data: results, timestamp: now });
      return results;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const results: Record<string, StockQuote> = {};

    if (data && (data.status === "error" || data.code === 429)) {
      console.warn("Twelve Data BatchQuote status error:", data.message);
      symbols.forEach(s => {
        const clean = s.trim().toUpperCase();
        results[clean] = getFallbackQuote(clean);
      });
      batchQuoteCache.set(cacheKey, { data: results, timestamp: now });
      return results;
    }

    // Twelve Data returns object keyed by symbol if multi-symbol request succeeds
    if (typeof data === "object" && !data.status) {
      Object.keys(data).forEach(sym => {
        const item = data[sym];
        if (item && item.price) {
          const price = parseFloat(item.price);
          results[sym] = {
            symbol: item.symbol || sym,
            name: item.name || sym,
            price: isNaN(price) ? 100 : price,
            change: parseFloat(item.change || "0"),
            percent_change: parseFloat(item.percent_change || "0"),
            high: parseFloat(item.high || price * 1.02),
            low: parseFloat(item.low || price * 0.98),
            volume: parseInt(item.volume || "1000000", 10),
            fifty_two_week_high: parseFloat(item.fifty_two_week?.high || price * 1.25),
            fifty_two_week_low: parseFloat(item.fifty_two_week?.low || price * 0.75),
            currency: item.currency || "USD",
            datetime: item.datetime || new Date().toISOString(),
            is_market_open: item.is_market_open ?? true,
            exchange: item.exchange || "GLOBAL"
          };
        }
      });
    }

    // Fill in any missing symbols with fallbacks
    symbols.forEach(sym => {
      const clean = sym.trim().toUpperCase();
      if (!results[clean]) {
        results[clean] = getFallbackQuote(clean);
      }
    });

    batchQuoteCache.set(cacheKey, { data: results, timestamp: now });
    return results;
  } catch (error) {
    console.warn("Twelve Data BatchQuote fetch error, returning fallbacks:", error);
    const results: Record<string, StockQuote> = {};
    symbols.forEach(s => {
      const clean = s.trim().toUpperCase();
      results[clean] = getFallbackQuote(clean);
    });
    batchQuoteCache.set(cacheKey, { data: results, timestamp: now });
    return results;
  }
}

function getFallbackQuote(symbol: string): StockQuote {
  if (FALLBACK_QUOTES[symbol]) {
    return { ...FALLBACK_QUOTES[symbol], datetime: new Date().toISOString() };
  }
  
  // Generate reasonable mock quote for arbitrary search symbol
  const isINR = symbol.includes(":NSE") || symbol.includes(":BSE") || symbol.includes(".NS");
  const basePrice = isINR ? 1500 : 180;
  const change = +(Math.random() * 8 - 3.5).toFixed(2);
  const percentChange = +((change / basePrice) * 100).toFixed(2);

  return {
    symbol,
    name: `${symbol} Equity Asset`,
    price: basePrice,
    change,
    percent_change: percentChange,
    high: +(basePrice * 1.03).toFixed(2),
    low: +(basePrice * 0.97).toFixed(2),
    volume: 3500000,
    fifty_two_week_high: +(basePrice * 1.3).toFixed(2),
    fifty_two_week_low: +(basePrice * 0.7).toFixed(2),
    currency: isINR ? "INR" : "USD",
    datetime: new Date().toISOString(),
    is_market_open: true,
    exchange: isINR ? "NSE" : "GLOBAL"
  };
}

function generateFallbackTimeSeries(symbol: string, count = 30): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const baseQuote = getFallbackQuote(symbol);
  let currentPrice = baseQuote.price;

  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const deltaPercent = (Math.random() - 0.48) * 0.03; // Slight upward bias
    currentPrice = Math.max(1, currentPrice * (1 + deltaPercent));
    
    const high = currentPrice * (1 + Math.random() * 0.015);
    const low = currentPrice * (1 - Math.random() * 0.015);
    const open = low + Math.random() * (high - low);
    const close = currentPrice;

    points.push({
      datetime: date.toISOString().split("T")[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume: Math.floor(Math.random() * 5000000 + 1000000)
    });
  }

  return points;
}
