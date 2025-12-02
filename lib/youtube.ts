import { google } from "googleapis";

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl(state: string) {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube.force-ssl",
    ],
    state,
    prompt: "consent",
  });
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function getYouTubeClient(refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  // Refresh access token
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(credentials);

  return google.youtube({ version: "v3", auth: oauth2Client });
}

export async function getBotYouTubeClient() {
  const botRefreshToken = process.env.BOT_YOUTUBE_REFRESH_TOKEN;
  if (!botRefreshToken) {
    throw new Error("BOT_YOUTUBE_REFRESH_TOKEN not configured");
  }
  return getYouTubeClient(botRefreshToken);
}

export async function getBotChannelId() {
  const botRefreshToken = process.env.BOT_YOUTUBE_REFRESH_TOKEN;
  if (!botRefreshToken) {
    throw new Error("BOT_YOUTUBE_REFRESH_TOKEN not configured");
  }
  const channelInfo = await getChannelInfo(botRefreshToken);
  return channelInfo.id;
}

export async function getChannelInfo(refreshToken: string) {
  const youtube = await getYouTubeClient(refreshToken);
  const response = await youtube.channels.list({
    part: ["snippet"],
    mine: true,
  });

  const channel = response.data.items?.[0];
  if (!channel) {
    throw new Error("No channel found");
  }

  return {
    id: channel.id!,
    name: channel.snippet?.title || "Unknown Channel",
  };
}

export async function getActiveLiveBroadcast(refreshToken: string) {
  const youtube = await getYouTubeClient(refreshToken);
  const response = await youtube.liveBroadcasts.list({
    part: ["snippet", "status"],
    broadcastStatus: "active",
    broadcastType: "all",
  });

  const broadcast = response.data.items?.[0];
  if (!broadcast) {
    return null;
  }

  return {
    id: broadcast.id!,
    title: broadcast.snippet?.title || "Live Stream",
    liveChatId: broadcast.snippet?.liveChatId,
  };
}

export async function getLiveChatMessages(
  refreshToken: string,
  liveChatId: string,
  pageToken?: string
) {
  const youtube = await getYouTubeClient(refreshToken);
  const response = await youtube.liveChatMessages.list({
    liveChatId,
    part: ["snippet", "authorDetails"],
    pageToken,
  });

  return {
    messages: response.data.items || [],
    nextPageToken: response.data.nextPageToken,
    pollingIntervalMillis: response.data.pollingIntervalMillis || 5000,
  };
}

export async function sendLiveChatMessage(
  refreshToken: string,
  liveChatId: string,
  message: string
) {
  const youtube = await getYouTubeClient(refreshToken);
  await youtube.liveChatMessages.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        liveChatId,
        type: "textMessageEvent",
        textMessageDetails: {
          messageText: message,
        },
      },
    },
  });
}

export async function sendLiveChatMessageAsBot(
  liveChatId: string,
  message: string
) {
  const youtube = await getBotYouTubeClient();
  await youtube.liveChatMessages.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        liveChatId,
        type: "textMessageEvent",
        textMessageDetails: {
          messageText: message,
        },
      },
    },
  });
}
