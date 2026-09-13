import { seo, site, toolkit, roles } from "./content";

/**
 * The canonical origin, resolved at build time.
 * 1. NEXT_PUBLIC_SITE_URL if you set it (a custom domain)
 * 2. the Vercel production URL, which Vercel injects automatically
 * 3. the fallback in lib/content.ts
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return seo.fallbackUrl.replace(/\/+$/, "");
}

/**
 * Structured data. Only facts that are visible on the page are marked up,
 * which is what Google's structured-data guidelines ask for.
 */
export function jsonLd() {
  const url = siteUrl();
  const profiles = site.links.filter((l) => l.href).map((l) => l.href);
  const person = {
    "@type": "Person",
    "@id": `${url}/#person`,
    name: site.fullName,
    alternateName: seo.alternateNames,
    url,
    image: `${url}/opengraph-image`,
    email: `mailto:${site.email}`,
    jobTitle: seo.jobTitle,
    description: seo.longDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: seo.locality,
      addressRegion: seo.region,
      addressCountry: seo.country,
    },
    sameAs: profiles,
    knowsAbout: toolkit.groups.flatMap((g) => g.items),
    worksFor: { "@type": "Organization", name: "Walmart Global Tech" },
  };
  const website = {
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: `${site.fullName} — portfolio`,
    description: seo.longDescription,
    inLanguage: "en-US",
    publisher: { "@id": `${url}/#person` },
  };
  const profilePage = {
    "@type": "ProfilePage",
    "@id": `${url}/#page`,
    url,
    name: `${site.fullName} — ${seo.jobTitle}`,
    isPartOf: { "@id": `${url}/#website` },
    about: { "@id": `${url}/#person` },
    mainEntity: { "@id": `${url}/#person` },
    /** The five roles, so the work history is machine-readable too. */
    mentions: roles.map((r) => ({ "@type": "CreativeWork", name: r.title, about: r.role })),
  };
  return { "@context": "https://schema.org", "@graph": [person, website, profilePage] };
}
