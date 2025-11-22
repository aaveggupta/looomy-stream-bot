"use client";

import React from "react";
import { LogoTicker } from "./ui";
import { logos } from "@/config/design";

export const SocialProof: React.FC = () => {
  return (
    <div className="border-y border-white/5 bg-black/20">
      <LogoTicker logos={[...logos]} />
    </div>
  );
};
