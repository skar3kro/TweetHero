import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error('Missing OPENAI_API_KEY environment variable.');
}

const client = new OpenAI({ apiKey: openaiApiKey });

const MODE_PROMPTS = {
  premarket: 'Write a pre-market tweet with a cautious setup for the Indian session.',
  open: 'Write a market open tweet reacting to the first move with a clear viewpoint.',
  recap: 'Write a market recap tweet summarizing how the Indian session played out.',
  education: 'Write an educational market tweet that explains one practical trading/investing idea using today\'s market context.'
};

function getModeInstruction(mode) {
  return MODE_PROMPTS[mode] ?? MODE_PROMPTS.education;
}

function formatMarketSnapshot(snapshot) {
  const formatIndex = (name, data) => {
    const price = typeof data?.price === 'number' ? data.price.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 'N/A';
    const changePercent = typeof data?.changePercent === 'number'
      ? `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`
      : 'N/A';

    return `${name}: ${price} (${changePercent})`;
  };

  return [
    formatIndex('NIFTY 50', snapshot?.nifty),
    formatIndex('SENSEX', snapshot?.sensex),
    formatIndex('BANKNIFTY', snapshot?.bankNifty)
  ].join('\n');
}

export async function generateTweet({ topic, mode, marketSnapshot }) {
  const topicText = typeof topic === 'string' ? topic : topic?.topic ?? topic?.title ?? '';

  const prompt = `${getModeInstruction(mode)}

Context topic: "${topicText || 'General Indian markets'}"
Live market snapshot:
${formatMarketSnapshot(marketSnapshot)}

Rules:
- Conversational tone
- Opinion-driven perspective
- Not financial advice
- No hashtags
- No emojis
- Must be under 240 characters
- Output only the tweet text`;

  const response = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: prompt,
    max_output_tokens: 120
  });

  const tweet = response.output_text?.trim();

  if (!tweet) {
    throw new Error('OpenAI did not return tweet text.');
  }

  if (tweet.length >= 240) {
    throw new Error(`Generated tweet exceeds 240 characters (${tweet.length}).`);
  }

  return tweet;
}
