import { memberRefToPerson, type Person } from "../../../shared/api/refs";
import type {
  Cause,
  OpportunityCardDTO,
  OpportunityDetailDTO,
  VolunteerSignupDTO,
} from "./volunteering.api";
import type {
  VolunteerCause,
  VolunteerOpportunity,
  TeamMember,
} from "../volunteerOpportunities.types";

// Map each backend DTO onto the EXISTING mock `VolunteerOpportunity` view-model
// the pages already render. Many view-model fields are prototype-only (colours,
// eyebrow, urgency copy, stat tiles, "spots" rows, applyConfirm) and are derived
// from the DTO or defaulted so nothing renders blank. ReactNode fields are fed
// plain API strings (wrapped in `<b>` only where the layout needs the styling).
// `.tsx` because the stat tiles need JSX to pick up the header's `.meta b` rule.

// ── cause (lowercase API ⇄ Title-case view-model) ────────────────────────────

const CAUSE_TITLE: Record<Cause, VolunteerCause> = {
  rights: "Rights",
  health: "Health",
  youth: "Youth",
  housing: "Housing",
  arts: "Arts",
};

const CAUSE_LOWER: Record<VolunteerCause, Cause> = {
  Rights: "rights",
  Health: "health",
  Youth: "youth",
  Housing: "housing",
  Arts: "arts",
};

/** Lowercase API cause → Title-case display cause. */
export const causeToTitle = (c: Cause): VolunteerCause => CAUSE_TITLE[c];

/** Title-case display/filter cause → lowercase API cause. */
export const causeToLower = (c: VolunteerCause): Cause => CAUSE_LOWER[c];

// ── derived display bits ─────────────────────────────────────────────────────

/** Cause-keyed avatar tint, matching the mock palette (jade / coral / plum). */
const CAUSE_TINT: Record<Cause, { bg: string; color: string }> = {
  rights: { bg: "rgba(74,140,111,.14)", color: "var(--jade)" },
  health: { bg: "rgba(232,119,90,.12)", color: "var(--accent-ink)" },
  youth: { bg: "rgba(45,27,61,.1)", color: "var(--plum)" },
  housing: { bg: "rgba(232,119,90,.12)", color: "var(--accent-ink)" },
  arts: { bg: "rgba(74,140,111,.12)", color: "var(--jade)" },
};

const TEAM_TINTS = [
  { bg: "rgba(var(--accent-rgb),.14)", color: "var(--accent-ink)" },
  { bg: "rgba(var(--jade-rgb),.16)", color: "var(--jade)" },
  { bg: "rgba(45,27,61,.10)", color: "var(--plum)" },
];

/** Two-letter org initials for the card avatar ("ILGA Portugal" → "IL"). */
function orgInitials(org: string): string {
  const words = org.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]![0] ?? ""}${words[1]![0] ?? ""}`.toUpperCase();
  }
  return (org.slice(0, 2) || "QP").toUpperCase();
}

const commitLabel = (c: OpportunityCardDTO["commit"]) =>
  c === "low" ? "Low commitment" : "Medium commitment";

/** A member ref → the mock `TeamMember` shape ("Who's already in"). */
function memberToTeam(
  ref: OpportunityDetailDTO["team"][number],
  i: number,
): TeamMember {
  const person: Person | null = memberRefToPerson(ref);
  const tint = TEAM_TINTS[i % TEAM_TINTS.length]!;
  return {
    initials: person?.initials ?? "",
    background: tint.bg,
    color: tint.color,
    name: person
      ? `${person.firstName} ${person.lastName[0] ?? ""}.`.trim()
      : "",
  };
}

// ── card → VolunteerOpportunity (list) ───────────────────────────────────────

/**
 * GET /volunteering card → the VolunteerPage `VolunteerOpportunity` view-model.
 * Only the card-facing fields are populated richly; the detail-only fields are
 * given safe placeholders (the list never reads them).
 */
export function cardToOpportunity(
  dto: OpportunityCardDTO,
): VolunteerOpportunity {
  const tint = CAUSE_TINT[dto.cause];
  const cause = causeToTitle(dto.cause);
  const closed = dto.status === "closed";
  return {
    slug: dto.slug,
    org: dto.org,
    avatar: orgInitials(dto.org),
    background: tint.bg,
    color: tint.color,
    role: dto.role,
    cause,
    commit: dto.commit,
    time: dto.time,
    location: dto.location,
    skills: dto.skills ?? [],
    description: dto.desc,
    // ── detail header (defaulted; the card view doesn't read these) ──
    eyebrow: `Volunteer · ${cause} · ${dto.org}`,
    urgent: closed ? "Closed · not recruiting" : "Recruiting now",
    titleLead: `${dto.role} · `,
    titleEm: `${dto.org}.`,
    sub: dto.desc,
    stats: [],
    why: [],
    tasks: [],
    commitments: [],
    goodFor: [],
    teamIntro: "",
    team: [],
    applyRole: `${dto.role} · ${dto.org}`,
    spotsFilled: `${dto.spotsFilled} / ${dto.spotsTotal}`,
    spotsPct: dto.spotsPct,
    spots: [],
    applyConfirm: "",
    partner: dto.partner
      ? { name: dto.partner.name, text: "", slug: dto.partner.slug }
      : null,
  };
}

// ── detail → VolunteerOpportunity (full page) ────────────────────────────────

/**
 * GET /volunteering/:slug → the fully-populated `VolunteerOpportunity`. Layers
 * the rich body fields (why / tasks / commitments / team / apply) over the card
 * mapping. Prototype-only stat tiles + "spots" rows are synthesised from the
 * available numbers so the sidebar and header render without gaps.
 */
export function detailToOpportunity(
  dto: OpportunityDetailDTO,
): VolunteerOpportunity {
  const base = cardToOpportunity(dto);
  const cause = causeToTitle(dto.cause);
  const spotsOpen = Math.max(dto.spotsTotal - dto.spotsFilled, 0);
  return {
    ...base,
    eyebrow: `Volunteer · ${cause} · ${dto.org}`,
    sub: dto.desc,
    stats: [
      { value: <b>{dto.time}</b>, label: "Per week" },
      { value: <b>{commitLabel(dto.commit)}</b>, label: "Commitment" },
      { value: <b>{spotsOpen}</b>, label: "Spots still open" },
    ],
    why: dto.why ?? [],
    tasks: (dto.tasks ?? []).map((task) => ({
      title: task.title,
      description: task.desc,
    })),
    commitments: (dto.commitments ?? []).map((c) => ({
      b: c.label,
      s: c.detail,
    })),
    goodFor: dto.goodFor ?? [],
    teamIntro: dto.teamIntro ?? "",
    team: (dto.team ?? []).map(memberToTeam),
    applyRole: dto.applyRole || base.applyRole,
    spots: [
      { label: "Role", value: dto.applyRole || base.applyRole },
      { label: "Commitment", value: commitLabel(dto.commit) },
      { label: "Per week", value: dto.time },
      { label: "Location", value: dto.location },
    ],
    applyConfirm: `Application submitted for ${dto.applyRole || base.applyRole}. The team will be in touch with next steps.`,
    partner: dto.partner
      ? {
          name: dto.partner.name,
          text: `In partnership with ${dto.partner.name}.`,
          slug: dto.partner.slug,
        }
      : null,
  };
}

// ── signup roster (poster-only) ──────────────────────────────────────────────

export interface SignupRow {
  id: string;
  person: Person | null;
  name: string;
  initials: string;
  background: string;
  color: string;
  note: string | null;
  when: string;
}

/** A signup DTO → a render-ready row for the poster's "Who's signed up" list. */
export function signupToRow(dto: VolunteerSignupDTO, i: number): SignupRow {
  const person = memberRefToPerson(dto.member);
  const tint = TEAM_TINTS[i % TEAM_TINTS.length]!;
  const when = dto.createdAt
    ? new Date(dto.createdAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      })
    : "";
  return {
    id: dto.id,
    person,
    name: person?.name ?? "A member",
    initials: person?.initials ?? "··",
    background: tint.bg,
    color: tint.color,
    note: dto.note,
    when,
  };
}
