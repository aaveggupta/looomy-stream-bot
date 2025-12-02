"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Youtube, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YouTubeConnectionProps {
  isConnected: boolean;
  channelName?: string;
}

export function YouTubeConnection({
  isConnected,
  channelName,
}: YouTubeConnectionProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your YouTube channel?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/youtube/disconnect", { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to disconnect YouTube");
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      alert("Failed to disconnect YouTube");
    } finally {
      setLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <Youtube className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{channelName}</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">YouTube Connected</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleDisconnect}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Disconnect"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Youtube className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <span className="font-medium">No channel connected</span>
          <p className="text-sm text-muted-foreground">
            Connect your YouTube channel to use the bot
          </p>
        </div>
      </div>
      <Button asChild>
        <a href="/api/youtube/connect">Connect YouTube</a>
      </Button>
    </div>
  );
}
