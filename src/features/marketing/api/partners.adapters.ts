import {
  memberRefToPerson,
  tintForSlug,
  type Person,
} from "../../../shared/api/refs";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type {
  PartnerApplicationDTO,
  PartnerCardDTO,
  PartnerContact,
  PartnerDetailDTO,
} from "./partners.api";
import type {
  Contact,
  Partner,
  PartnerTestimonial,
} from "../partnerDetails.types";

// Map each backend DTO onto the EXISTING mock `Partner` view-model the pages
// already render. The API doesn't carry the prototype's display-only bits — the
// avatar tint (bg/color) and 2-letter org initials — so those are derived from
// the slug/name. Rich body strings arrive as plain text and drop straight into
// the view-model's ReactNode fields (about[], funding, timeline titles, stat
// values), which accept strings; the tab renderers add their own emphasis.

// ── avatar tint (deterministic from slug, matching the mock palette) ─────────

const TINT_CSS: Record<
  "coral" | "jade" | "plum",
  { bg: string; color: string }
> = {
  jade: { bg: "rgba(74,140,111,.15)", color: "var(--jade)" },
  coral: { bg: "rgba(232,119,90,.14)", color: "var(--accent-ink)" },
  plum: { bg: "rgba(45,27,61,.1)", color: "var(--plum)" },
};

/** Two-letter org initials for the card avatar ("Community Arts Space" → "CA"). */
function orgInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]![0] ?? ""}${words[1]![0] ?? ""}`.toUpperCase();
  }
  return (name.slice(0, 2) || "QP").toUpperCase();
}

/** Build the testimonial view-model, or null when the partner has no quote. */
function toTestimonial(dto: PartnerCardDTO): PartnerTestimonial | null {
  if (!dto.testimonialQuote || !dto.testimonialAuthor) return null;
  return {
    quote: dto.testimonialQuote,
    author: dto.testimonialAuthor,
    role: dto.testimonialRole ?? "",
    initials: orgInitials(dto.testimonialAuthor),
  };
}

/** Map the API's nullable contact fields to the view-model's optional strings. */
function toContact(c: PartnerContact | null | undefined): Contact {
  return {
    phone: c?.phone ?? undefined,
    phoneNote: c?.phoneNote ?? undefined,
    email: c?.email ?? undefined,
    website: c?.website ?? undefined,
    address: c?.address ?? undefined,
  };
}

// ── card → Partner (list) ────────────────────────────────────────────────────

/**
 * GET /partners card → the PartnersPage `Partner` view-model. Only the
 * card-facing fields are populated richly; the detail-only fields are given
 * safe empty defaults (the list never reads them).
 */
export function cardToPartner(dto: PartnerCardDTO): Partner {
  const tint = TINT_CSS[tintForSlug(dto.slug)];
  return {
    slug: dto.slug,
    av: orgInitials(dto.name),
    logo: dto.logo,
    bg: tint.bg,
    color: tint.color,
    region: dto.region,
    regionLabel: dto.regionLabel,
    name: dto.name,
    city: dto.city,
    desc: dto.desc,
    tags: dto.tags ?? [],
    featured: dto.featured,
    testimonial: toTestimonial(dto),
    // ── detail-only (defaulted; the card view doesn't read these) ──
    eyebrow: `Partner · ${dto.regionLabel}`,
    tagline: dto.desc,
    tier: dto.tier,
    since: dto.since,
    about: [],
    stats: [],
    aboutMore: [],
    jointWork: [],
    timeline: [],
    how: [],
    funding: "",
    atGlance: [],
    contact: {},
  };
}

// ── detail → Partner (full page) ─────────────────────────────────────────────

/**
 * GET /partners/:slug → the fully-populated `Partner`. Layers the rich body
 * fields (about / stats / joint work / timeline / how / contact) over the card
 * mapping. Plain API strings feed the ReactNode view-model fields directly.
 */
export function detailToPartner(dto: PartnerDetailDTO): Partner {
  return {
    ...cardToPartner(dto),
    eyebrow: dto.eyebrow,
    tagline: dto.tagline,
    about: dto.about ?? [],
    stats: (dto.stats ?? []).map((st) => ({
      value: st.value,
      label: st.label,
    })),
    aboutMore: (dto.aboutMore ?? []).map((sec) => ({
      heading: sec.heading,
      body: sec.body,
    })),
    jointWork: (dto.jointWork ?? []).map((c) => ({
      kicker: c.kicker,
      title: c.title,
      dek: c.dek,
      footLeft: c.footLeft,
      footRight: c.footRight,
    })),
    timeline: (dto.timeline ?? []).map((t) => ({
      date: t.date,
      title: t.title,
      body: t.body,
    })),
    how: (dto.how ?? []).map((sec) => ({
      heading: sec.heading,
      body: sec.body,
    })),
    funding: dto.funding ?? "",
    atGlance: (dto.atGlance ?? []).map((row) => ({
      label: row.label,
      value: row.value,
    })),
    contact: toContact(dto.contact),
  };
}

// ── application → render-ready view (admin triage) ───────────────────────────

/** A partner application flattened for the admin triage list. */
export interface PartnerApplicationView {
  id: string;
  slug: string;
  name: string;
  initials: string;
  logo: string;
  tint: AvatarTint;
  regionLabel: string;
  city: string;
  desc: string;
  tags: string[];
  tier: string;
  status: PartnerApplicationDTO["status"];
  reviewNote: string | null;
  /** Who submitted it, normalized for an avatar + name (null when omitted). */
  submittedBy: Person | null;
  /** "Submitted by <name> · <date>" line for the card meta. */
  submittedLine: string;
  createdAt: string;
}

/** Format an ISO timestamp to a short "6 Jul 2026"; "" when absent/invalid. */
function shortDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

/** A PartnerApplicationDTO → a flat view-model for the admin triage view. */
export function applicationToView(
  dto: PartnerApplicationDTO,
): PartnerApplicationView {
  const submittedBy = memberRefToPerson(dto.submittedBy);
  const when = shortDate(dto.createdAt);
  const submittedLine = [
    submittedBy ? `Submitted by ${submittedBy.name}` : "Submitted",
    when,
  ]
    .filter(Boolean)
    .join(" · ");
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    initials: orgInitials(dto.name),
    logo: dto.logo,
    tint: tintForSlug(dto.slug || dto.id),
    regionLabel: dto.regionLabel,
    city: dto.city,
    desc: dto.desc,
    tags: dto.tags ?? [],
    tier: dto.tier,
    status: dto.status,
    reviewNote: dto.reviewNote,
    submittedBy,
    submittedLine,
    createdAt: dto.createdAt,
  };
}
