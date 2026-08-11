/**
 * schema.org builders for QueerPulse.
 *
 * Structured data is how search engines and — disproportionately — AI retrieval
 * systems work out what a page actually is. Kept as plain builders returning
 * plain objects so they are trivially unit-testable and carry no React
 * dependency.
 */
import type { DirectoryPlace } from "../../features/marketing/directoryPlaces";
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

export interface LocalBusinessSchema {
  "@context": "https://schema.org";
  "@type": "LocalBusiness";
  name: string;
  description: string;
  url: string;
  address: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  geo?: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  image?: string;
  telephone?: string;
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: string;
    reviewCount: number;
  };
  openingHoursSpecification?: {
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string;
    opens: string;
    closes: string;
  }[];
  priceRange?: string;
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

/**
 * For a directory listing's own detail page. Fields the listing hasn't filled
 * in (coordinates, a photo, a phone number, reviews, a price-range pill) are
 * omitted entirely rather than emitted as null — an empty `aggregateRating`
 * would falsely claim a rating for a place with zero reviews.
 */
export function buildLocalBusinessSchema(
  place: DirectoryPlace,
  canonicalUrl: string,
): LocalBusinessSchema {
  const schema: LocalBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: place.name,
    description: place.tagline || place.desc,
    url: canonicalUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: place.address,
      addressLocality: place.hood,
      addressRegion: place.city ?? "Lisbon",
      addressCountry: "PT",
    },
  };

  if (place.latitude != null && place.longitude != null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: place.latitude,
      longitude: place.longitude,
    };
  }

  const image = place.photos?.wide;
  if (image) schema.image = image;

  if (place.social.phone) schema.telephone = place.social.phone;

  if (place.rating.count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: place.rating.score,
      reviewCount: place.rating.count,
    };
  }

  const priceRangePill = place.pills.find((pill) => /^€+$/.test(pill));
  if (priceRangePill) schema.priceRange = priceRangePill;

  // Real per-weekday hours (live listings) surface as an
  // OpeningHoursSpecification so the rich result can show open/closed times.
  // Templated `hoursType` fallbacks carry no concrete times, so they're skipped.
  if (place.hours) {
    const DAY_OF_WEEK: Record<string, string> = {
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
      Sun: "Sunday",
    };
    // One OpeningHoursSpecification per open interval, so a lunch-break split
    // (two intervals) emits two rows — the shape schema.org expects.
    const spec = Object.entries(place.hours).flatMap(([id, day]) =>
      day?.open
        ? day.intervals
            .filter((interval) => interval.from && interval.to)
            .map((interval) => ({
              "@type": "OpeningHoursSpecification" as const,
              dayOfWeek: DAY_OF_WEEK[id] ?? id,
              opens: interval.from,
              closes: interval.to,
            }))
        : [],
    );
    if (spec.length > 0) schema.openingHoursSpecification = spec;
  }

  return schema;
}

export interface PersonProfileInput {
  /** Display name — the person/persona the page is about. */
  name: string;
  /** Canonical page URL — root-relative path or absolute URL. */
  url: string;
  /** The persona's craft/kind label, mapped to schema.org `jobTitle`. */
  jobTitle?: string;
  /** Avatar or cover — root-relative path or absolute URL. Omitted when absent. */
  image?: string | null;
  /** Resolved external profile URLs (social links) for `sameAs`. */
  sameAs?: string[];
  /** Short description (tagline/bio). */
  description?: string;
}

export interface ProfilePageSchema {
  "@context": "https://schema.org";
  "@type": "ProfilePage";
  mainEntity: {
    "@type": "Person";
    name: string;
    url: string;
    jobTitle?: string;
    image?: string;
    sameAs?: string[];
    description?: string;
  };
}

/**
 * For a public persona / member profile page. Emits a `ProfilePage` whose
 * `mainEntity` is the `Person` — the shape Google recommends for profile pages,
 * carrying `sameAs` (verified external profiles), `jobTitle`, and an image.
 * Empty optional fields are omitted rather than emitted as null/empty so the
 * structured data never over-claims.
 */
export function buildPersonProfileSchema(
  input: PersonProfileInput,
): ProfilePageSchema {
  const person: ProfilePageSchema["mainEntity"] = {
    "@type": "Person",
    name: input.name,
    url: toAbsoluteUrl(input.url),
  };
  if (input.jobTitle) person.jobTitle = input.jobTitle;
  if (input.image) person.image = toAbsoluteUrl(input.image);
  if (input.description) person.description = input.description;
  const sameAs = input.sameAs?.filter(Boolean);
  if (sameAs && sameAs.length > 0) person.sameAs = sameAs;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: person,
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
