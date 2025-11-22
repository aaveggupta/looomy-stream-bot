import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"]
});

export const metadata: Metadata = {
  title: "Looomy - AI-Powered YouTube Stream Chat Bot",
  description: "Deploy a bot that answers audience questions using your custom knowledge base.",
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
