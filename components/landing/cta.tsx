"use client";

import React from "react";
import { LandingButton } from "./ui";
import { siteConfig } from "@/config/design";

export const CTA: React.FC = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand to-accent-landing rounded-3xl blur opacity-30" />
        <div className="relative bg-surface border border-white/10 rounded-3xl p-12 md:p-24 text-center overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 text-white relative z-10">
            Ready to upgrade your stream?
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto relative z-10">
            Join the private beta and be among the first to experience AI-powered chat management.
          </p>
          <div className="flex justify-center relative z-10">
            <a href={siteConfig.waitlistUrl} target="_blank" rel="noopener noreferrer">
              <LandingButton size="lg" className="min-w-[200px]">
                Join Waitlist
              </LandingButton>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
