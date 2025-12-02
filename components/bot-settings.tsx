"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { BotSetupInstructions } from "@/components/bot-setup-instructions";

interface BotSettingsProps {
  botName: string;
  triggerPhrase: string;
  isActive: boolean;
  hasYouTube: boolean;
}

export function BotSettings({
  botName,
  triggerPhrase,
  isActive: initialIsActive,
  hasYouTube,
}: BotSettingsProps) {
  const [isActive, setIsActive] = useState(initialIsActive);
  const [toggling, setToggling] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (!hasYouTube) {
      alert("Please connect your YouTube channel first");
      return;
    }

    setToggling(true);
    try {
      const endpoint = isActive ? "/api/bot/stop" : "/api/bot/start";
      const res = await fetch(endpoint, { method: "POST" });

      if (res.ok) {
        setIsActive(!isActive);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to toggle bot");
      }
    } catch (error) {
      console.error("Toggle error:", error);
      alert("Failed to toggle bot");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-lg bg-muted/50 border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Bot Name:
            </span>
            <span className="font-semibold">{botName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Trigger Phrase:
            </span>
            <code className="text-sm bg-black/30 px-2 py-1 rounded">
              {triggerPhrase}
            </code>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Users can trigger the bot by including{" "}
            <code className="bg-black/30 px-1 py-0.5 rounded">
              {triggerPhrase}
            </code>{" "}
            in their chat messages.
          </p>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-5">
          <BotSetupInstructions
            botChannelName={
              process.env.NEXT_PUBLIC_BOT_CHANNEL_NAME || "Looomy"
            }
            botChannelUrl={
              process.env.NEXT_PUBLIC_BOT_CHANNEL_URL ||
              "https://www.youtube.com/@looomybot"
            }
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Bot Status</h3>
            <p className="text-sm text-muted-foreground">
              {isActive
                ? "Bot is active and monitoring live chat"
                : "Bot is currently inactive"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={handleToggle}
              disabled={toggling || !hasYouTube}
            />
            <span className="text-sm font-medium">
              {toggling ? "..." : isActive ? "ON" : "OFF"}
            </span>
          </div>
        </div>
        {!hasYouTube && (
          <p className="mt-2 text-sm text-yellow-600">
            Connect your YouTube channel to enable the bot.
          </p>
        )}
      </div>
    </div>
  );
}
