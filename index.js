import { supabase } from './db.js';
import { getNextTopic } from './getTopic.js';
import { generateTweet } from './generateTweet.js';
import { postTweet } from './postTweet.js';

async function run() {
  console.log('Fetching next pending topic...');
  const topic = await getNextTopic();

  if (!topic) {
    console.log('No pending topics found. Exiting.');
    return;
  }

  console.log(`Found topic #${topic.id}: ${topic.topic ?? topic.title ?? 'Untitled topic'}`);

  console.log('Generating tweet with OpenAI...');
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
}

run().catch((error) => {
  console.error('Bot run failed:', error.message);
  process.exit(1);
});
