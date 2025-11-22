import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@database/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { YouTubeConnection } from "@/components/youtube-connection";
import { BotSettings } from "@/components/bot-settings";
import { ensureUserExists } from "@/lib/user";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureUserExists(userId);

  // Ensure bot config exists
  let botConfig = user.botConfig;
  if (!botConfig) {
    botConfig = await prisma.botConfig.create({
      data: {
        userId,
      },
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your bot and YouTube connection.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">YouTube Connection</CardTitle>
          <CardDescription>
            Connect your YouTube channel to enable the chat bot.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <YouTubeConnection
            isConnected={!!user.youtubeChannelId}
            channelName={user.youtubeChannelName || undefined}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Bot Configuration</CardTitle>
          <CardDescription>
            Customize how your bot responds in chat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BotSettings
            botName={botConfig.botName}
            triggerPhrase={botConfig.triggerPhrase}
            isActive={botConfig.isActive}
            hasYouTube={!!user.youtubeChannelId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
