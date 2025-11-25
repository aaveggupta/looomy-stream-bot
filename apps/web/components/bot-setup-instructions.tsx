"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BotSetupInstructionsProps {
  botChannelName?: string;
  botChannelUrl?: string;
}

export function BotSetupInstructions({
  botChannelName = "Looomy",
  botChannelUrl = "https://www.youtube.com/@looomybot",
}: BotSetupInstructionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(botChannelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-blue-500/20 p-2">
          <AlertCircle className="h-5 w-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-400 mb-1">
            Setup Required: Add Bot as Moderator
          </h3>
          <p className="text-sm text-muted-foreground">
            For the bot to reply in your live chat, you must add{" "}
            <span className="font-semibold text-foreground">
              {botChannelName}
            </span>{" "}
            as a moderator to your YouTube channel.
          </p>
        </div>
      </div>

      {/* Instructions Steps */}
      <div className="space-y-3 pl-11">
        {/* Step 1 */}
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">
            1
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm text-muted-foreground">
              Go to your{" "}
              <a
                href="https://studio.youtube.com/?d=sd&sds=community"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                YouTube Studio Community Settings
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">
            2
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm text-muted-foreground">
              Scroll to{" "}
              <span className="font-medium text-foreground">
                &quot;Managing moderators&quot;
              </span>
            </p>
          </div>
        </div>

        {/* Step 3 - Channel URL with Copy */}
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">
            3
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm text-muted-foreground pt-0.5">
              Paste this channel URL:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-black/40 px-3 py-2 rounded border border-white/10 font-mono">
                {botChannelUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">
            4
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm text-muted-foreground">
              Click{" "}
              <span className="font-medium text-foreground">
                &quot;Save&quot;
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
