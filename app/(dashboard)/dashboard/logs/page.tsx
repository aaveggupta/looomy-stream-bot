import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageLogs } from "@/components/message-logs";
import { prisma } from "@/lib/db";

export default async function LogsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch initial messages
  const [messages, totalCount] = await Promise.all([
    prisma.processedMessage.findMany({
      where: {
        streamSession: {
          userId,
        },
      },
      take: 10,
      orderBy: {
        processedAt: "desc",
      },
      select: {
        id: true,
        messageId: true,
        authorName: true,
        messageText: true,
        question: true,
        botReply: true,
        processedAt: true,
        streamSession: {
          select: {
            title: true,
            platform: true,
          },
        },
      },
    }),
    prisma.processedMessage.count({
      where: {
        streamSession: {
          userId,
        },
      },
    }),
  ]);

  const pagination = {
    page: 1,
    limit: 10,
    totalCount,
    totalPages: Math.ceil(totalCount / 10),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Logs</h1>
        <p className="text-muted-foreground">
          Search through logs from the last 7 days.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Messages</CardTitle>
          <CardDescription>
            All messages processed by your bot during live streams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MessageLogs
            initialMessages={messages}
            initialPagination={pagination}
          />
        </CardContent>
      </Card>
    </div>
  );
}
