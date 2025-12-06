// SEO Configuration for Looomy
// Centralized SEO metadata and configuration

export const contactEmail = "aaveg.codes@gmail.com";

export const seoConfig = {
  siteName: "Looomy",
  siteUrl: "https://looomy.com",

  // Default metadata
  title: {
    default: "Looomy - AI Co-Pilot for YouTube Live Chat",
    template: "%s | Looomy",
  },

  description:
    "Deploy a smart AI bot that learns your content and answers viewer questions in real-time during YouTube live streams. No more repeating yourself.",

  keywords: [
    "YouTube live chat bot",
    "AI stream assistant",
    "live stream chat automation",
    "YouTube streaming bot",
    "AI chat moderator",
    "stream chat bot",
    "YouTube live assistant",
    "content creator tools",
    "live streaming AI",
    "chat automation",
    "viewer engagement bot",
    "YouTube creator tools",
    "stream management",
    "AI powered chatbot",
    "live stream FAQ bot",
  ],

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Looomy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Looomy - AI Co-Pilot for YouTube Live Chat",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    site: "@looomyai",
    creator: "@looomyai",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification (add your verification codes here)
  verification: {
    google: "", // Add Google Search Console verification
    yandex: "",
    yahoo: "",
    bing: "",
  },

  // Authors
  authors: [{ name: "Looomy Team", url: "https://looomy.com" }],

  // Category
  category: "Technology",

  // Creator
  creator: "Looomy",
  publisher: "Looomy",
} as const;

// Page-specific metadata
export const pageMetadata = {
  home: {
    title: "Looomy - AI Co-Pilot for YouTube Live Chat",
    description:
      "Deploy a smart AI bot that learns your content and answers viewer questions in real-time during YouTube live streams. No more repeating yourself.",
  },
  signIn: {
    title: "Sign In",
    description:
      "Sign in to your Looomy account to manage your AI-powered YouTube live chat bot.",
  },
  signUp: {
    title: "Get Started",
    description:
      "Create your Looomy account and deploy your AI-powered YouTube live chat bot in minutes.",
  },
  dashboard: {
    title: "Dashboard",
    description:
      "Manage your Looomy bot, view analytics, and configure settings.",
  },
  knowledge: {
    title: "Knowledge Base",
    description:
      "Upload and manage your knowledge base for your Looomy AI bot.",
  },
  settings: {
    title: "Settings",
    description:
      "Configure your Looomy bot settings, triggers, and integrations.",
  },
} as const;

// JSON-LD Structured Data
export const structuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Looomy",
    url: "https://looomy.com",
    logo: "https://looomy.com/logo.png",
    sameAs: ["https://twitter.com/looomyai", "https://discord.gg/looomy"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "aaveg.codes@gmail.com",
      contactType: "Customer Support",
    },
  },

  softwareApplication: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Looomy",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "AI-powered YouTube live chat bot that learns your content and answers viewer questions in real-time.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier with 500 automated replies per month",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "AI-powered chat responses",
      "Custom knowledge base",
      "Real-time YouTube Live integration",
      "Sub-second response latency",
      "Context-aware conversations",
      "OBS integration",
    ],
  },

  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Looomy",
    url: "https://looomy.com",
    description: "AI Co-Pilot for YouTube Live Chat",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://looomy.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  },

  faqPage: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does Looomy work with OBS?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Looomy integrates directly via a browser source dock, or can run in the background monitoring your chat via API.",
        },
      },
      {
        "@type": "Question",
        name: "How do I upload knowledge to Looomy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Simply drag and drop PDF, TXT files into your dashboard. We process and embed them automatically.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a free tier?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. The Starter plan is free forever for up to 500 automated replies per month.",
        },
      },
      {
        "@type": "Question",
        name: "What trigger phrase does the bot use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can customize the trigger phrase in settings. By default, it's @Looomy - viewers just mention it to ask questions.",
        },
      },
    ],
  },
} as const;

export type PageMetadataKey = keyof typeof pageMetadata;
