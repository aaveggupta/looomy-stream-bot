"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./logo";
import { LandingButton } from "./ui";
import { siteConfig } from "@/config/design";

const navLinks = ["Features", "How it Works", "FAQ"];

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-canvas/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Looomy Home">
          <Logo size="md" />
          <span className="font-display font-bold text-xl tracking-tight text-white">
            {siteConfig.name}
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
          <Link href="/sign-in">
            <LandingButton variant="secondary" size="sm">
              Sign In
            </LandingButton>
          </Link>
          <Link href="/sign-up">
            <LandingButton size="sm">Get Started</LandingButton>
          </Link>
        </div>
      </div>
    </nav>
  );
};
