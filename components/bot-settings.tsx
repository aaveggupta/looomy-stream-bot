"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { BotSetupInstructions } from "@/components/bot-setup-instructions";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sparkles,
  Briefcase,
  Zap,
  Flame,
  Coffee,
  Heart,
  Code,
  Smile,
  Bot,
  MessageSquare
} from "lucide-react";

type BotPersonality =
  | "FRIENDLY"
  | "PROFESSIONAL"
  | "EXCITED"
  | "ROASTING"
  | "CHILL"
  | "MOTIVATIONAL"
  | "TECHNICAL"
  | "HUMOROUS";

interface BotSettingsProps {
  botName: string;
  triggerPhrase: string;
  personality: BotPersonality;
  isActive: boolean;
  hasYouTube: boolean;
}

const personalityConfig: Record<
  BotPersonality,
  { label: string; description: string; icon: any; color: string }
> = {
  FRIENDLY: {
    label: "Friendly",
    description: "Warm and casual, like chatting with a friend",
    icon: Heart,
    color: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  },
  PROFESSIONAL: {
    label: "Professional",
    description: "Polite and formal, suitable for business",
    icon: Briefcase,
    color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
  },
  EXCITED: {
    label: "Excited",
    description: "High energy and enthusiastic about everything!",
    icon: Zap,
    color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
  },
  ROASTING: {
    label: "Roasting",
    description: "Playfully sarcastic and teasing (all in good fun)",
    icon: Flame,
    color: "from-red-500/20 to-orange-500/20 border-red-500/30",
  },
  CHILL: {
    label: "Chill",
    description: "Laid back and relaxed, goes with the flow",
    icon: Coffee,
    color: "from-cyan-500/20 to-teal-500/20 border-cyan-500/30",
  },
  MOTIVATIONAL: {
    label: "Motivational",
    description: "Encouraging and supportive, here to inspire",
    icon: Sparkles,
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  },
  TECHNICAL: {
    label: "Technical",
    description: "Detailed and precise, loves the technical stuff",
    icon: Code,
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  },
  HUMOROUS: {
    label: "Humorous",
    description: "Jokes and puns, keeping things light and funny",
    icon: Smile,
    color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  },
};

export function BotSettings({
  botName,
  triggerPhrase,
  personality: initialPersonality,
  isActive: initialIsActive,
  hasYouTube,
}: BotSettingsProps) {
  const [isActive, setIsActive] = useState(initialIsActive);
  const [personality, setPersonality] = useState(initialPersonality);
  const [toggling, setToggling] = useState(false);
  const [updating, setUpdating] = useState(false);
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

  const handlePersonalityChange = async (newPersonality: BotPersonality) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/bot/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personality: newPersonality }),
      });

      if (res.ok) {
        setPersonality(newPersonality);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update personality");
      }
    } catch (error) {
      console.error("Update personality error:", error);
      alert("Failed to update personality");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="group relative overflow-hidden rounded-xl border-2 border-border bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-5 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-background/80">
                <Bot className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Bot Name
                </p>
                <p className="text-lg font-bold text-foreground truncate">
                  {botName}
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border-2 border-border bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-5 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-background/80">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Trigger Phrase
                </p>
                <code className="text-base font-bold text-foreground bg-black/20 dark:bg-white/10 px-3 py-1.5 rounded-lg inline-block">
                  {triggerPhrase}
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted/30 border border-dashed p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Users can trigger the bot by including{" "}
            <code className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
              {triggerPhrase}
            </code>{" "}
            in their chat messages.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold mb-1">Bot Personality</h3>
            <p className="text-sm text-muted-foreground">
              Choose how your bot interacts with viewers
            </p>
          </div>

          <RadioGroup
            value={personality}
            onValueChange={(value: string) => handlePersonalityChange(value as BotPersonality)}
            disabled={updating}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {(Object.entries(personalityConfig) as [BotPersonality, typeof personalityConfig[BotPersonality]][]).map(
              ([key, config]) => {
                const Icon = config.icon;
                const isSelected = personality === key;

                return (
                  <Label
                    key={key}
                    htmlFor={key}
                    className={`
                      relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-200
                      hover:shadow-md hover:scale-[1.02]
                      ${isSelected
                        ? `bg-gradient-to-br ${config.color} shadow-lg scale-[1.02]`
                        : 'bg-muted/30 border-border hover:border-muted-foreground/30'
                      }
                      ${updating ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <RadioGroupItem
                      value={key}
                      id={key}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3 w-full">
                      <div className={`
                        p-2 rounded-lg
                        ${isSelected ? 'bg-background/80' : 'bg-background/50'}
                      `}>
                        <Icon className={`
                          h-5 w-5
                          ${isSelected ? 'text-primary' : 'text-muted-foreground'}
                        `} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`
                            font-semibold text-sm
                            ${isSelected ? 'text-foreground' : 'text-foreground/90'}
                          `}>
                            {config.label}
                          </span>
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                        <p className={`
                          text-xs leading-relaxed
                          ${isSelected ? 'text-foreground/80' : 'text-muted-foreground'}
                        `}>
                          {config.description}
                        </p>
                      </div>
                    </div>
                  </Label>
                );
              }
            )}
          </RadioGroup>

          {updating && (
            <p className="text-xs text-muted-foreground text-center animate-pulse">
              Updating personality...
            </p>
          )}
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
