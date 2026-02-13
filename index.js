import { generateTweet } from './generateTweet.js';
import { postTweet } from './postTweet.js';
import { getMarketSnapshot } from './marketData.js';

async function run() {
  const mode = (process.env.MODE || "education").trim().toLowerCase();
  console.log("MODE detected:", mode);

  let tweetText;

  if (mode === "education") {
    console.log("Generating autonomous education tweet...");
    tweetText = await generateTweet("education", null);
  } else {
    console.log(`Running market mode: ${mode}`);
    const snapshot = await getMarketSnapshot();
    console.log("Market snapshot fetched.");
    tweetText = await generateTweet(mode, snapshot);
  }

  console.log(`Generated tweet (${tweetText.length} chars)`);

  console.log("Posting tweet to Twitter...");
  await postTweet(tweetText);

  console.log("Tweet posted successfully.");
  process.exit(0);
}

run().catch((error) => {
  console.error("Bot run failed:", error.message);
  process.exit(1);
});
