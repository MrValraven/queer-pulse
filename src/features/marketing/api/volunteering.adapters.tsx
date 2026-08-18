import { memberRefToPerson, type Person } from "../../../shared/api/refs";
import { formatDate } from "../../../shared/lib/date";
import { orgBadgeInitials } from "../../../shared/lib/initials";
import type {
  Cause,
  OpportunityCardDTO,
  OpportunityDetailDTO,
  SignupStatus,
  UpdateOpportunityDto,
  VolunteerSignupDTO,
} from "./volunteering.api";
import type { OrganizationOption } from "./useOrganizationOptions";
import type {
  OpportunityEditDraft,
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

const commitLabel = (c: OpportunityCardDTO["commit"]) =>
  c === "low" ? "Low commitment" : "Medium commitment";

/** Comma-separated input → trimmed, non-empty entries. Mirrors
 *  `usePostOpportunityForm`'s identical (file-local, unexported) helper. */
const splitCommas = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

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
    avatar: orgBadgeInitials(dto.org),
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
    community: dto.community
      ? { name: dto.community.name, slug: dto.community.slug }
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

// ── opportunity → edit draft, and back ───────────────────────────────────────

/** The current opportunity → the edit modal's starting draft. */
export function opportunityToEditDraft(
  opp: VolunteerOpportunity,
): OpportunityEditDraft {
  return {
    org: opp.org,
    role: opp.role,
    cause: causeToLower(opp.cause),
    commit: opp.commit,
    time: opp.time,
    location: opp.location,
    skills: opp.skills.join(", "),
    description: opp.description,
    spotsTotal: String(Number(/\/\s*(\d+)/.exec(opp.spotsFilled)?.[1] ?? 0)),
    partnerSlug: opp.partner?.slug ?? "",
    communitySlug: opp.community?.slug ?? "",
  };
}

/** The edit draft → PATCH /volunteering/:slug body. Every field is sent
 * (never conditionally omitted): the draft always represents the FULL
 * desired state, so `""` for `partnerSlug`/`communitySlug` explicitly clears
 * the link rather than leaving it untouched (see `UpdateOpportunityDto`). */
export function draftToUpdateDto(
  draft: OpportunityEditDraft,
): UpdateOpportunityDto {
  return {
    org: draft.org.trim(),
    role: draft.role.trim(),
    cause: draft.cause,
    commit: draft.commit,
    time: draft.time.trim(),
    location: draft.location.trim(),
    skills: splitCommas(draft.skills),
    desc: draft.description.trim(),
    spotsTotal: Number.parseInt(draft.spotsTotal, 10),
    partnerSlug: draft.partnerSlug,
    communitySlug: draft.communitySlug,
  };
}

/**
 * The edit draft applied to the currently-rendered opportunity, so the
 * detail page reflects a save immediately without waiting on a refetch —
 * load-bearing in demo mode, where there's no server to refetch from at all
 * (mirrors `useCloseOpportunity`'s reliance on mutation state over query
 * data for its demo-mode reflection). `organizationOptions` resolves the
 * picked `partnerSlug`/`communitySlug` back to a display name.
 */
export function applyEditDraft(
  base: VolunteerOpportunity,
  draft: OpportunityEditDraft,
  organizationOptions: OrganizationOption[],
): VolunteerOpportunity {
  const cause = causeToTitle(draft.cause);
  const skills = splitCommas(draft.skills);
  const spotsTotal = Number.parseInt(draft.spotsTotal, 10);
  const filledMatch = /(\d+)\s*\/\s*\d+/.exec(base.spotsFilled);
  const filled = filledMatch ? Number(filledMatch[1]) : 0;
  const spotsOpen = Math.max(spotsTotal - filled, 0);
  const partnerOption = draft.partnerSlug
    ? organizationOptions.find(
        (o) => o.kind === "partner" && o.slug === draft.partnerSlug,
      )
    : undefined;
  const communityOption = draft.communitySlug
    ? organizationOptions.find(
        (o) => o.kind === "community" && o.slug === draft.communitySlug,
      )
    : undefined;

  return {
    ...base,
    org: draft.org,
    avatar: orgBadgeInitials(draft.org),
    role: draft.role,
    cause,
    commit: draft.commit,
    time: draft.time,
    location: draft.location,
    skills,
    description: draft.description,
    sub: draft.description,
    eyebrow: `Volunteer · ${cause} · ${draft.org}`,
    titleLead: `${draft.role} · `,
    titleEm: `${draft.org}.`,
    stats: [
      { value: <b>{draft.time}</b>, label: "Per week" },
      { value: <b>{commitLabel(draft.commit)}</b>, label: "Commitment" },
      { value: <b>{spotsOpen}</b>, label: "Spots still open" },
    ],
    spotsFilled: `${filled} / ${spotsTotal}`,
    spotsPct: spotsTotal > 0 ? Math.round((filled / spotsTotal) * 100) : 0,
    applyRole: `${draft.role} · ${draft.org}`,
    spots: [
      { label: "Role", value: `${draft.role} · ${draft.org}` },
      { label: "Commitment", value: commitLabel(draft.commit) },
      { label: "Per week", value: draft.time },
      { label: "Location", value: draft.location },
    ],
    partner: partnerOption
      ? {
          name: partnerOption.name,
          text: `In partnership with ${partnerOption.name}.`,
          slug: partnerOption.slug,
        }
      : null,
    community: communityOption
      ? { name: communityOption.name, slug: communityOption.slug }
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
  status: SignupStatus;
  when: string;
}

/** A signup DTO → a render-ready row for the poster's roster / manage-applicants views. */
export function signupToRow(dto: VolunteerSignupDTO, i: number): SignupRow {
  const person = memberRefToPerson(dto.member);
  const tint = TEAM_TINTS[i % TEAM_TINTS.length]!;
  const when = dto.createdAt
    ? formatDate(new Date(dto.createdAt), undefined, {
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
    status: dto.status,
    when,
  };
}
