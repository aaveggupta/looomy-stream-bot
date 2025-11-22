"use client";

import React from "react";
import { Section, Accordion, LandingButton } from "./ui";
import { faqs } from "@/config/design";

export const FAQ: React.FC = () => {
  return (
    <Section id="faq">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 mb-8">
            Can&apos;t find the answer you&apos;re looking for? Join our Discord
            community.
          </p>
          <a href="https://discord.gg/looomy" target="_blank" rel="noopener noreferrer">
            <LandingButton variant="outline">Join Discord</LandingButton>
          </a>
        </div>
        <div className="md:col-span-8">
          <Accordion items={[...faqs]} />
        </div>
      </div>
    </Section>
  );
};
