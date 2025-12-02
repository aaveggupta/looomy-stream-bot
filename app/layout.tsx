import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { seoConfig } from "@/config/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"]
});

export const metadata: Metadata = {
  // Base metadata
  metadataBase: new URL(seoConfig.siteUrl),
  title: seoConfig.title,
  description: seoConfig.description,
  keywords: [...seoConfig.keywords],
  authors: [...seoConfig.authors],
  creator: seoConfig.creator,
  publisher: seoConfig.publisher,
  category: seoConfig.category,

  // Canonical URL
  alternates: {
    canonical: "/",
  },

  // Robots
  robots: seoConfig.robots,

  // Open Graph
  openGraph: {
    type: "website",
    locale: seoConfig.openGraph.locale,
    url: seoConfig.siteUrl,
    siteName: seoConfig.openGraph.siteName,
    title: seoConfig.title.default,
    description: seoConfig.description,
    images: seoConfig.openGraph.images.map(img => ({ ...img })),
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: seoConfig.title.default,
    description: seoConfig.description,
    site: seoConfig.twitter.site,
    creator: seoConfig.twitter.creator,
    images: seoConfig.openGraph.images.map(img => ({ ...img })),
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },

  // Manifest
  manifest: "/manifest.json",

  // Verification (uncomment and add your codes)
  // verification: seoConfig.verification,

  // Other
  applicationName: seoConfig.siteName,
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Additional meta for AI agents and crawlers
  other: {
    "ai-content-declaration": "This website provides AI-powered chat automation for YouTube live streams.",
    "ai-purpose": "Content creator tools, live stream chat automation, viewer engagement",
    "ai-safe": "true",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#020617" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          formButtonPrimary: "bg-brand hover:bg-brand/90 shadow-lg shadow-brand/25",
          card: "bg-[#0a101f] border border-white/10 shadow-2xl",
          navbar: "bg-[#0a101f] border-b border-white/10",
          navbarButton: "text-slate-300 hover:text-white hover:bg-white/5",
          headerTitle: "text-white",
          headerSubtitle: "text-slate-400",
          socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white",
          socialButtonsBlockButtonText: "text-white",
          formFieldLabel: "text-slate-300",
          formFieldInput: "bg-white/5 border-white/10 text-white",
          footerActionLink: "text-brand hover:text-brand-glow",
          identityPreviewText: "text-white",
          identityPreviewEditButton: "text-brand",
          userButtonPopoverCard: "bg-[#0a101f] border border-white/10",
          userButtonPopoverActionButton: "hover:bg-white/5",
          userButtonPopoverActionButtonText: "text-slate-300",
          userButtonPopoverActionButtonIcon: "text-slate-400",
          userButtonPopoverFooter: "hidden",
          userPreviewMainIdentifier: "text-white",
          userPreviewSecondaryIdentifier: "text-slate-400",
          profileSectionTitleText: "text-white",
          profileSectionContent: "text-slate-300",
          formFieldInputShowPasswordButton: "text-slate-400 hover:text-white",
          avatarBox: "border-2 border-white/10",
          scrollBox: "bg-[#0a101f]",
          pageScrollBox: "bg-[#0a101f]",
          modalContent: "bg-[#0a101f] border border-white/10",
          modalCloseButton: "text-slate-400 hover:text-white",
        },
        variables: {
          colorPrimary: "#2563eb",
          colorBackground: "#0a101f",
          colorText: "#f8fafc",
          colorTextSecondary: "#94a3b8",
          colorInputBackground: "rgba(255, 255, 255, 0.05)",
          colorInputText: "#f8fafc",
          colorNeutral: "#94a3b8",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
