"use client";

import React from "react";
import { Youtube, Upload, Check } from "lucide-react";
import { Section, Badge, SpotlightCard, LandingButton } from "./ui";
import { steps, siteConfig } from "@/config/design";

export const HowItWorks: React.FC = () => {
  return (
    <Section id="how-it-works" className="bg-canvas-secondary">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <Badge className="mb-6">Workflow</Badge>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-8 text-white">
            Setup in seconds, <br /> not hours.
          </h2>
          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6 relative">
                {i !== steps.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-[-20px] w-0.5 bg-white/10" />
                )}
                <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-glow font-bold shrink-0 relative z-10">
                  {i + 1}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    {step.title}
                  </h4>
                  <p className="text-slate-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-brand to-accent-landing blur-[100px] opacity-20" />
          <SpotlightCard className="relative bg-canvas">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded flex items-center justify-center">
                    <Youtube className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="font-medium text-white">Your Channel</span>
                </div>
                <div className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Connected
                </div>
              </div>
              <div className="p-8 border-2 border-dashed border-white/10 rounded-lg bg-white/5 text-center">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">
                  Drop knowledge base files here
                </p>
              </div>
              <a href={siteConfig.waitlistUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block">
                <LandingButton className="w-full">Join Waitlist</LandingButton>
              </a>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </Section>
  );
};
