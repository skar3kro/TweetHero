export async function getMarketSnapshot() {
  const apiKey = process.env.TWELVEDATA_API_KEY;

  if (!apiKey) {
    throw new Error("Missing TWELVEDATA_API_KEY");
  }

  const symbols = "NIFTY,BSESN,NSEBANK";

  const url = `https://api.twelvedata.com/quote?symbol=${symbols}&exchange=NSE&apikey=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TwelveData failed: ${response.status}`);
  }

  const data = await response.json();

  return {
    nifty: {
      price: data["NIFTY"]?.close,
      changePercent: data["NIFTY"]?.percent_change
    },
    sensex: {
      price: data["BSESN"]?.close,
      changePercent: data["BSESN"]?.percent_change
    },
    bankNifty: {
      price: data["NSEBANK"]?.close,
      changePercent: data["NSEBANK"]?.percent_change
    }
  };
}
