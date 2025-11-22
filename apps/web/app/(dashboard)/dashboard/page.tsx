import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@database/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Youtube, Bot, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { BotToggle } from "@/components/bot-toggle";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      documents: true,
      botConfig: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const hasYouTube = !!user.youtubeChannelId;
  const documentCount = user.documents.length;
  const embeddedCount = user.documents.filter((d: { isEmbedded: boolean }) => d.isEmbedded).length;
  const botConfig = user.botConfig;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Looomy. Manage your bot and knowledge base.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">YouTube</CardTitle>
            <Youtube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {hasYouTube ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Not Connected</span>
                </>
              )}
            </div>
            {hasYouTube && user.youtubeChannelName && (
              <p className="mt-1 text-sm text-muted-foreground">
                {user.youtubeChannelName}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentCount}</div>
            <p className="text-sm text-muted-foreground">
              {embeddedCount} embedded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {botConfig?.isActive ? (
                <>
                  <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                  <span className="font-medium">Active</span>
                </>
              ) : (
                <>
                  <div className="h-3 w-3 rounded-full bg-gray-300" />
                  <span className="font-medium">Inactive</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with Looomy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasYouTube && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-medium">Connect YouTube Channel</h3>
                <p className="text-sm text-muted-foreground">
                  Link your channel to enable the chat bot
                </p>
              </div>
              <Link href="/dashboard/settings">
                <Button>Connect</Button>
              </Link>
            </div>
          )}

          {documentCount === 0 && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-medium">Upload Knowledge Base</h3>
                <p className="text-sm text-muted-foreground">
                  Add documents for the bot to learn from
                </p>
              </div>
              <Link href="/dashboard/knowledge">
                <Button>Upload</Button>
              </Link>
            </div>
          )}

          {hasYouTube && embeddedCount > 0 && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-medium">Bot Control</h3>
                <p className="text-sm text-muted-foreground">
                  Toggle the bot on/off for your live streams
                </p>
              </div>
              <BotToggle isActive={botConfig?.isActive ?? false} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
