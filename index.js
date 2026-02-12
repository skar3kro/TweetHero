import { supabase } from './db.js';
import { getNextTopic } from './getTopic.js';
import { generateTweet } from './generateTweet.js';
import { postTweet } from './postTweet.js';

async function run() {
  const mode = (process.env.MODE || "education").trim().toLowerCase();
  console.log("MODE detected:", mode);

  if (mode === "education") {
    console.log('Fetching next pending topic...');
    const topic = await getNextTopic();

    if (!topic) {
      console.log('No pending topics found. Exiting.');
      process.exit(0);
    }

    console.log(`Found topic #${topic.id}: ${topic.topic}`);
    const tweetText = await generateTweet(topic);
    await postTweet(tweetText);

    await supabase
      .from('topics')
      .update({ status: 'posted' })
      .eq('id', topic.id);

    process.exit(0);
  }

  // Market modes below
  console.log("Running market mode:", mode);

  const snapshot = await getMarketSnapshot();
  const tweetText = await generateTweet(mode, snapshot);
  await postTweet(tweetText);

  process.exit(0);
}


run().catch((error) => {
  console.error('Bot run failed:', error.message);
  process.exit(1);   // Proper failure exit
});
