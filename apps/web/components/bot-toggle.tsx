"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

interface BotToggleProps {
  isActive: boolean;
}

export function BotToggle({ isActive }: BotToggleProps) {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(isActive);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      const endpoint = active ? "/api/bot/stop" : "/api/bot/start";
      const res = await fetch(endpoint, { method: "POST" });

      if (res.ok) {
        setActive(!active);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to toggle bot");
      }
    } catch (error) {
      console.error("Failed to toggle bot:", error);
      alert("Failed to toggle bot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={active}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
      <span className="text-sm">
        {loading ? "Loading..." : active ? "ON" : "OFF"}
      </span>
    </div>
  );
}
