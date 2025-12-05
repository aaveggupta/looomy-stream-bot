"use client";

import React from "react";
import Image from "next/image";
import { Upload, Zap, Youtube } from "lucide-react";
import { Section, SpotlightCard } from "./ui";
import { features } from "@/config/design";

const iconMap: Record<string, React.ReactNode> = {
  Upload: <Upload className="w-6 h-6 text-brand-glow" />,
  Zap: <Zap className="w-6 h-6 text-accent-landing-glow" />,
  Bot: <Image src="/icon.svg" alt="Looomy" width={24} height={24} className="w-6 h-6" />,
  Youtube: <Youtube className="w-6 h-6 text-red-500" />,
};

export const Features: React.FC = () => {
  return (
    <Section id="features">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white">
          Built for creators who value their time
        </h2>
        <p className="text-slate-400 text-lg">
          Stop repeating yourself in chat. Your bot handles FAQs while you focus on creating amazing content.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <SpotlightCard
            key={idx}
            className={feature.colSpan === 2 ? "md:col-span-2" : "md:col-span-1"}
          >
            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 border border-white/10">
              {iconMap[feature.icon]}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
            <p className="text-slate-400 leading-relaxed">{feature.description}</p>
          </SpotlightCard>
        ))}
      </div>
    </Section>
  );
};
