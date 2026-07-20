/**
 * schema.org builders for QueerPulse.
 *
 * Structured data is how search engines and — disproportionately — AI retrieval
 * systems work out what a page actually is. Kept as plain builders returning
 * plain objects so they are trivially unit-testable and carry no React
 * dependency.
 */
import { SITE_ORIGIN, defaultMeta, toAbsoluteUrl } from "./seo.data";

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface BreadcrumbStep {
  name: string;
  path: string;
}

export interface MedicalWebPageInput {
  name: string;
  description: string;
  path: string;
}

export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  areaServed: string;
}

export interface FaqSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

export interface MedicalWebPageSchema {
  "@context": "https://schema.org";
  "@type": "MedicalWebPage";
  name: string;
  description: string;
  url: string;
  publisher: {
    "@type": "Organization";
    name: string;
  };
}

export interface BreadcrumbSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

/** Site-level identity. Render once, on the homepage. */
export function buildOrganizationSchema(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: defaultMeta.siteName,
    url: SITE_ORIGIN,
    logo: toAbsoluteUrl(defaultMeta.image),
    description: defaultMeta.description,
    areaServed: "Lisbon, Portugal",
  };
}

/** For glossary / 101-style pages built from question-and-answer pairs. */
export function buildFaqSchema(entries: FaqEntry[]): FaqSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

/**
 * For health resource pages. MedicalWebPage tells search and AI systems this is
 * health guidance rather than commercial content, which affects both how it is
 * surfaced and how carefully it is treated.
 */
export function buildMedicalWebPageSchema(
  input: MedicalWebPageInput,
): MedicalWebPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: input.name,
    description: input.description,
    url: toAbsoluteUrl(input.path),
    publisher: { "@type": "Organization", name: defaultMeta.siteName },
  };
}

export function buildBreadcrumbSchema(trail: BreadcrumbStep[]): BreadcrumbSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, stepIndex) => ({
      "@type": "ListItem",
      position: stepIndex + 1,
      name: step.name,
      item: toAbsoluteUrl(step.path),
    })),
  };
}
