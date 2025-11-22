// Design System Configuration for Looomy
// Centralized design tokens for consistent styling across the app

export const colors = {
  // Core canvas colors (dark theme)
  canvas: {
    DEFAULT: "#020617", // Slate 950
    secondary: "#0f172a", // Slate 900
  },
  // Brand colors (Electric Blue)
  brand: {
    DEFAULT: "#2563eb", // Blue 600
    glow: "#3b82f6", // Blue 500
    dim: "#1e3a8a", // Blue 900
  },
  // Accent colors (Emerald)
  accent: {
    DEFAULT: "#10b981", // Emerald 500
    glow: "#34d399", // Emerald 400
  },
  // Surface colors for cards and overlays
  surface: {
    DEFAULT: "rgba(255, 255, 255, 0.03)",
    hover: "rgba(255, 255, 255, 0.08)",
    border: "rgba(255, 255, 255, 0.08)",
  },
} as const;

export const typography = {
  fontFamily: {
    sans: ["Inter", "sans-serif"],
    display: ["Space Grotesk", "sans-serif"],
  },
} as const;

export const animations = {
  keyframes: {
    float: {
      "0%, 100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-20px)" },
    },
    shimmer: {
      from: { backgroundPosition: "0 0" },
      to: { backgroundPosition: "-200% 0" },
    },
    scroll: {
      to: { transform: "translate(calc(-50% - 0.5rem))" },
    },
    "pulse-glow": {
      "0%, 100%": { opacity: "0.3" },
      "50%": { opacity: "0.5" },
    },
  },
  animation: {
    float: "float 6s ease-in-out infinite",
    "float-delayed": "float 6s ease-in-out 3s infinite",
    "pulse-slow": "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    shimmer: "shimmer 2s linear infinite",
    scroll: "scroll 20s linear infinite",
    "pulse-glow": "pulse-glow 4s ease-in-out infinite",
  },
} as const;

// Content configuration for landing page
export const siteConfig = {
  name: "Looomy",
  tagline: "AI Co-Pilot for YouTube Live",
  description:
    "Deploy a smart bot that learns your content and answers viewer questions in real-time. No more repeating yourself.",
  hero: {
    title: {
      line1: "Your Chat needs a",
      line2: "Brain, not a Script.",
    },
    cta: {
      primary: "Deploy Looomy",
      secondary: "Watch Demo",
    },
  },
} as const;

export const features = [
  {
    title: "Knowledge Base",
    description:
      "Upload your lore, rules, and FAQs. Looomy learns your content instantly to answer questions accurately.",
    icon: "Upload",
    colSpan: 2,
  },
  {
    title: "Sub-Second Latency",
    description:
      "Built on high-performance infrastructure for blink-of-an-eye response times during intense moments.",
    icon: "Zap",
    colSpan: 1,
  },
  {
    title: "Context Awareness",
    description:
      "Looomy understands the current game state and conversation history.",
    icon: "Bot",
    colSpan: 1,
  },
  {
    title: "YouTube Native",
    description:
      "Seamlessly integrates with YouTube Live Chat. Connect once and let Looomy handle the rest.",
    icon: "Youtube",
    colSpan: 2,
  },
] as const;

export const steps = [
  {
    title: "Connect Channel",
    description: "One-click auth with YouTube.",
  },
  {
    title: "Upload Knowledge",
    description: "Drop in your PDFs, text files, or previous transcripts.",
  },
  {
    title: "Go Live",
    description: "Looomy automatically joins chat when you start streaming.",
  },
] as const;

export const faqs = [
  {
    question: "Does it work with OBS?",
    answer:
      "Yes! Looomy integrates directly via a browser source dock, or can run in the background monitoring your chat via API.",
  },
  {
    question: "How do I upload knowledge?",
    answer:
      "Simply drag and drop PDF, TXT files into your dashboard. We process and embed them automatically.",
  },
  {
    question: "Is there a free tier?",
    answer:
      "Absolutely. The Starter plan is free forever for up to 500 automated replies per month.",
  },
  {
    question: "What trigger phrase does the bot use?",
    answer:
      "You can customize the trigger phrase in settings. By default, it's @Looomy - viewers just mention it to ask questions.",
  },
] as const;

export const chatMessages = [
  { user: "Alex_99", text: "@Looomy What keyboard is he using?", color: "text-orange-400", isBot: false },
  { user: "Looomy", text: "@Alex_99 He's using the Keychron Q1 Pro with Gateron switches!", color: "text-brand-glow", isBot: true },
  { user: "SarahPls", text: "@Looomy Is this ranked?", color: "text-emerald-400", isBot: false },
  { user: "Looomy", text: "@SarahPls Yes! Diamond II, pushing for Ascendant tonight.", color: "text-brand-glow", isBot: true },
  { user: "PixelMage", text: "@Looomy Can I join the lobby?", color: "text-blue-400", isBot: false },
  { user: "Looomy", text: "@PixelMage Lobby is full, type !queue to join waiting list.", color: "text-brand-glow", isBot: true },
  { user: "Jinxed", text: "Pog", color: "text-pink-400", isBot: false },
  { user: "RetroFan", text: "@Looomy What song is this?", color: "text-yellow-400", isBot: false },
  { user: "Looomy", text: "@RetroFan Now playing: 'Neon Blade' by MoonDeity.", color: "text-brand-glow", isBot: true },
] as const;

export const logos = ["StreamLabs", "OBS", "YouTube", "Discord", "Patreon", "Ko-fi"];

export type Feature = (typeof features)[number];
export type Step = (typeof steps)[number];
export type FAQ = (typeof faqs)[number];
export type ChatMessage = (typeof chatMessages)[number];
