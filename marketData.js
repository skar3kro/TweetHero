const YAHOO_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';

const SYMBOL_MAP = {
  nifty: '^NSEI',
  sensex: '^BSESN',
  bankNifty: '^NSEBANK'
};

function toSnapshotEntry(quote) {
  if (!quote) {
    return { price: null, changePercent: null };
  }

  const price = typeof quote.regularMarketPrice === 'number' ? quote.regularMarketPrice : null;
  const changePercent = typeof quote.regularMarketChangePercent === 'number'
    ? Number(quote.regularMarketChangePercent.toFixed(2))
    : null;

  return { price, changePercent };
}

export async function getMarketSnapshot() {
  const symbols = Object.values(SYMBOL_MAP).join(',');
  const response = await fetch(`${YAHOO_QUOTE_URL}?symbols=${encodeURIComponent(symbols)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch market data from Yahoo Finance (status ${response.status}).`);
  }

  const payload = await response.json();
  const results = payload?.quoteResponse?.result;

  if (!Array.isArray(results)) {
    throw new Error('Yahoo Finance response format was unexpected.');
  }

  const bySymbol = new Map(results.map((item) => [item.symbol, item]));

  return {
    nifty: toSnapshotEntry(bySymbol.get(SYMBOL_MAP.nifty)),
    sensex: toSnapshotEntry(bySymbol.get(SYMBOL_MAP.sensex)),
    bankNifty: toSnapshotEntry(bySymbol.get(SYMBOL_MAP.bankNifty))
  };
}
