import { ApiError } from "../../../../shared/api/client";
import type { PersonaWallPublicState } from "../../../subprofiles/api/personaWall.api";

// The Leads contract (QUEERPULSE-LEADS-CONTRACT-2026-11-05, sections 2, 4.1
// and 10.2), mirrored from the backend's `src/leads/leads.constants.ts` and
// `src/leads/lead-response.ts`. The live api module and the demo store both
// answer with these shapes.

export const LEAD_TYPES = [
  "artist",
  "dj",
  "band",
  "venue",
  "promoter",
  "collective",
  "business",
  "other",
] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const LEAD_STAGES = [
  "to_contact",
  "contacted",
  "in_talks",
  "on_board",
  "not_now",
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];
export const DEFAULT_LEAD_STAGE: LeadStage = "to_contact";

/** The stages a follow-up can be due in (badge and `due=true`). */
export const OPEN_LEAD_STAGES = [
  "to_contact",
  "contacted",
  "in_talks",
] as const;
export type OpenLeadStage = (typeof OPEN_LEAD_STAGES)[number];

export const LEAD_ENTRY_KINDS = [
  "note",
  "stage_changed",
  "persona_linked",
  "persona_unlinked",
  "created",
  "assignee_added",
  "assignee_removed",
  "assignee_access_ended",
] as const;
export type LeadEntryKind = (typeof LEAD_ENTRY_KINDS)[number];

/** Most staff in charge of one lead. */
export const LEAD_MAX_ASSIGNEES = 10;
/** Picker rows for a blank search: the caller first, then by name. */
export const LEAD_STAFF_PREVIEW_LIMIT = 5;
/** Picker rows for a non-blank search. */
export const LEAD_STAFF_SEARCH_LIMIT = 20;
/** Assignee summaries on a list row; `assigneeCount` holds the rest. */
export const LEAD_LIST_ASSIGNEES_SHOWN = 3;

/** The "In charge" views of the list, in segmented-control order after
 *  Everyone (Everyone is the absent value). `me_or_unassigned` is the nav
 *  badge's set. */
export const LEAD_ASSIGNED_TO_FILTERS = [
  "me",
  "me_or_unassigned",
  "unassigned",
] as const;
export type LeadAssignedToFilter = (typeof LEAD_ASSIGNED_TO_FILTERS)[number];

/** Why LEAD_ASSIGNEE_NOT_STAFF refused, in check order. */
export const LEAD_ASSIGNEE_REFUSAL_REASONS = [
  "no_access",
  "suspended",
  "deactivated",
] as const;
export type LeadAssigneeRefusalReason =
  (typeof LEAD_ASSIGNEE_REFUSAL_REASONS)[number];

export const LEAD_NAME_MAX = 120;
export const LEAD_LOCATION_MAX = 120;
export const LEAD_EMAIL_MAX = 254;
export const LEAD_PHONE_MAX = 40;
export const LEAD_LINKS_MAX = 12;
export const LEAD_LINK_MAX = 500;
export const LEAD_NOTE_MAX = 4000;
export const LEAD_PAGE_SIZE = 50;
export const LEAD_PERSONA_SEARCH_LIMIT = 20;
/** Longest list or persona search text, in code points; longer is cut. */
export const LEAD_SEARCH_QUERY_MAX = 100;
/** Links shown on a list row. */
export const LEAD_LIST_LINKS_SHOWN = 3;
/** The calendar day of a follow-up is read in this zone. */
export const LEAD_TIME_ZONE = "Europe/Lisbon";
/** Follow-up dates outside this range answer LEAD_FOLLOW_UP_INVALID. */
export const LEAD_FOLLOW_UP_MIN = "2000-01-01";
export const LEAD_FOLLOW_UP_MAX = "2100-12-31";

/** The persona's public state, reused from the persona wall:
 *  "shown" | "draft" | "not_open" | "removed" | "taken_down". */
export type LeadPersonaPublicState = PersonaWallPublicState;

/** A state that keeps a persona off the public directory. */
export type HiddenLeadPersonaState = Exclude<LeadPersonaPublicState, "shown">;

/** The four hidden states, in the wall's precedence order. */
const HIDDEN_LEAD_PERSONA_STATES: readonly HiddenLeadPersonaState[] = [
  "removed",
  "taken_down",
  "draft",
  "not_open",
];

/** Persona-only projection. It carries no owner field. */
export interface LeadPersonaDTO {
  id: string;
  handle: string | null;
  displayName: string;
  kind: string;
  avatarUrl: string | null;
  /** A crop rect, read with `personaWallCropOf`. */
  avatarCrop: unknown | null;
}

/** The persona a lead is linked to, with whether it is publicly listed. */
export interface LeadLinkedPersonaDTO extends LeadPersonaDTO {
  publicState: LeadPersonaPublicState;
}

/** A staff member in charge of a lead, a picker row, or the subject of an
 *  assignee history entry (contract 5.1). */
export interface LeadStaffSummaryDTO {
  /** The user id. */
  id: string;
  /** Empty when the profile row is missing. */
  slug: string;
  /** Empty when the profile row is missing. */
  displayName: string;
  /** Null when the member has no photo or hid it; the avatar shows
   *  initials then. */
  avatarUrl: string | null;
  /** A crop rect, read with `personaWallCropOf`. */
  avatarCrop: unknown | null;
}

export interface LeadListItemDTO {
  id: string;
  name: string;
  type: LeadType;
  stage: LeadStage;
  location: string | null;
  /** The first three, in stored order. */
  links: string[];
  /** Every stored link. */
  linkCount: number;
  followUpOn: string | null;
  /** An open stage and `followUpOn` on or before today in Lisbon. */
  isFollowUpDue: boolean;
  linkedPersona: LeadLinkedPersonaDTO | null;
  /** Entries of kind "note". */
  noteCount: number;
  /** The newest entry's `createdAt`; the "created" entry always exists. */
  lastEntryAt: string;
  updatedAt: string;
  /** The first three by assignment time. */
  assignees: LeadStaffSummaryDTO[];
  /** Every assignee of the lead. */
  assigneeCount: number;
}

export interface LeadListPageDTO {
  /** 0..50 rows. */
  items: LeadListItemDTO[];
  /** Null on the last page. */
  nextCursor: string | null;
  /** Every stage present, 0 when none. */
  stageCounts: Record<LeadStage, number>;
  /** The sum of `stageCounts`. */
  totalCount: number;
  /** Leads in an open stage whose follow-up is today or earlier in Lisbon,
   *  over the search and type only, as `stageCounts` counts them. */
  dueCount: number;
}

export interface LeadEntryAuthorDTO {
  /** The user id. */
  id: string;
  displayName: string;
  avatarUrl: string | null;
  avatarCrop: unknown | null;
}

export interface LeadEntryDTO {
  id: string;
  kind: LeadEntryKind;
  /** Set on "note" entries only. */
  body: string | null;
  /** Set on "stage_changed" entries only. */
  fromStage: LeadStage | null;
  /** Set on "stage_changed" and on "created" (the starting stage). */
  toStage: LeadStage | null;
  /** Set on persona entries while the persona exists; null reads "a persona
   *  that is no longer available". */
  persona: LeadPersonaDTO | null;
  /** Null when the author's account is gone. */
  author: LeadEntryAuthorDTO | null;
  createdAt: string;
  editedAt: string | null;
  /** A note the caller wrote, or any note when the caller is an Admin. */
  canEdit: boolean;
  /** Set on the three assignee kinds while the account exists; null on
   *  every other kind. */
  subject: LeadStaffSummaryDTO | null;
}

export interface LeadDTO {
  id: string;
  name: string;
  type: LeadType;
  stage: LeadStage;
  location: string | null;
  email: string | null;
  phone: string | null;
  /** Every stored link. */
  links: string[];
  followUpOn: string | null;
  isFollowUpDue: boolean;
  linkedPersona: LeadLinkedPersonaDTO | null;
  createdAt: string;
  updatedAt: string;
  /** Every entry, newest first. */
  entries: LeadEntryDTO[];
  /** Every assignee, by assignment time. */
  assignees: LeadStaffSummaryDTO[];
}

export interface LeadPersonaSearchResultDTO {
  persona: LeadPersonaDTO;
  /** The lead this persona is linked to, if any. */
  linkedLead: { id: string; name: string } | null;
}

/** Every reason code a lead refusal carries (contract section 3, table
 *  order), then the two codes of the stage change revert route, then the
 *  four assignee codes. */
export const LEAD_REASON_CODES = [
  "LEAD_NOT_FOUND",
  "LEAD_NAME_REQUIRED",
  "LEAD_NAME_TOO_LONG",
  "LEAD_TYPE_INVALID",
  "LEAD_STAGE_INVALID",
  "LEAD_LOCATION_TOO_LONG",
  "LEAD_EMAIL_INVALID",
  "LEAD_EMAIL_TAKEN",
  "LEAD_PHONE_TOO_LONG",
  "LEAD_LINK_INVALID",
  "LEAD_LINK_TOO_LONG",
  "LEAD_TOO_MANY_LINKS",
  "LEAD_LINK_TAKEN",
  "LEAD_FOLLOW_UP_INVALID",
  "LEAD_PERSONA_NOT_FOUND",
  "LEAD_PERSONA_NOT_LISTED",
  "LEAD_PERSONA_TAKEN",
  "LEAD_NOTE_EMPTY",
  "LEAD_NOTE_TOO_LONG",
  "LEAD_NOTE_NOT_FOUND",
  "LEAD_NOTE_NOT_YOURS",
  "LEAD_ENTRY_NOT_EDITABLE",
  "LEAD_CURSOR_INVALID",
  "LEAD_ENTRY_NOT_FOUND",
  "LEAD_ENTRY_NOT_REVERTIBLE",
  "LEAD_ASSIGNED_TO_INVALID",
  "LEAD_ASSIGNEE_NOT_FOUND",
  "LEAD_ASSIGNEE_NOT_STAFF",
  "LEAD_TOO_MANY_ASSIGNEES",
] as const;
export type LeadReasonCode = (typeof LEAD_REASON_CODES)[number];

/** Why a stage change revert answers `LEAD_ENTRY_NOT_REVERTIBLE`, in the
 *  server's check order: the line is another kind, a later stage change
 *  exists, the stage moved since, the caller neither wrote it nor is an
 *  Admin, or the change is older than {@link LEAD_REVERT_WINDOW_MS}. */
export const LEAD_REVERT_REFUSAL_REASONS = [
  "not_stage_change",
  "not_newest",
  "stage_moved",
  "not_yours",
  "too_old",
] as const;
export type LeadRevertRefusalReason =
  (typeof LEAD_REVERT_REFUSAL_REASONS)[number];

/** How long a stage change stays revertible, in ms. */
export const LEAD_REVERT_WINDOW_MS = 10 * 60 * 1000;

export interface LeadListFilters {
  q: string;
  stage: LeadStage | null;
  type: LeadType | null;
  isDueOnly: boolean;
  /** Null is Everyone. */
  assignedTo: LeadAssignedToFilter | null;
}

export const EMPTY_LEAD_FILTERS: LeadListFilters = {
  q: "",
  stage: null,
  type: null,
  isDueOnly: false,
  assignedTo: null,
};

export interface CreateLeadBody {
  name: string;
  type: LeadType;
  stage?: LeadStage;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  links?: string[];
  followUpOn?: string | null;
  note?: string | null;
}

export interface UpdateLeadBody {
  name?: string;
  type?: LeadType;
  stage?: LeadStage;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  links?: string[];
  followUpOn?: string | null;
  linkedSubprofileId?: string | null;
}

/** The persona dialog's search state (built by `useLeadPersonaSearch`,
 *  drawn by `LeadPersonaSearchResults`). */
export interface LeadPersonaSearch {
  term: string;
  results: LeadPersonaSearchResultDTO[];
  isIdle: boolean;
  isSearching: boolean;
  isError: boolean;
  error: unknown;
  retry: () => void;
}

/** The lead page picker's search state (built by `useLeadStaffSearch`). */
export interface LeadStaffSearch {
  term: string;
  results: LeadStaffSummaryDTO[];
  isSearching: boolean;
  isError: boolean;
  error: unknown;
  retry: () => void;
}

export function isLeadStage(value: unknown): value is LeadStage {
  return (
    typeof value === "string" &&
    (LEAD_STAGES as readonly string[]).includes(value)
  );
}

export function isLeadType(value: unknown): value is LeadType {
  return (
    typeof value === "string" &&
    (LEAD_TYPES as readonly string[]).includes(value)
  );
}

export function isLeadAssignedToFilter(
  value: unknown,
): value is LeadAssignedToFilter {
  return (
    typeof value === "string" &&
    (LEAD_ASSIGNED_TO_FILTERS as readonly string[]).includes(value)
  );
}

/** The parsed refusal body, when the failure is an `ApiError` that has one. */
function refusalBodyOf(error: unknown): Record<string, unknown> | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.data;
  return typeof body === "object" && body !== null
    ? (body as Record<string, unknown>)
    : null;
}

/** The lead reason code off a refused call, or null when the body names
 *  none of the contract's codes. */
export function leadReasonOf(error: unknown): LeadReasonCode | null {
  const code = refusalBodyOf(error)?.code;
  return typeof code === "string" &&
    (LEAD_REASON_CODES as readonly string[]).includes(code)
    ? (code as LeadReasonCode)
    : null;
}

/** The extra fields a refusal body carries (contract section 3). */
export interface LeadRefusalDetail {
  leadId: string | null;
  leadName: string | null;
  index: number | null;
  publicState: Exclude<LeadPersonaPublicState, "shown"> | null;
  /** Why a stage change revert was refused. */
  revertReason: LeadRevertRefusalReason | null;
  /** Why an assignment was refused; read from the same `reason` field. */
  assigneeReason: LeadAssigneeRefusalReason | null;
}

/** Reads each extra field off a refusal body; a field that is missing or of
 *  the wrong shape reads null. */
export function leadRefusalDetailOf(error: unknown): LeadRefusalDetail {
  const body = refusalBodyOf(error);
  const leadId = body?.leadId;
  const leadName = body?.leadName;
  const index = body?.index;
  const publicState = body?.publicState;
  const reason = body?.reason;
  return {
    leadId: typeof leadId === "string" ? leadId : null,
    leadName: typeof leadName === "string" ? leadName : null,
    index: typeof index === "number" && Number.isInteger(index) ? index : null,
    publicState:
      HIDDEN_LEAD_PERSONA_STATES.find((state) => state === publicState) ?? null,
    revertReason:
      LEAD_REVERT_REFUSAL_REASONS.find((known) => known === reason) ?? null,
    assigneeReason:
      LEAD_ASSIGNEE_REFUSAL_REASONS.find((known) => known === reason) ?? null,
  };
}
