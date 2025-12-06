import { google } from "googleapis";
import { TIMEOUT_CONFIG } from "./config";
import { getRequiredEnv } from "./env";

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    getRequiredEnv("GOOGLE_CLIENT_ID"),
    getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    getRequiredEnv("GOOGLE_REDIRECT_URI")
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

  const getTokenPromise = oauth2Client.getToken(code);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("YouTube OAuth token exchange timeout")),
      TIMEOUT_CONFIG.YOUTUBE
    )
  );

  const { tokens } = (await Promise.race([
    getTokenPromise,
    timeoutPromise,
  ])) as Awaited<typeof getTokenPromise>;

  return tokens;
}

export async function getYouTubeClient(refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  // Refresh access token with timeout
  const refreshPromise = oauth2Client.refreshAccessToken();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("YouTube token refresh timeout")),
      TIMEOUT_CONFIG.YOUTUBE
    )
  );

  const { credentials } = (await Promise.race([
    refreshPromise,
    timeoutPromise,
  ])) as Awaited<typeof refreshPromise>;

  oauth2Client.setCredentials(credentials);

  return google.youtube({ version: "v3", auth: oauth2Client });
}

export async function getBotYouTubeClient() {
  const botRefreshToken = getRequiredEnv("BOT_YOUTUBE_REFRESH_TOKEN");
  return getYouTubeClient(botRefreshToken);
}

export async function getBotChannelId() {
  const botRefreshToken = getRequiredEnv("BOT_YOUTUBE_REFRESH_TOKEN");
  const channelInfo = await getChannelInfo(botRefreshToken);
  return channelInfo.id;
}

export async function getChannelInfo(refreshToken: string) {
  const youtube = await getYouTubeClient(refreshToken);

  const listPromise = youtube.channels.list({
    part: ["snippet"],
    mine: true,
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("YouTube API timeout")),
      TIMEOUT_CONFIG.YOUTUBE
    )
  );

  const response = (await Promise.race([
    listPromise,
    timeoutPromise,
  ])) as Awaited<typeof listPromise>;

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

  const listPromise = youtube.liveBroadcasts.list({
    part: ["snippet", "status"],
    broadcastStatus: "active",
    broadcastType: "all",
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("YouTube API timeout")),
      TIMEOUT_CONFIG.YOUTUBE
    )
  );

  const response = (await Promise.race([
    listPromise,
    timeoutPromise,
  ])) as Awaited<typeof listPromise>;

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

  const listPromise = youtube.liveChatMessages.list({
    liveChatId,
    part: ["snippet", "authorDetails"],
    pageToken,
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("YouTube API timeout")),
      TIMEOUT_CONFIG.YOUTUBE
    )
  );

  const response = (await Promise.race([
    listPromise,
    timeoutPromise,
  ])) as Awaited<typeof listPromise>;

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

  const insertPromise = youtube.liveChatMessages.insert({
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

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("YouTube send message timeout")),
      TIMEOUT_CONFIG.YOUTUBE
    )
  );

  await Promise.race([insertPromise, timeoutPromise]);
}

export async function sendLiveChatMessageAsBot(
  liveChatId: string,
  message: string
) {
  const youtube = await getBotYouTubeClient();

  const insertPromise = youtube.liveChatMessages.insert({
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

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("YouTube send message timeout")),
      TIMEOUT_CONFIG.YOUTUBE
    )
  );

  await Promise.race([insertPromise, timeoutPromise]);
}
