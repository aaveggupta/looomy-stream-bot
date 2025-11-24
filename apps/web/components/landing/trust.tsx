"use client";

import React from "react";
import { ShieldCheck, Lock, Eye, Server } from "lucide-react";
import { Section, Badge, FadeIn } from "./ui";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Verified by Google",
    description:
      "We passed Google's strict security review. Your connection is officially approved and trusted.",
  },
  {
    icon: Lock,
    title: "No Passwords Stored",
    description:
      "We never see or store your password. You sign in directly through Google's secure system.",
  },
  {
    icon: Eye,
    title: "Read-Only Access",
    description:
      "We can only read your live chat. We can't post, delete, or change anything on your channel.",
  },
  {
    icon: Server,
    title: "Your Data Stays Yours",
    description:
      "Your data is encrypted and never sold. You can disconnect and delete everything anytime.",
  },
];

export const Trust: React.FC = () => {
  return (
    <Section id="trust" className="bg-canvas">
      <div className="text-center mb-16">
        <FadeIn>
          <Badge className="mb-6">Security</Badge>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white">
            Your channel is safe with us
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            We take security seriously. Our app is verified by Google and built
            with your privacy in mind.
          </p>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trustPoints.map((point, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div className="relative group h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative h-full p-6 rounded-2xl border border-surface-border bg-surface hover:border-emerald-500/30 transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <point.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {point.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {point.description}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
};
