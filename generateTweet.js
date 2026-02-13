import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error('Missing OPENAI_API_KEY environment variable.');
}

const client = new OpenAI({ apiKey: openaiApiKey });

export async function generateTweet(mode, snapshot) {
  let prompt;

  if (mode === "education") {
    prompt = `
Generate one insightful Indian stock market education tweet.

Focus on:
- Trading psychology
- Risk management
- Beginner mistakes
- Long-term investing mindset
- Market discipline

Rules:
- Conversational tone
- Opinion-driven
- No hashtags
- No emojis
- Not financial advice
- Under 240 characters
- Output only the tweet text
`;
  } else {
    if (!snapshot) {
      throw new Error("Market snapshot required for market modes.");
    }

    prompt = `
Generate a ${mode} update for the Indian stock market.

Market Data:
NIFTY: ${snapshot.nifty?.price} (${snapshot.nifty?.changePercent}%)
SENSEX: ${snapshot.sensex?.price} (${snapshot.sensex?.changePercent}%)
BANKNIFTY: ${snapshot.bankNifty?.price} (${snapshot.bankNifty?.changePercent}%)

Rules:
- Conversational tone
- Opinion-driven but not financial advice
- Mention key movement clearly
- No hashtags
- No emojis
- Under 240 characters
- Output only the tweet text
`;
  }

  const response = await client.responses.create({
    model: "gpt-4.1",
    input: prompt,
    max_output_tokens: 120
  });

  const tweet = response.output_text?.trim();

  if (!tweet) {
    throw new Error("OpenAI did not return tweet text.");
  }

  if (tweet.length >= 240) {
    throw new Error(`Generated tweet exceeds 240 characters (${tweet.length}).`);
  }

  return tweet;
}
