// Quick script to test if bot token has correct permissions
// Run: node apps/web/test-bot-token.js

const { google } = require('googleapis');

async function testBotToken() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.BOT_YOUTUBE_REFRESH_TOKEN
  });

  try {
    // Try to refresh the token
    const { credentials } = await oauth2Client.refreshAccessToken();
    console.log('✅ Token is valid');
    console.log('Scopes:', credentials.scope);

    // Check if we have the right scope
    if (credentials.scope?.includes('youtube.force-ssl')) {
      console.log('✅ Has youtube.force-ssl scope (can send messages)');
    } else {
      console.log('❌ Missing youtube.force-ssl scope');
      console.log('You need to regenerate the token with correct permissions');
    }

    // Try to get bot's channel info
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const response = await youtube.channels.list({
      part: ['snippet'],
      mine: true,
    });

    const channel = response.data.items?.[0];
    console.log('✅ Bot channel:', channel?.snippet?.title);
    console.log('Bot channel ID:', channel?.id);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBotToken();
