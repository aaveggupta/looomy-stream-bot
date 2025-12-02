import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Looomy",
  description: "Terms of Service for Looomy - AI Co-Pilot for YouTube Live Chat",
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-display font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-slate-400 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              By accessing or using Looomy (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p className="text-slate-300 leading-relaxed">
              Looomy is an AI-powered chat bot service for YouTube live streams. The Service allows content creators to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-4">
              <li>Connect their YouTube channel</li>
              <li>Upload knowledge base documents</li>
              <li>Deploy an AI bot that automatically responds to viewer questions in live chat</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Account Registration</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              To use Looomy, you must:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Be at least 13 years of age</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be responsible for all activities under your account</li>
              <li>Have the authority to connect the YouTube channel you link</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. YouTube API Compliance</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              By using Looomy, you acknowledge that:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Our Service uses YouTube API Services</li>
              <li>You agree to comply with YouTube&apos;s Terms of Service (<a href="https://www.youtube.com/t/terms" className="text-brand hover:text-brand-glow" target="_blank" rel="noopener noreferrer">https://www.youtube.com/t/terms</a>)</li>
              <li>You agree to Google&apos;s Privacy Policy (<a href="https://policies.google.com/privacy" className="text-brand hover:text-brand-glow" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>)</li>
              <li>You will not use the Service to violate YouTube&apos;s Community Guidelines</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              You agree NOT to use Looomy to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Send spam, unsolicited messages, or automated bulk messages</li>
              <li>Harass, abuse, or harm other users or viewers</li>
              <li>Distribute malware, viruses, or harmful content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Manipulate or artificially inflate engagement metrics</li>
              <li>Upload illegal, offensive, or harmful content to your knowledge base</li>
              <li>Circumvent rate limits or abuse the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. User Content</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              You retain ownership of content you upload (knowledge base documents). By uploading content, you grant Looomy a license to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Process and store your content</li>
              <li>Generate AI embeddings from your content</li>
              <li>Use your content to generate bot responses</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              You are responsible for ensuring you have the rights to upload any content and that it does not violate third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. AI-Generated Responses</h2>
            <p className="text-slate-300 leading-relaxed">
              Looomy uses artificial intelligence to generate chat responses. You acknowledge that:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-4">
              <li>AI responses may not always be accurate or appropriate</li>
              <li>You are responsible for monitoring bot activity on your channel</li>
              <li>You can disable the bot at any time</li>
              <li>Looomy is not liable for AI-generated content posted on your behalf</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Pricing and Payment</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Looomy offers both free and paid plans:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Free tier: Limited to 500 automated replies per month</li>
              <li>Paid plans: Additional features and higher limits (pricing available on website)</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              Paid subscriptions are billed in advance. Refunds are provided at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Service Availability</h2>
            <p className="text-slate-300 leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted service. We may:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-4">
              <li>Perform maintenance with or without notice</li>
              <li>Modify or discontinue features</li>
              <li>Experience downtime due to third-party services (YouTube, hosting providers)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
            <p className="text-slate-300 leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate these Terms. You may cancel your account at any time through your dashboard or by contacting us. Upon termination, your data will be deleted in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Disclaimer of Warranties</h2>
            <p className="text-slate-300 leading-relaxed">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, SECURE, OR UNINTERRUPTED.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, LOOOMY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Indemnification</h2>
            <p className="text-slate-300 leading-relaxed">
              You agree to indemnify and hold harmless Looomy and its affiliates from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. Changes to Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update these Terms from time to time. We will notify you of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">15. Governing Law</h2>
            <p className="text-slate-300 leading-relaxed">
              These Terms shall be governed by the laws of India, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">16. Contact</h2>
            <p className="text-slate-300 leading-relaxed">
              For questions about these Terms, please contact us at:
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
