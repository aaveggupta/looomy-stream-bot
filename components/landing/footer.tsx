"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/design";

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Twitter", href: "https://twitter.com/looomy", external: true },
  { label: "GitHub", href: "https://github.com/looomy", external: true },
];

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 py-12 px-6 bg-canvas-secondary">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.svg" alt="Looomy Logo" width={32} height={32} className="w-8 h-8" />
          <span className="font-display font-bold text-xl text-white">
            {siteConfig.name}
          </span>
        </Link>
        <div className="flex flex-wrap gap-8 text-sm text-slate-400">
          {footerLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </div>
        <div className="text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} Looomy Inc.
        </div>
      </div>
    </footer>
  );
};
