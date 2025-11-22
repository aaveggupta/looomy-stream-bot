import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Youtube, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { BotToggle } from "@/components/bot-toggle";
import { ensureUserExists } from "@/lib/user";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureUserExists(userId);

  const hasYouTube = !!user.youtubeChannelId;
  const documentCount = user.documents.length;
  const embeddedCount = user.documents.filter((d: { isEmbedded: boolean }) => d.isEmbedded).length;
  const botConfig = user.botConfig;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Looomy. Manage your bot and knowledge base.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">YouTube</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Youtube className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {hasYouTube ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="font-semibold">Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-semibold">Not Connected</span>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{documentCount}</div>
            <p className="text-sm text-muted-foreground">
              {embeddedCount} embedded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bot Status</CardTitle>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Image src="/icon.svg" alt="Looomy" width={32} height={32} className="w-8 h-8" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {botConfig?.isActive ? (
                <>
                  <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                  <span className="font-semibold">Active</span>
                </>
              ) : (
                <>
                  <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                  <span className="font-semibold">Inactive</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Quick Actions</CardTitle>
          <CardDescription>Get started with Looomy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasYouTube && (
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
              <div>
                <h3 className="font-semibold">Connect YouTube Channel</h3>
                <p className="text-sm text-muted-foreground">
                  Link your channel to enable the chat bot
                </p>
              </div>
              <Link href="/dashboard/settings">
                <Button className="shadow-lg shadow-primary/25">Connect</Button>
              </Link>
            </div>
          )}

          {documentCount === 0 && (
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
              <div>
                <h3 className="font-semibold">Upload Knowledge Base</h3>
                <p className="text-sm text-muted-foreground">
                  Add documents for the bot to learn from
                </p>
              </div>
              <Link href="/dashboard/knowledge">
                <Button className="shadow-lg shadow-primary/25">Upload</Button>
              </Link>
            </div>
          )}

          {hasYouTube && embeddedCount > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
              <div>
                <h3 className="font-semibold">Bot Control</h3>
                <p className="text-sm text-muted-foreground">
                  Toggle the bot on/off for your live streams
                </p>
              </div>
              <BotToggle isActive={botConfig?.isActive ?? false} />
            </div>
          )}

          {hasYouTube && documentCount > 0 && embeddedCount === 0 && (
            <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div>
                <h3 className="font-semibold text-amber-500">Processing Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Your documents are being embedded. This may take a few minutes.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
