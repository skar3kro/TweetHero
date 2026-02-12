export async function getMarketSnapshot() {
  const symbols = "%5ENSEI,%5EBSESN,%5ENSEBANK";

  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch market data");
  }

  const data = await response.json();
  const results = data.quoteResponse.result;

  const snapshot = {};

  for (const item of results) {
    if (item.symbol === "^NSEI") {
      snapshot.nifty = {
        price: item.regularMarketPrice,
        changePercent: item.regularMarketChangePercent
      };
    }

    if (item.symbol === "^BSESN") {
      snapshot.sensex = {
        price: item.regularMarketPrice,
        changePercent: item.regularMarketChangePercent
      };
    }

    if (item.symbol === "^NSEBANK") {
      snapshot.bankNifty = {
        price: item.regularMarketPrice,
        changePercent: item.regularMarketChangePercent
      };
    }
  }

  return snapshot;
}
