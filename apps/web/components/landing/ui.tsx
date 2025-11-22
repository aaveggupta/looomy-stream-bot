"use client";

import React, { useRef, useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Button Component ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const LandingButton: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const sizes = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variants = {
    primary:
      "bg-brand text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] border border-brand-glow/20",
    secondary: "bg-white text-slate-900 hover:bg-slate-100",
    outline:
      "bg-transparent border border-surface-border text-slate-300 hover:text-white hover:border-white/30 hover:bg-white/5",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-full font-medium flex items-center justify-center gap-2 transition-all duration-300",
        sizes[size],
        variants[variant],
        className
      )}
      {...(props as unknown as HTMLMotionProps<"button">)}
    >
      {children}
    </motion.button>
  );
};

// --- Section Component ---
export const Section: React.FC<{
  children: React.ReactNode;
  className?: string;
  id?: string;
}> = ({ children, className = "", id }) => (
  <section
    id={id}
    className={cn("py-20 md:py-32 px-6 relative z-10", className)}
  >
    <div className="max-w-7xl mx-auto">{children}</div>
  </section>
);

// --- Badge Component ---
export const Badge: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <span
    className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand-glow border border-brand/20 backdrop-blur-sm",
      className
    )}
  >
    {children}
  </span>
);

// --- Spotlight Card Component ---
export const SpotlightCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-surface-border bg-surface p-8",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(37,99,235,0.15), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

// --- Accordion Component ---
export const Accordion: React.FC<{
  items: { question: string; answer: string }[];
}> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="border border-surface-border rounded-xl bg-surface overflow-hidden"
        >
          <button
            onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
            className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
          >
            <span className="font-medium text-slate-200">{item.question}</span>
            <motion.div
              animate={{ rotate: activeIndex === idx ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-slate-500" />
            </motion.div>
          </button>
          <motion.div
            initial={false}
            animate={{
              height: activeIndex === idx ? "auto" : 0,
              opacity: activeIndex === idx ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 pt-0 text-slate-400 leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

// --- Logo Ticker Component ---
export const LogoTicker: React.FC<{ logos: string[] }> = ({ logos }) => {
  return (
    <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] py-10">
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 animate-scroll">
        {logos.concat(logos).map((logo, i) => (
          <li
            key={i}
            className="text-2xl font-display font-bold text-white/20 uppercase tracking-widest whitespace-nowrap select-none"
          >
            {logo}
          </li>
        ))}
      </ul>
      <ul
        className="flex items-center justify-center md:justify-start [&_li]:mx-8 animate-scroll"
        aria-hidden="true"
      >
        {logos.concat(logos).map((logo, i) => (
          <li
            key={i}
            className="text-2xl font-display font-bold text-white/20 uppercase tracking-widest whitespace-nowrap select-none"
          >
            {logo}
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- FadeIn Animation Wrapper ---
export const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// --- Glass Panel Component ---
export const GlassPanel: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={cn(
      "bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-2xl",
      className
    )}
  >
    {children}
  </div>
);
