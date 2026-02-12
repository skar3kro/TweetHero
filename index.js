import { supabase } from './db.js';
import { getNextTopic } from './getTopic.js';
import { generateTweet } from './generateTweet.js';
import { postTweet } from './postTweet.js';

const mode = (process.env.MODE || 'education').toLowerCase();
const marketModes = new Set(['premarket', 'open', 'recap']);

async function fetchMarketSnapshot() {
  if (process.env.MARKET_SNAPSHOT_URL) {
    const response = await fetch(process.env.MARKET_SNAPSHOT_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch market snapshot from URL: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  }

  const { data, error } = await supabase
    .from('market_snapshots')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch market snapshot: ${error.message}`);
  }

  if (!data) {
    throw new Error('No market snapshot found.');
  }

  return data;
}

async function run() {
  if (mode === 'education') {
    console.log('MODE=education: fetching next pending topic...');
    const topic = await getNextTopic();

    if (!topic) {
      console.log('No pending topics found. Exiting.');
      process.exit(0);
    }

    console.log(`Found topic #${topic.id}: ${topic.topic ?? topic.title ?? 'Untitled topic'}`);

    console.log('Generating education tweet with OpenAI...');
    const tweetText = await generateTweet(topic);
    console.log(`Generated tweet (${tweetText.length} chars): ${tweetText}`);

    console.log('Posting tweet to Twitter...');
    const postedTweet = await postTweet(tweetText);
    console.log(`Tweet posted successfully. Tweet ID: ${postedTweet.id}`);

    console.log(`Updating topic #${topic.id} status to 'posted'...`);
    const { error } = await supabase
      .from('topics')
      .update({ status: 'posted' })
      .eq('id', topic.id);

    if (error) {
      throw new Error(`Failed to update topic status: ${error.message}`);
    }

    console.log('Topic status updated to posted. Done.');
    process.exit(0);
  }

  if (!marketModes.has(mode)) {
    throw new Error(`Unsupported MODE "${mode}". Expected "education", "premarket", "open", or "recap".`);
  }

  console.log(`MODE=${mode}: fetching market snapshot...`);
  const snapshot = await fetchMarketSnapshot();

  console.log('Generating market tweet with OpenAI...');
  const tweetText = await generateTweet(
    `Mode: ${mode}. Market snapshot: ${JSON.stringify(snapshot)}. Write a concise market-mode tweet using this context.`
  );
  console.log(`Generated tweet (${tweetText.length} chars): ${tweetText}`);

  console.log('Posting tweet to Twitter...');
  const postedTweet = await postTweet(tweetText);
  console.log(`Tweet posted successfully. Tweet ID: ${postedTweet.id}`);

  console.log(`Market mode "${mode}" complete. No topics status update performed.`);
  process.exit(0);
}

run().catch((error) => {
  console.error('Bot run failed:', error.message);
  process.exit(1);
});
