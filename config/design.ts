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
    "Deploy a smart bot with personality that learns your content and answers viewer questions in real-time. Choose from 8 unique personalities and run up to 3 streams simultaneously.",
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
    title: "8 Unique Personalities",
    description:
      "Choose from Friendly, Professional, Excited, Roasting, Chill, Motivational, Technical, or Humorous. Each personality has its own icon, color, and voice to perfectly match your brand.",
    icon: "Bot",
    colSpan: 2,
  },
  {
    title: "Multi-Stream Ready",
    description:
      "Run up to 3 concurrent streams simultaneously. Each stream is monitored independently with smart polling that adapts to chat activity.",
    icon: "Zap",
    colSpan: 1,
  },
  {
    title: "Smart Knowledge Base",
    description:
      "Upload your PDFs and guides. Your bot learns instantly and answers questions accurately using your content as context.",
    icon: "Upload",
    colSpan: 1,
  },
  {
    title: "Message Logs & Analytics",
    description:
      "Track every interaction with detailed logs. See what questions viewers are asking, how your bot responds, and measure engagement over time.",
    icon: "Youtube",
    colSpan: 2,
  },
] as const;

export const steps = [
  {
    title: "Connect Channel",
    description: "One-click connection with YouTube. Secure and verified by Google.",
  },
  {
    title: "Choose Personality",
    description: "Pick from 8 unique personalities. Each has its own color, icon, and voice that matches your style.",
  },
  {
    title: "Upload Knowledge",
    description: "Drop in your PDFs and text files. Your bot learns instantly and remembers everything.",
  },
  {
    title: "Go Live",
    description: "Bot automatically joins your streams and answers viewer questions in real-time.",
  },
] as const;

export const faqs = [
  {
    question: "Can I customize the bot's personality?",
    answer:
      "Yes! Choose from 8 unique personalities: Friendly, Professional, Excited, Roasting, Chill, Motivational, Technical, or Humorous. Each has its own voice and style.",
  },
  {
    question: "How many concurrent streams can I run?",
    answer:
      "You can run up to 3 concurrent streams simultaneously. Each stream is monitored independently with smart polling that adapts to your chat activity.",
  },
  {
    question: "How do I upload knowledge?",
    answer:
      "Simply drag and drop PDF or TXT files into your dashboard. We automatically process them so your bot can learn and answer questions accurately.",
  },
  {
    question: "Can I see what questions viewers are asking?",
    answer:
      "Absolutely! The Message Logs page shows every interaction with detailed analytics. See questions, bot replies, and track engagement over time.",
  },
  {
    question: "What trigger phrase does the bot use?",
    answer:
      "Customizable in settings. Default is @looomybot - viewers just mention it to ask questions. The bot only responds when triggered, so it won't spam chat.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes! We use enterprise-grade security with verified Google authentication. Your credentials are encrypted and stored securely.",
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
