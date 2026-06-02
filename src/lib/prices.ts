import type { Asset } from "@/types";

// --- Yahoo Finance ---

async function fetchYahooPrice(symbol: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 }, // cache 5 min
    });
    if (!res.ok) return null;
    const json = await res.json();
    const price =
      json?.chart?.result?.[0]?.meta?.regularMarketPrice ??
      json?.chart?.result?.[0]?.meta?.previousClose;
    return typeof price === "number" ? price : null;
  } catch {
    return null;
  }
}

// Fetch USD/IDR exchange rate
export async function fetchUsdIdr(): Promise<number> {
  const price = await fetchYahooPrice("USDIDR=X");
  return price ?? 15800; // fallback
}

// --- CoinGecko ---

// Map common symbols → CoinGecko IDs
const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  DOT: "polkadot",
  MATIC: "matic-network",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
  LTC: "litecoin",
  BCH: "bitcoin-cash",
  NEAR: "near",
  ICP: "internet-computer",
  FIL: "filecoin",
  APT: "aptos",
  ARB: "arbitrum",
  OP: "optimism",
  SUI: "sui",
  INJ: "injective-protocol",
  PEPE: "pepe",
  SHIB: "shiba-inu",
  TRX: "tron",
  TON: "the-open-network",
};

async function fetchCoinGeckoPrices(symbols: string[]): Promise<Record<string, number>> {
  const ids = symbols
    .map((s) => COINGECKO_IDS[s.toUpperCase()])
    .filter(Boolean)
    .join(",");

  if (!ids) return {};

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return {};
    const json = await res.json();

    const result: Record<string, number> = {};
    for (const sym of symbols) {
      const id = COINGECKO_IDS[sym.toUpperCase()];
      if (id && json[id]?.usd) {
        result[sym.toUpperCase()] = json[id].usd;
      }
    }
    return result;
  } catch {
    return {};
  }
}

// --- Main price fetcher ---

export interface PriceResult {
  assetId: string;
  currentPrice: number; // in asset's native currency
  currentValueIDR: number;
  unrealizedReturn: number; // absolute, in native currency
  unrealizedReturnPct: number;
}

export interface PortfolioPrices {
  prices: PriceResult[];
  totalValueIDR: number;
  totalCostIDR: number;
  usdIdr: number;
}

export async function fetchPortfolioPrices(assets: Asset[]): Promise<PortfolioPrices> {
  const usdIdr = await fetchUsdIdr();

  // Collect unique crypto symbols
  const cryptoSymbols = [
    ...new Set(
      assets
        .filter((a) => a.type === "crypto")
        .map((a) => (a.symbol ?? "").toUpperCase())
        .filter(Boolean)
    ),
  ];
  const cryptoPrices = await fetchCoinGeckoPrices(cryptoSymbols);

  // Fetch Yahoo prices for stocks concurrently
  const stockAssets = assets.filter(
    (a) => a.type === "saham_id" || a.type === "saham_us"
  );
  const yahooSymbols = stockAssets.map((a) => {
    const sym = a.symbol ?? "";
    return a.type === "saham_id" ? `${sym}.JK` : sym;
  });

  const yahooResults = await Promise.all(yahooSymbols.map(fetchYahooPrice));
  const yahooMap: Record<string, number> = {};
  stockAssets.forEach((a, i) => {
    if (yahooResults[i] != null) {
      yahooMap[a.id] = yahooResults[i]!;
    }
  });

  const prices: PriceResult[] = [];
  let totalValueIDR = 0;
  let totalCostIDR = 0;

  for (const asset of assets) {
    let currentPrice: number | null = null;
    let costIDR = 0;
    let valueIDR = 0;

    if (asset.type === "saham_id") {
      // IDX: price per share in IDR, lot = 100 shares
      currentPrice = yahooMap[asset.id] ?? null;
      const shares = asset.quantity * 100;
      costIDR = shares * asset.avg_price;
      valueIDR = currentPrice != null ? shares * currentPrice : costIDR;
    } else if (asset.type === "saham_us") {
      currentPrice = yahooMap[asset.id] ?? null;
      costIDR = asset.quantity * asset.avg_price * usdIdr;
      valueIDR = currentPrice != null ? asset.quantity * currentPrice * usdIdr : costIDR;
    } else if (asset.type === "crypto") {
      const sym = (asset.symbol ?? "").toUpperCase();
      currentPrice = cryptoPrices[sym] ?? null;
      costIDR = asset.quantity * asset.avg_price * usdIdr;
      valueIDR = currentPrice != null ? asset.quantity * currentPrice * usdIdr : costIDR;
    } else if (asset.type === "reksa_dana") {
      // Use expected return to estimate current value (simplified)
      const years = 1; // assume 1 year
      const expectedReturn = asset.expected_return ?? 0;
      const growthFactor = 1 + (expectedReturn / 100) * years;
      currentPrice = asset.avg_price * growthFactor;
      costIDR = asset.avg_price; // reksa_dana: quantity=1, avg_price=total invested
      valueIDR = costIDR * growthFactor;
    } else if (asset.type === "cash") {
      currentPrice = asset.avg_price;
      costIDR =
        asset.currency === "USD"
          ? asset.avg_price * usdIdr
          : asset.avg_price;
      valueIDR = costIDR;
    }

    const effectivePrice = currentPrice ?? asset.avg_price;
    const unrealizedReturn = effectivePrice - asset.avg_price;
    const unrealizedReturnPct =
      asset.avg_price > 0 ? (unrealizedReturn / asset.avg_price) * 100 : 0;

    prices.push({
      assetId: asset.id,
      currentPrice: effectivePrice,
      currentValueIDR: valueIDR,
      unrealizedReturn,
      unrealizedReturnPct,
    });

    totalValueIDR += valueIDR;
    totalCostIDR += costIDR;
  }

  return { prices, totalValueIDR, totalCostIDR, usdIdr };
}
