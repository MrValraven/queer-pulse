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
] as const;
export type LeadEntryKind = (typeof LEAD_ENTRY_KINDS)[number];

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
}

export interface LeadPersonaSearchResultDTO {
  persona: LeadPersonaDTO;
  /** The lead this persona is linked to, if any. */
  linkedLead: { id: string; name: string } | null;
}

/** Every reason code a lead refusal carries (contract section 3, table order). */
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
] as const;
export type LeadReasonCode = (typeof LEAD_REASON_CODES)[number];

export interface LeadListFilters {
  q: string;
  stage: LeadStage | null;
  type: LeadType | null;
  isDueOnly: boolean;
}

export const EMPTY_LEAD_FILTERS: LeadListFilters = {
  q: "",
  stage: null,
  type: null,
  isDueOnly: false,
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
}

/** Reads each extra field off a refusal body; a field that is missing or of
 *  the wrong shape reads null. */
export function leadRefusalDetailOf(error: unknown): LeadRefusalDetail {
  const body = refusalBodyOf(error);
  const leadId = body?.leadId;
  const leadName = body?.leadName;
  const index = body?.index;
  const publicState = body?.publicState;
  return {
    leadId: typeof leadId === "string" ? leadId : null,
    leadName: typeof leadName === "string" ? leadName : null,
    index: typeof index === "number" && Number.isInteger(index) ? index : null,
    publicState:
      HIDDEN_LEAD_PERSONA_STATES.find((state) => state === publicState) ?? null,
  };
}
