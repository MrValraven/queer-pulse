import { ApiError } from "../../../shared/api/client";
import {
  DEMO_SUBPROFILES,
  type DemoSubprofile,
} from "../../subprofiles/data/subprofiles.data";
import { demoPersonaPublicState } from "../../subprofiles/personaWallDemoStore";
import { leadLinkKey } from "./api/leadLinkKey";
import {
  isLeadStage,
  isLeadType,
  LEAD_EMAIL_MAX,
  LEAD_LINK_MAX,
  LEAD_LINKS_MAX,
  LEAD_LOCATION_MAX,
  LEAD_NAME_MAX,
  LEAD_NOTE_MAX,
  LEAD_PHONE_MAX,
  LEAD_SEARCH_QUERY_MAX,
  type CreateLeadBody,
  type LeadListFilters,
  type LeadPersonaPublicState,
  type LeadReasonCode,
  type LeadStage,
  type LeadType,
  type UpdateLeadBody,
} from "./api/leads.types";
import { isLeadFollowUpDay } from "./leadDates";

// The demo store's checks, in the server's order (contract sections 3, 3.1
// and 4.2), so demo answers each bad value with the code live answers.

const STATUS_TEXT = {
  400: "Bad Request",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
} as const;

/** The refusal the server answers with, as the API client raises it:
 *  `{ statusCode, message, code }` plus the extras of that code. */
export function leadRefusal(
  code: LeadReasonCode,
  status: 400 | 403 | 404 | 409,
  extra?: Partial<{
    leadId: string;
    leadName: string;
    index: number;
    publicState: Exclude<LeadPersonaPublicState, "shown">;
  }>,
): ApiError {
  return new ApiError(status, STATUS_TEXT[status], {
    statusCode: status,
    message: STATUS_TEXT[status],
    code,
    ...extra,
  });
}

export interface NormalizedLeadFields {
  name?: string;
  type?: LeadType;
  stage?: LeadStage;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  links?: string[];
  followUpOn?: string | null;
}

/** Character limits count code points, as Postgres `char_length` does. */
const codePointLength = (text: string): number => Array.from(text).length;

/** A sent property; `undefined` reads as absent, as JSON drops it. */
const fieldOf = (body: object, field: string): unknown =>
  Reflect.get(body, field);

/** A UTF-16 surrogate half with its partner missing. */
const UNPAIRED_SURROGATE =
  /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

/** The server's `sanitizeLeadText`: every U+0000 goes and every unpaired
 *  surrogate becomes U+FFFD, before any trim or check. */
export const sanitizeLeadText = (value: string): string =>
  value.replaceAll("\u0000", "").replace(UNPAIRED_SURROGATE, "\uFFFD");

/** The server's `trimmedIfText`: a string is trimmed, anything else stays. */
const trimmedIfText = (value: unknown): unknown =>
  typeof value === "string" ? value.trim() : value;

/** Sanitized, then trimmed: the text every check reads. */
const cleanText = (value: string): string => sanitizeLeadText(value).trim();

/** `isEmail()` with class-validator's defaults: a local part of 1 to 64
 *  bytes in dot-separated atoms, and a domain of hyphenated labels whose
 *  last label is a TLD of 2 or more letters. */
const EMAIL_LOCAL_ATOM =
  /^[a-z\d!#$%&'*+\-/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i;
const EMAIL_DOMAIN_LABEL =
  /^[a-z\d\u00A1-\uFFFF](?:[a-z\d\u00A1-\uFFFF-]{0,61}[a-z\d\u00A1-\uFFFF])?$/i;
const EMAIL_TLD =
  /^(?:[a-z\u00A1-\u00A8\u00AA-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}|xn[a-z\d-]{2,})$/i;

function isLeadEmail(email: string): boolean {
  const atIndex = email.lastIndexOf("@");
  if (atIndex <= 0) return false;
  const localPart = email.slice(0, atIndex);
  const labels = email.slice(atIndex + 1).split(".");
  return (
    new TextEncoder().encode(localPart).length <= 64 &&
    localPart.split(".").every((atom) => EMAIL_LOCAL_ATOM.test(atom)) &&
    labels.length >= 2 &&
    labels.every((label) => EMAIL_DOMAIN_LABEL.test(label)) &&
    EMAIL_TLD.test(labels[labels.length - 1] ?? "")
  );
}

/** A nullable text field: trimmed, blank stores null, over `max` refused. */
function optionalText(
  value: unknown,
  max: number,
  code: LeadReasonCode,
): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw leadRefusal(code, 400);
  const trimmed = cleanText(value);
  if (codePointLength(trimmed) > max) throw leadRefusal(code, 400);
  return trimmed === "" ? null : trimmed;
}

function normalizeName(value: unknown): string {
  const name = typeof value === "string" ? cleanText(value) : "";
  if (name === "") throw leadRefusal("LEAD_NAME_REQUIRED", 400);
  if (codePointLength(name) > LEAD_NAME_MAX) {
    throw leadRefusal("LEAD_NAME_TOO_LONG", 400);
  }
  return name;
}

function normalizeEmail(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw leadRefusal("LEAD_EMAIL_INVALID", 400);
  const email = cleanText(value).toLowerCase();
  if (email === "") return null;
  if (codePointLength(email) > LEAD_EMAIL_MAX || !isLeadEmail(email)) {
    throw leadRefusal("LEAD_EMAIL_INVALID", 400);
  }
  return email;
}

/** Entry by entry in sent order; blanks and repeats of an earlier link key
 *  drop, the first spelling stays. */
function normalizeLinks(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw leadRefusal("LEAD_LINK_INVALID", 400, { index: -1 });
  }
  const keptLinks: string[] = [];
  const seenKeys = new Set<string>();
  value.forEach((entry: unknown, index) => {
    if (typeof entry !== "string") {
      throw leadRefusal("LEAD_LINK_INVALID", 400, { index });
    }
    const link = cleanText(entry);
    if (link === "") return;
    const key = leadLinkKey(link);
    if (key === null) throw leadRefusal("LEAD_LINK_INVALID", 400, { index });
    if (codePointLength(link) > LEAD_LINK_MAX) {
      throw leadRefusal("LEAD_LINK_TOO_LONG", 400, { index });
    }
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    keptLinks.push(link);
  });
  if (keptLinks.length > LEAD_LINKS_MAX) {
    throw leadRefusal("LEAD_TOO_MANY_LINKS", 400);
  }
  return keptLinks;
}

/**
 * The create and update field checks, steps 1 to 8 of the create order. On
 * create `name` and `type` are required; on update an absent field stays
 * absent and `name`, `type`, `stage` refuse null.
 */
export function normalizeLeadFields(
  body: CreateLeadBody | UpdateLeadBody,
  isCreate: boolean,
): NormalizedLeadFields {
  const fields: NormalizedLeadFields = {};
  const isSent = (field: string) => fieldOf(body, field) !== undefined;
  if (isCreate || isSent("name")) {
    fields.name = normalizeName(fieldOf(body, "name"));
  }
  if (isCreate || isSent("type")) {
    const type = trimmedIfText(fieldOf(body, "type"));
    if (!isLeadType(type)) throw leadRefusal("LEAD_TYPE_INVALID", 400);
    fields.type = type;
  }
  if (isSent("stage")) {
    const stage = trimmedIfText(fieldOf(body, "stage"));
    if (!isLeadStage(stage)) throw leadRefusal("LEAD_STAGE_INVALID", 400);
    fields.stage = stage;
  }
  if (isSent("location")) {
    fields.location = optionalText(
      fieldOf(body, "location"),
      LEAD_LOCATION_MAX,
      "LEAD_LOCATION_TOO_LONG",
    );
  }
  if (isSent("email")) fields.email = normalizeEmail(fieldOf(body, "email"));
  if (isSent("phone")) {
    fields.phone = optionalText(
      fieldOf(body, "phone"),
      LEAD_PHONE_MAX,
      "LEAD_PHONE_TOO_LONG",
    );
  }
  if (isSent("links")) fields.links = normalizeLinks(fieldOf(body, "links"));
  if (isSent("followUpOn")) {
    const followUpOn = trimmedIfText(fieldOf(body, "followUpOn"));
    if (followUpOn === null) {
      fields.followUpOn = null;
    } else if (isLeadFollowUpDay(followUpOn)) {
      fields.followUpOn = followUpOn;
    } else {
      throw leadRefusal("LEAD_FOLLOW_UP_INVALID", 400);
    }
  }
  return fields;
}

/** A note route's body: trimmed at both ends, inner line breaks kept. */
export function normalizeLeadNote(body: unknown): string {
  const note = typeof body === "string" ? cleanText(body) : "";
  if (note === "") throw leadRefusal("LEAD_NOTE_EMPTY", 400);
  if (codePointLength(note) > LEAD_NOTE_MAX) {
    throw leadRefusal("LEAD_NOTE_TOO_LONG", 400);
  }
  return note;
}

/** The create body's first note: absent, null or blank is no note. */
export function normalizeCreateNote(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && cleanText(value) === "") return null;
  return normalizeLeadNote(value);
}

/** A demo persona id stands where the server reads a uuid. */
const PERSONA_ID_PATTERN =
  /^(sp-[a-z0-9-]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

/** The update's `linkedSubprofileId`: undefined when absent, null to clear;
 *  a malformed id answers 400 with the not-found code. */
export function normalizeLinkedPersonaId(
  body: UpdateLeadBody,
): string | null | undefined {
  const value = trimmedIfText(fieldOf(body, "linkedSubprofileId"));
  if (value === undefined || value === null) return value;
  if (typeof value !== "string" || !PERSONA_ID_PATTERN.test(value)) {
    throw leadRefusal("LEAD_PERSONA_NOT_FOUND", 400);
  }
  return value.toLowerCase();
}

/** The list search and the persona search term: sanitized, trimmed and
 *  cut to 100 code points. */
export const normalizeLeadSearchTerm = (value: string): string =>
  Array.from(cleanText(value)).slice(0, LEAD_SEARCH_QUERY_MAX).join("");

/** The list's stage and type filters, trimmed first; blank is every one,
 *  an unknown value answers its invalid code (stage checked first). */
export function normalizeLeadListFilters(filters: LeadListFilters): {
  stage: LeadStage | null;
  type: LeadType | null;
} {
  const stage = trimmedIfText(filters.stage);
  const type = trimmedIfText(filters.type);
  if (stage !== null && stage !== "" && !isLeadStage(stage)) {
    throw leadRefusal("LEAD_STAGE_INVALID", 400);
  }
  if (type !== null && type !== "" && !isLeadType(type)) {
    throw leadRefusal("LEAD_TYPE_INVALID", 400);
  }
  return {
    stage: isLeadStage(stage) ? stage : null,
    type: isLeadType(type) ? type : null,
  };
}

/** The fields the clash checks read off every stored lead. */
export interface LeadClashCandidate {
  id: string;
  name: string;
  email: string | null;
  links: string[];
  linkedPersonaId: string | null;
}

/** A 409 that names the other lead holding the value. */
const takenBy = (
  code: LeadReasonCode,
  holder: LeadClashCandidate,
  index?: number,
): ApiError =>
  leadRefusal(code, 409, {
    leadId: holder.id,
    leadName: holder.name,
    ...(index === undefined ? {} : { index }),
  });

/** `LEAD_EMAIL_TAKEN` when another lead holds the email. */
export function assertLeadEmailFree(
  leads: readonly LeadClashCandidate[],
  email: string,
  ownLeadId: string | null,
): void {
  const holder = leads.find(
    (lead) => lead.id !== ownLeadId && lead.email === email,
  );
  if (holder) throw takenBy("LEAD_EMAIL_TAKEN", holder);
}

/** `LEAD_LINK_TAKEN` for the first kept link another lead holds. `index`
 *  points into the array the client sent, blanks included. */
export function assertLeadLinksFree(
  leads: readonly LeadClashCandidate[],
  links: readonly string[],
  sentLinks: unknown,
  ownLeadId: string | null,
): void {
  const otherLeads = leads.filter((lead) => lead.id !== ownLeadId);
  for (const link of links) {
    const key = leadLinkKey(link);
    const holder = otherLeads.find((lead) =>
      lead.links.some((storedLink) => leadLinkKey(storedLink) === key),
    );
    if (!holder) continue;
    const sentIndex = Array.isArray(sentLinks)
      ? sentLinks.findIndex(
          (entry: unknown) =>
            typeof entry === "string" && entry.trim() === link,
        )
      : -1;
    throw takenBy("LEAD_LINK_TAKEN", holder, sentIndex);
  }
}

/** The persona a lead may link: it exists, it is free of other leads, and it
 *  shows on the directory, checked in that order. */
export function linkablePersonaOf(
  leads: readonly LeadClashCandidate[],
  personaId: string,
  ownLeadId: string,
): DemoSubprofile {
  const persona = DEMO_SUBPROFILES.find(
    (candidate) => candidate.id === personaId,
  );
  if (!persona) throw leadRefusal("LEAD_PERSONA_NOT_FOUND", 404);
  const holder = leads.find(
    (lead) => lead.id !== ownLeadId && lead.linkedPersonaId === personaId,
  );
  if (holder) throw takenBy("LEAD_PERSONA_TAKEN", holder);
  const publicState = demoPersonaPublicState(persona);
  if (publicState !== "shown") {
    throw leadRefusal("LEAD_PERSONA_NOT_LISTED", 409, { publicState });
  }
  return persona;
}
