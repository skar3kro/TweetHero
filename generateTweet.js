import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error('Missing OPENAI_API_KEY environment variable.');
}

const client = new OpenAI({ apiKey: openaiApiKey });

export async function generateTweet(topic) {
  const topicText = typeof topic === 'string' ? topic : topic?.topic ?? topic?.title ?? '';

  if (!topicText) {
    throw new Error('Topic is required to generate a tweet.');
  }

  const prompt = `Write a tweet about: "${topicText}".

Rules:
- Conversational tone
- Opinion-driven perspective
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
