import { isValidElement, type ReactNode } from "react";
import { memberRefToPerson, type Person } from "../../../shared/api/refs";
import { formatDate } from "../../../shared/lib/date";
import { orgBadgeInitials } from "../../../shared/lib/initials";
import type {
  Cause,
  OpportunityCardDTO,
  OpportunityDetailDTO,
  SignupStatus,
  VolunteerSignupDTO,
} from "./volunteering.api";
import type { OrganizationOption } from "./useOrganizationOptions";
import type {
  VolunteerCause,
  VolunteerOpportunity,
  TeamMember,
} from "../volunteerOpportunities.types";
import {
  defaultApplyRole,
  type PostOpportunityState,
} from "../usePostOpportunityForm";

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

/** One entry per line → trimmed, non-empty entries. Mirrors
 *  `usePostOpportunityForm`'s identical (file-local, unexported) helper. */
const splitLines = (s: string) =>
  s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

/** Best-effort plain text from a `why`/`goodFor` entry, which the mock data
 *  authors as inline-formatted JSX (`<b>`/`<em>`) — the edit form only
 *  offers plain text, so a mock entry loses its inline emphasis once
 *  edited. Live entries are already plain strings (see `detailToOpportunity`)
 *  and round-trip losslessly. */
function nodeToText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (isValidElement(node)) {
    return nodeToText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

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
    slug: ref.slug,
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

// ── opportunity ⇄ the shared create/edit form state ──────────────────────────

/** The current opportunity → the edit flow's starting form state — the same
 *  `PostOpportunityState` the create form uses, so editing renders the exact
 *  same fields (see `usePostOpportunityForm`'s `initial` argument). Contact
 *  `handle` isn't part of the detail DTO (creation-only, see
 *  `UpdateOpportunityDto`) so it's left blank; the edit form never shows it. */
export function opportunityToFormState(
  opp: VolunteerOpportunity,
): PostOpportunityState {
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
    applyRole: opp.applyRole,
    why: opp.why.map(nodeToText).join("\n"),
    goodFor: opp.goodFor.map(nodeToText).join("\n"),
    teamIntro: opp.teamIntro,
    team: opp.team
      .map((m) => m.slug)
      .filter((slug): slug is string => Boolean(slug)),
    partnerSlug: opp.partner?.slug ?? "",
    communitySlug: opp.community?.slug ?? "",
    handle: "",
    tasks: opp.tasks.length
      ? opp.tasks.map((t) => ({ title: t.title, description: t.description }))
      : [{ title: "", description: "" }],
    commitments: opp.commitments.length
      ? opp.commitments.map((c) => ({ label: c.b, detail: c.s }))
      : [{ label: "", detail: "" }],
  };
}

/**
 * The edit form's state applied to the currently-rendered opportunity, so the
 * detail page reflects a save immediately without waiting on a refetch —
 * load-bearing in demo mode, where there's no server to refetch from at all
 * (mirrors `useCloseOpportunity`'s reliance on mutation state over query
 * data for its demo-mode reflection). `organizationOptions` resolves the
 * picked `partnerSlug`/`communitySlug` back to a display name. `team`'s
 * roster display can't be rebuilt from the form's slugs alone (it needs each
 * member's name/initials/colour) so it's left as the last-fetched roster —
 * a live refetch on the next real load reconciles it.
 */
export function applyFormStateToOpportunity(
  base: VolunteerOpportunity,
  state: PostOpportunityState,
  organizationOptions: OrganizationOption[],
): VolunteerOpportunity {
  const cause = causeToTitle(state.cause);
  const skills = splitCommas(state.skills);
  const why = splitLines(state.why);
  const goodFor = splitLines(state.goodFor);
  const tasks = state.tasks
    .filter((t) => t.title.trim())
    .map((t) => ({ title: t.title.trim(), description: t.description.trim() }));
  const commitments = state.commitments
    .filter((c) => c.label.trim())
    .map((c) => ({ b: c.label.trim(), s: c.detail.trim() }));
  const spotsTotal = Number.parseInt(state.spotsTotal, 10);
  const filledMatch = /(\d+)\s*\/\s*\d+/.exec(base.spotsFilled);
  const filled = filledMatch ? Number(filledMatch[1]) : 0;
  const spotsOpen = Math.max(spotsTotal - filled, 0);
  const applyRole =
    state.applyRole.trim() || defaultApplyRole(state.role, state.org);
  const partnerOption = state.partnerSlug
    ? organizationOptions.find(
        (o) => o.kind === "partner" && o.slug === state.partnerSlug,
      )
    : undefined;
  const communityOption = state.communitySlug
    ? organizationOptions.find(
        (o) => o.kind === "community" && o.slug === state.communitySlug,
      )
    : undefined;

  return {
    ...base,
    org: state.org,
    avatar: orgBadgeInitials(state.org),
    role: state.role,
    cause,
    commit: state.commit,
    time: state.time,
    location: state.location,
    skills,
    description: state.description,
    sub: state.description,
    eyebrow: `Volunteer · ${cause} · ${state.org}`,
    titleLead: `${state.role} · `,
    titleEm: `${state.org}.`,
    stats: [
      { value: <b>{state.time}</b>, label: "Per week" },
      { value: <b>{commitLabel(state.commit)}</b>, label: "Commitment" },
      { value: <b>{spotsOpen}</b>, label: "Spots still open" },
    ],
    why,
    goodFor,
    tasks,
    commitments,
    teamIntro: state.teamIntro,
    spotsFilled: `${filled} / ${spotsTotal}`,
    spotsPct: spotsTotal > 0 ? Math.round((filled / spotsTotal) * 100) : 0,
    applyRole,
    spots: [
      { label: "Role", value: applyRole },
      { label: "Commitment", value: commitLabel(state.commit) },
      { label: "Per week", value: state.time },
      { label: "Location", value: state.location },
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
  /** Null until the poster confirms the session. `false` is a recorded
   *  no-show, which is confirmed, so the control does not come back. */
  attended: boolean | null;
  hoursContributed: number | null;
  /** Formatted like `when`, empty when the session is not confirmed yet. */
  completedWhen: string;
  /** The one condition the completion control appears on: accepted, and
   *  nobody has recorded the session yet. */
  isAwaitingCompletion: boolean;
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
  const completedWhen = dto.completedAt
    ? formatDate(new Date(dto.completedAt), undefined, {
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
    attended: dto.attended,
    hoursContributed: dto.hoursContributed,
    completedWhen,
    isAwaitingCompletion: dto.status === "accepted" && dto.completedAt === null,
  };
}
