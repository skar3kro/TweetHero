export async function getMarketSnapshot() {
  const symbols = "%5ENSEI,%5EBSESN,%5ENSEBANK";
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Yahoo API failed: ${response.status}`);
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
