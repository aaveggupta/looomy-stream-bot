"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BotSetupInstructions } from "@/components/bot-setup-instructions";
import { Info } from "lucide-react";

interface BotSetupModalProps {
  botChannelName?: string;
  botChannelUrl?: string;
}

export function BotSetupModal({
  botChannelName = "Looomy",
  botChannelUrl = "https://www.youtube.com/@looomybot",
}: BotSetupModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Info className="h-4 w-4" />
        Setup Instructions
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Bot Moderator Setup</DialogTitle>
            <DialogDescription>
              Follow these steps to allow the bot to reply in your live chat
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <BotSetupInstructions
              botChannelName={botChannelName}
              botChannelUrl={botChannelUrl}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
