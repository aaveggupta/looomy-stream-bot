"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";
import { LandingButton, FadeIn } from "./ui";
import { ChatPreview } from "./chat-preview";
import { siteConfig } from "@/config/design";

export const Hero: React.FC = () => {
  return (
    <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand/20 rounded-full blur-[120px] opacity-30 animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent-landing/10 rounded-full blur-[120px] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <FadeIn>
          <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tight leading-[1.1] mb-8 text-white">
            {siteConfig.hero.title.line1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-glow via-cyan-400 to-accent-landing-glow">
              {siteConfig.hero.title.line2}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {siteConfig.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={siteConfig.waitlistUrl} target="_blank" rel="noopener noreferrer">
              <LandingButton size="lg">
                {siteConfig.hero.cta.primary} <ArrowRight className="w-5 h-5" />
              </LandingButton>
            </a>
            <a href="#features">
              <LandingButton variant="outline" size="lg">
                <Play className="w-5 h-5 mr-2" /> {siteConfig.hero.cta.secondary}
              </LandingButton>
            </a>
          </div>
          <a
            href="#trust"
            className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified by Google · Your data is safe</span>
          </a>
        </FadeIn>

        {/* Hero Graphic */}
        <FadeIn delay={0.3} className="mt-24 relative">
          <div className="absolute inset-0 bg-brand blur-[100px] opacity-20" />
          <ChatPreview />
        </FadeIn>
      </div>
    </div>
  );
};
