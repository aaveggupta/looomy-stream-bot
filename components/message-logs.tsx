"use client";

import { useState } from "react";
import {
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Radio,
  ArrowLeft,
  User,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formatTimestamp = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

interface Stream {
  id: string;
  title: string;
  platform: string;
  status: string;
  startedAt: Date;
  endedAt: Date | null;
  messageCount: number;
  _count: {
    processedMessages: number;
  };
}

interface Message {
  id: string;
  messageId: string;
  authorName: string;
  messageText: string;
  question: string | null;
  botReply: string | null;
  processedAt: Date;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface MessageLogsProps {
  streams: Stream[];
  botName: string;
}

export function MessageLogs({ streams, botName }: MessageLogsProps) {
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMessages = async (
    streamId: string,
    page: number,
    searchQuery: string
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        streamId,
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

  const handleStreamSelect = (stream: Stream) => {
    setSelectedStream(stream);
    setSearch("");
    fetchMessages(stream.id, 1, "");
  };

  const handleBack = () => {
    setSelectedStream(null);
    setMessages([]);
    setPagination(null);
    setSearch("");
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    if (selectedStream) {
      fetchMessages(selectedStream.id, 1, value);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (selectedStream) {
      fetchMessages(selectedStream.id, newPage, search);
    }
  };

  // Show stream list
  if (!selectedStream) {
    if (streams.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Radio className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No streams yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Start monitoring a stream to see logs here
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {streams.map((stream) => (
          <button
            key={stream.id}
            onClick={() => handleStreamSelect(stream)}
            className="w-full text-left rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${
                    stream.status === "ACTIVE"
                      ? "bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"
                      : "bg-muted-foreground/30"
                  }`}
                />
                <div>
                  <h3 className="font-semibold">{stream.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {formatDate(new Date(stream.startedAt))}
                    {stream.endedAt && (
                      <span className="text-xs">
                        → {formatDate(new Date(stream.endedAt))}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {stream._count.processedMessages} messages
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {stream.status.toLowerCase()}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  // Show messages for selected stream
  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h3 className="font-semibold">{selectedStream.title}</h3>
          <p className="text-xs text-muted-foreground">
            {formatDate(new Date(selectedStream.startedAt))}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">
            {search ? "No messages found" : "No messages in this stream"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3"
              >
                {/* User message */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-400">
                        {message.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(new Date(message.processedAt))}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{message.messageText}</p>
                  </div>
                </div>

                {/* Bot reply */}
                {message.botReply && (
                  <div className="flex gap-3 pl-4 border-l-2 border-primary/30 ml-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      <Image
                        src="/icon.svg"
                        alt={botName}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">
                          {botName}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{message.botReply}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalCount
                )}{" "}
                of {pagination.totalCount} messages
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
                <span className="text-sm font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
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
          )}
        </>
      )}
    </div>
  );
}
