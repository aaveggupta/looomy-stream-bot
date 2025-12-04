"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatTimestamp = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

interface Message {
  id: string;
  messageId: string;
  authorName: string;
  messageText: string;
  question: string | null;
  botReply: string | null;
  processedAt: Date;
  streamSession: {
    title: string;
    platform: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface MessageLogsProps {
  initialMessages: Message[];
  initialPagination: Pagination;
}

export function MessageLogs({
  initialMessages,
  initialPagination,
}: MessageLogsProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMessages = async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await fetch(`/api/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchMessages(1, value);
  };

  const handlePageChange = (newPage: number) => {
    fetchMessages(newPage, search);
  };

  if (messages.length === 0 && !search) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">No messages logged yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Messages will appear here once your bot starts responding in live streams
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No messages found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search query
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created At</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Stream</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <>
                    <TableRow key={message.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatTimestamp(new Date(message.processedAt))}
                      </TableCell>
                      <TableCell className="font-medium">
                        {message.authorName}
                      </TableCell>
                      <TableCell className="max-w-md">
                        {message.messageText}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {message.streamSession.title}
                      </TableCell>
                    </TableRow>
                    {message.botReply && (
                      <TableRow key={`${message.id}-bot`}>
                        <TableCell className="whitespace-nowrap">
                          {formatTimestamp(new Date(message.processedAt))}
                        </TableCell>
                        <TableCell className="font-medium">
                          {process.env.NEXT_PUBLIC_BOT_CHANNEL_NAME || "Looomy Bot"}
                        </TableCell>
                        <TableCell className="max-w-md">
                          {message.botReply}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {message.streamSession.title}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.totalCount
              )}{" "}
              of {pagination.totalCount} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
