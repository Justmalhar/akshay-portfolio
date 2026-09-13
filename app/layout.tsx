import type { Metadata } from "next";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { seo, site } from "@/lib/content";
import { jsonLd, siteUrl } from "@/lib/seo";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const sans = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-sans", display: "swap" });

const url = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: `${site.fullName} — ${seo.jobTitle}`,
    template: `%s — ${site.fullName}`,
  },
  description: seo.description,
  keywords: seo.keywords,
  authors: [{ name: site.fullName, url }],
  creator: site.fullName,
  publisher: site.fullName,
  applicationName: `${site.fullName} — portfolio`,
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    firstName: "Akshay",
    lastName: "Jagtap",
    username: "akshayjagz",
    url,
    siteName: `${site.fullName} — portfolio`,
    title: `${site.fullName} — ${seo.jobTitle}`,
    description: seo.longDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.fullName} — ${seo.jobTitle}`,
    description: seo.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Paste the token from Google Search Console into NEXT_PUBLIC_GOOGLE_VERIFICATION to verify by meta tag.
  verification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION }
    : undefined,
  formatDetection: { email: false, telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // Structured data for search engines; see lib/seo.ts
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
        />
        {children}
      </body>
    </html>
  );
}
