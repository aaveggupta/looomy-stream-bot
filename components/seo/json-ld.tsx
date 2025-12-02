"use client";

import { structuredData } from "@/config/seo";

type JsonLdType = "organization" | "softwareApplication" | "website" | "faqPage";

interface JsonLdProps {
  type: JsonLdType | JsonLdType[];
}

export function JsonLd({ type }: JsonLdProps) {
  const types = Array.isArray(type) ? type : [type];

  return (
    <>
      {types.map((t) => (
        <script
          key={t}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData[t]),
          }}
        />
      ))}
    </>
  );
}

// Pre-configured components for common use cases
export function OrganizationJsonLd() {
  return <JsonLd type="organization" />;
}

export function SoftwareApplicationJsonLd() {
  return <JsonLd type="softwareApplication" />;
}

export function WebsiteJsonLd() {
  return <JsonLd type="website" />;
}

export function FAQPageJsonLd() {
  return <JsonLd type="faqPage" />;
}

export function HomePageJsonLd() {
  return <JsonLd type={["organization", "softwareApplication", "website", "faqPage"]} />;
}
