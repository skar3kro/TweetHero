import { supabase } from './db.js';
import { getNextTopic } from './getTopic.js';
import { generateTweet } from './generateTweet.js';
import { postTweet } from './postTweet.js';
import { getMarketSnapshot } from './marketData.js';

const SUPPORTED_MODES = new Set(['premarket', 'open', 'recap', 'education']);

function getMode() {
  const mode = process.env.MODE?.toLowerCase();

  if (!mode || !SUPPORTED_MODES.has(mode)) {
    return 'education';
  }

  return mode;
}

async function run() {
  const mode = getMode();
  console.log(`Running bot in MODE="${mode}"`);

  console.log('Fetching live Indian market snapshot...');
  const marketSnapshot = await getMarketSnapshot();

  console.log('Fetching next pending topic...');
  const topic = await getNextTopic();

  if (!topic) {
    console.log('No pending topics found. Exiting.');
    process.exit(0);   // Clean exit when nothing to do
  }

  console.log(`Found topic #${topic.id}: ${topic.topic ?? topic.title ?? 'Untitled topic'}`);

  console.log('Generating tweet with OpenAI...');
  const tweetText = await generateTweet({
    topic,
    mode,
    marketSnapshot
  });
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

  process.exit(0);   // Clean success exit
}

run().catch((error) => {
  console.error('Bot run failed:', error.message);
  process.exit(1);   // Proper failure exit
});
