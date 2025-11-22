import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Navbar,
  Hero,
  SocialProof,
  Features,
  HowItWorks,
  FAQ,
  CTA,
  Footer,
} from "@/components/landing";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-canvas text-slate-200 selection:bg-brand/30">
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
