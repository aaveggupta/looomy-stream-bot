import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Looomy",
  description: "Privacy Policy for Looomy - AI Co-Pilot for YouTube Live Chat",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas text-slate-200">
      {/* Header */}
      <header className="border-b border-white/5 bg-canvas/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="text-white font-display font-bold text-xl">
            Looomy
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-display font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-slate-400 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-slate-300 leading-relaxed">
              Looomy (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered YouTube live chat bot service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-white mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
              <li>Account information (email address, name) via Clerk authentication</li>
              <li>Knowledge base documents you upload (PDFs, text files)</li>
              <li>Bot configuration settings and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">2.2 YouTube Data</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              When you connect your YouTube channel, we access:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
              <li>Your YouTube channel ID and name</li>
              <li>Live chat messages from your streams (to respond to viewer questions)</li>
              <li>Ability to post chat messages on your behalf (bot responses)</li>
            </ul>
            <p className="text-slate-300 leading-relaxed">
              We do NOT collect or store viewer personal information, video content, or analytics data beyond what is necessary for the chat bot functionality.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.3 Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Usage data and interaction logs</li>
              <li>Device and browser information</li>
              <li>IP address and general location</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>To provide and maintain our chat bot service</li>
              <li>To process and respond to live chat messages on your YouTube streams</li>
              <li>To generate AI responses based on your uploaded knowledge base</li>
              <li>To improve and optimize our service</li>
              <li>To communicate with you about your account and updates</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. YouTube API Services</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Looomy uses YouTube API Services. By using our service, you agree to be bound by the YouTube Terms of Service (<a href="https://www.youtube.com/t/terms" className="text-brand hover:text-brand-glow" target="_blank" rel="noopener noreferrer">https://www.youtube.com/t/terms</a>) and Google Privacy Policy (<a href="https://policies.google.com/privacy" className="text-brand hover:text-brand-glow" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>).
            </p>
            <p className="text-slate-300 leading-relaxed">
              You can revoke Looomy&apos;s access to your YouTube data at any time through your Google Account settings at <a href="https://security.google.com/settings/security/permissions" className="text-brand hover:text-brand-glow" target="_blank" rel="noopener noreferrer">https://security.google.com/settings/security/permissions</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Storage and Security</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Secure cloud infrastructure (Vercel, encrypted databases)</li>
              <li>Access controls and authentication via Clerk</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Sharing</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We do NOT sell your personal information. We may share data with:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Service providers (hosting, authentication, AI processing)</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners in case of merger or acquisition (with notice)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
            <p className="text-slate-300 leading-relaxed">
              We retain your data for as long as your account is active. You can request deletion of your data at any time by contacting us. Upon account deletion, we will remove your personal data, uploaded documents, and bot configurations within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Your Rights</h2>
            <p className="text-slate-300 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Export your data</li>
              <li>Withdraw consent for YouTube access</li>
              <li>Object to data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              Looomy is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-slate-300 mt-4">
              Email: <a href="mailto:aaveg.codes@gmail.com" className="text-brand hover:text-brand-glow">aaveg.codes@gmail.com</a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <Link href="/" className="text-brand hover:text-brand-glow">
            &larr; Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
