"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface BotSettingsProps {
  botName: string;
  triggerPhrase: string;
  isActive: boolean;
  hasYouTube: boolean;
}

export function BotSettings({
  botName: initialBotName,
  triggerPhrase: initialTriggerPhrase,
  isActive: initialIsActive,
  hasYouTube,
}: BotSettingsProps) {
  const [botName, setBotName] = useState(initialBotName);
  const [triggerPhrase, setTriggerPhrase] = useState(initialTriggerPhrase);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/bot/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botName, triggerPhrase }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="space-y-2">
          <Label htmlFor="botName">Bot Name</Label>
          <Input
            id="botName"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            placeholder="LooomyBot"
          />
          <p className="text-sm text-muted-foreground">
            This name will be used in bot responses.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="triggerPhrase">Trigger Phrase</Label>
          <Input
            id="triggerPhrase"
            value={triggerPhrase}
            onChange={(e) => setTriggerPhrase(e.target.value)}
            placeholder="@Looomy"
          />
          <p className="text-sm text-muted-foreground">
            The bot will respond when chat messages contain this phrase.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
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
