import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageLogs } from "@/components/message-logs";
import { prisma } from "@/lib/db";

export default async function LogsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch bot config for bot name
  const botConfig = await prisma.botConfig.findUnique({
    where: { userId },
    select: { botName: true },
  });

  const botName = botConfig?.botName || "Looomy";

  // Fetch streams with message counts
  const streams = await prisma.streamSession.findMany({
    where: {
      userId,
    },
    orderBy: {
      startedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      platform: true,
      status: true,
      startedAt: true,
      endedAt: true,
      messageCount: true,
      _count: {
        select: {
          processedMessages: true,
        },
      },
    },
    take: 50, // Last 50 streams
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Logs</h1>
        <p className="text-muted-foreground">
          View conversation history from your streams (last 3 days)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Stream Logs</CardTitle>
          <CardDescription>
            Select a stream to view its message history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MessageLogs streams={streams} botName={botName} />
        </CardContent>
      </Card>
    </div>
  );
}
