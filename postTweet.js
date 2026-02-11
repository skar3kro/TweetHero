import { TwitterApi } from 'twitter-api-v2';

const appKey = process.env.TWITTER_API_KEY;
const appSecret = process.env.TWITTER_API_SECRET;
const accessToken = process.env.TWITTER_ACCESS_TOKEN;
const accessSecret = process.env.TWITTER_ACCESS_SECRET;

if (!appKey || !appSecret || !accessToken || !accessSecret) {
  throw new Error(
    'Missing one or more Twitter environment variables: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET.'
  );
}

const twitterClient = new TwitterApi({
  appKey,
  appSecret,
  accessToken,
  accessSecret
});

export async function postTweet(text) {
  if (!text?.trim()) {
    throw new Error('Tweet text is required.');
  }

  const response = await twitterClient.v2.tweet(text.trim());
  return response.data;
}
