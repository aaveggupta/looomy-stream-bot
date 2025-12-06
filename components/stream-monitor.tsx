"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Radio,
  Loader2,
  StopCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  Play,
} from "lucide-react";
import { contactEmail } from "@/config/seo";

interface ActiveSession {
  id: string;
  title: string;
  platform: string;
  status: string;
  startedAt: string;
  lastPolledAt: string | null;
  messageCount: number;
  pollingIntervalMillis: number;
  externalBroadcastId: string;
}

interface EndedSession {
  id: string;
  title: string;
  platform: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  messageCount: number;
}

interface StreamLimits {
  current: number;
  max: number;
}

interface StreamData {
  activeSessions: ActiveSession[];
  recentEndedSessions: EndedSession[];
  limits: StreamLimits;
}

const formatDuration = (startedAt: string) => {
  const start = new Date(startedAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m`;
  }
  return `${diffMins}m`;
};

const formatTime = (date: string | null) => {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date(date));
};

export function StreamMonitor() {
  const [data, setData] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingMonitor, setStartingMonitor] = useState(false);
  const [stoppingSession, setStoppingSession] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchActiveStreams = useCallback(async () => {
    try {
      const res = await fetch("/api/streams/active");
      if (res.ok) {
        const result = await res.json();
        setData(result);
        setError(null);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to fetch streams");
      }
    } catch (err) {
      setError("Failed to fetch streams");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveStreams();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveStreams, 30000);
    return () => clearInterval(interval);
  }, [fetchActiveStreams]);

  const handleStartMonitoring = async () => {
    setStartingMonitor(true);
    setError(null);
    try {
      const res = await fetch("/api/streams/start-monitoring", {
        method: "POST",
      });
      const result = await res.json();

      if (res.ok) {
        await fetchActiveStreams();
        router.refresh();
      } else {
        setError(result.error || "Failed to start monitoring");
      }
    } catch (err) {
      setError("Failed to start monitoring");
      console.error(err);
    } finally {
      setStartingMonitor(false);
    }
  };

  const handleStopMonitoring = async (sessionId: string) => {
    setStoppingSession(sessionId);
    setError(null);
    try {
      const res = await fetch(`/api/streams/${sessionId}/stop`, {
        method: "POST",
      });
      const result = await res.json();

      if (res.ok) {
        await fetchActiveStreams();
        router.refresh();
      } else {
        setError(result.error || "Failed to stop monitoring");
      }
    } catch (err) {
      setError("Failed to stop monitoring");
      console.error(err);
    } finally {
      setStoppingSession(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const activeSessions = data?.activeSessions || [];
  const recentEndedSessions = data?.recentEndedSessions || [];
  const limits = data?.limits || { current: 0, max: 3 };
  const canStartMore = limits.current < limits.max;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Stream Monitor
            </CardTitle>
            <CardDescription>
              Monitoring {limits.current} of {limits.max} concurrent streams
            </CardDescription>
          </div>
          <Button
            onClick={handleStartMonitoring}
            disabled={startingMonitor || !canStartMore}
            className="shadow-lg shadow-primary/25"
          >
            {startingMonitor ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding Streams...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Monitoring
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Active Sessions */}
        {activeSessions.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Active Streams
            </h4>
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                    <h3 className="font-semibold truncate">{session.title}</h3>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(session.startedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {session.messageCount} messages
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStopMonitoring(session.id)}
                  disabled={stoppingSession === session.id}
                  className="ml-4 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  {stoppingSession === session.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <StopCircle className="mr-1 h-4 w-4" />
                      Stop
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-white/5 p-6 text-center">
            <Radio className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 font-medium">No active streams</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Click &quot;Start Monitoring&quot; when you go live to begin
              monitoring
            </p>
          </div>
        )}

        {/* Recent Ended Sessions */}
        {recentEndedSessions.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h4 className="text-sm font-medium text-muted-foreground">
              Recent Streams (Last 24h)
            </h4>
            <div className="space-y-2">
              {recentEndedSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    <span className="truncate">{session.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{session.messageCount} messages</span>
                    <span>
                      Ended{" "}
                      {session.endedAt ? formatTime(session.endedAt) : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage hint */}
        {!canStartMore && activeSessions.length > 0 && (
          <p className="text-sm text-amber-400">
            You&apos;ve reached the maximum of {limits.max} concurrent stream
            {limits.max === 1 ? "" : "s"}. Stop monitoring a stream to start a
            new one.
          </p>
        )}

        {/* Upgrade hint */}
        <p className="text-xs text-muted-foreground pt-2 border-t border-white/5">
          Currently monitoring up to {limits.max} stream
          {limits.max === 1 ? "" : "s"} concurrently.{" "}
          <a
            href={`mailto:${contactEmail}?subject=Increase%20Concurrent%20Streams%20Limit`}
            className="text-primary hover:underline"
          >
            Contact us
          </a>{" "}
          to monitor more streams simultaneously.
        </p>
      </CardContent>
    </Card>
  );
}
