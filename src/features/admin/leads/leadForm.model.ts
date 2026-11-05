import {
  DEFAULT_LEAD_STAGE,
  leadReasonOf,
  leadRefusalDetailOf,
  type CreateLeadBody,
  type LeadDTO,
  type LeadReasonCode,
  type LeadStage,
  type LeadType,
  type UpdateLeadBody,
} from "./api/leads.types";
import { leadLinkKey } from "./api/leadLinkKey";
import {
  LEAD_ERROR_MAX,
  LEAD_REASON_KEY,
  leadErrorKeyOf,
  leadErrorValuesOf,
} from "./leadErrors";

export type LeadFormField =
  | "name"
  | "type"
  | "stage"
  | "location"
  | "email"
  | "phone"
  | "links"
  | "followUpOn"
  | "note";

/** One link input. `rowKey` keeps a row's identity while rows are added and
 *  removed around it. */
export interface LeadLinkRow {
  rowKey: string;
  text: string;
}

export interface LeadFormValues {
  name: string;
  type: LeadType | null;
  stage: LeadStage;
  location: string;
  email: string;
  phone: string;
  links: LeadLinkRow[];
  followUpOn: string | null;
  note: string;
}

let linkRowCount = 0;

export function newLeadLinkRow(text = ""): LeadLinkRow {
  linkRowCount += 1;
  return { rowKey: `link-row-${linkRowCount}`, text };
}

/** The Add lead form before anything is typed: no type, the default stage,
 *  one empty link row. */
export function emptyLeadFormValues(): LeadFormValues {
  return {
    name: "",
    type: null,
    stage: DEFAULT_LEAD_STAGE,
    location: "",
    email: "",
    phone: "",
    links: [newLeadLinkRow()],
    followUpOn: null,
    note: "",
  };
}

/** The details form seeded from a stored lead: one row per stored link, one
 *  empty row when it has none. */
export function leadFormValuesOf(lead: LeadDTO): LeadFormValues {
  return {
    name: lead.name,
    type: lead.type,
    stage: lead.stage,
    location: lead.location ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    links:
      lead.links.length > 0
        ? lead.links.map((link) => newLeadLinkRow(link))
        : [newLeadLinkRow()],
    followUpOn: lead.followUpOn,
    note: "",
  };
}

/** The link as sent: trimmed, with `https://` added when the staff member
 *  typed it without a scheme. Blank stays blank. */
export function withLinkScheme(text: string): string {
  const trimmed = text.trim();
  if (trimmed === "") return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** The links a form sends, with the row each came from: sent link `i` came
 *  from form row `rowIndexes[i]`, so a refusal's `index` lands on its row. */
export interface SentLinks {
  links: string[];
  rowIndexes: number[];
}

export function sentLinksOf(rows: readonly LeadLinkRow[]): SentLinks {
  const sentLinks: SentLinks = { links: [], rowIndexes: [] };
  rows.forEach((row, rowIndex) => {
    const link = withLinkScheme(row.text);
    if (link === "") return;
    sentLinks.links.push(link);
    sentLinks.rowIndexes.push(rowIndex);
  });
  return sentLinks;
}

/** Trimmed text, or null when blank. */
function textOrNull(text: string): string | null {
  const trimmed = text.trim();
  return trimmed === "" ? null : trimmed;
}

/** The sent links as the server stores them: a link whose key repeats an
 *  earlier link's key drops (the first spelling stays). A link with no key
 *  stays, so the server's `LEAD_LINK_INVALID` refusal still reaches it. */
function storedLinksOf(sent: readonly string[]): string[] {
  const seenKeys = new Set<string>();
  return sent.filter((link) => {
    const key = leadLinkKey(link);
    if (key === null) return true;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });
}

/** Whether the sent links would store as the lead's links, in order. */
function hasSameLinks(
  stored: readonly string[],
  sent: readonly string[],
): boolean {
  const storedAfterSave = storedLinksOf(sent);
  return (
    stored.length === storedAfterSave.length &&
    stored.every((link, index) => link === storedAfterSave[index])
  );
}

export function createLeadBodyOf(
  values: LeadFormValues & { type: LeadType },
): CreateLeadBody {
  return {
    name: values.name.trim(),
    type: values.type,
    stage: values.stage,
    location: textOrNull(values.location),
    email: textOrNull(values.email),
    phone: textOrNull(values.phone),
    links: sentLinksOf(values.links).links,
    followUpOn: values.followUpOn,
    note: textOrNull(values.note),
  };
}

/** The fields the details form changed, and only those. The server
 *  lowercases an email, so a change of letter case alone is no change. */
export function leadUpdateBodyOf(
  lead: LeadDTO,
  values: LeadFormValues,
): UpdateLeadBody {
  const body: UpdateLeadBody = {};
  const name = values.name.trim();
  if (name !== lead.name) body.name = name;
  if (values.type !== null && values.type !== lead.type) {
    body.type = values.type;
  }
  const location = textOrNull(values.location);
  if (location !== lead.location) body.location = location;
  const email = textOrNull(values.email);
  if (email?.toLowerCase() !== lead.email?.toLowerCase()) body.email = email;
  const phone = textOrNull(values.phone);
  if (phone !== lead.phone) body.phone = phone;
  // The body sends every non-blank row, repeats included, so a refusal's
  // `index` still maps back through `sentLinksOf(values.links).rowIndexes`.
  const links = sentLinksOf(values.links).links;
  if (!hasSameLinks(lead.links, links)) body.links = links;
  if (values.followUpOn !== lead.followUpOn) {
    body.followUpOn = values.followUpOn;
  }
  return body;
}

export function isLeadFormDirty(
  lead: LeadDTO,
  values: LeadFormValues,
): boolean {
  return Object.keys(leadUpdateBodyOf(lead, values)).length > 0;
}

/** The refusal the form names before sending anything: a blank name, then a
 *  missing type. */
export function localLeadRefusalOf(
  values: LeadFormValues,
): LeadReasonCode | null {
  if (values.name.trim() === "") return "LEAD_NAME_REQUIRED";
  if (values.type === null) return "LEAD_TYPE_INVALID";
  return null;
}

/** A refusal placed on the form: the field it belongs to (null is a
 *  form-level line), the link row for a link refusal, the line and its
 *  values, and the other lead for an "Open <name>" action. */
export interface LeadFieldError {
  field: LeadFormField | null;
  rowIndex: number | null;
  messageKey: string;
  values: { name?: string; max?: number };
  openLeadId: string | null;
  openLeadName: string | null;
}

/** The field each reason code shows under; null is a form-level line. */
const LEAD_REASON_FIELD: Record<LeadReasonCode, LeadFormField | null> = {
  LEAD_NOT_FOUND: null,
  LEAD_NAME_REQUIRED: "name",
  LEAD_NAME_TOO_LONG: "name",
  LEAD_TYPE_INVALID: "type",
  LEAD_STAGE_INVALID: "stage",
  LEAD_LOCATION_TOO_LONG: "location",
  LEAD_EMAIL_INVALID: "email",
  LEAD_EMAIL_TAKEN: "email",
  LEAD_PHONE_TOO_LONG: "phone",
  LEAD_LINK_INVALID: "links",
  LEAD_LINK_TOO_LONG: "links",
  LEAD_TOO_MANY_LINKS: "links",
  LEAD_LINK_TAKEN: "links",
  LEAD_FOLLOW_UP_INVALID: "followUpOn",
  LEAD_PERSONA_NOT_FOUND: null,
  LEAD_PERSONA_NOT_LISTED: null,
  LEAD_PERSONA_TAKEN: null,
  LEAD_NOTE_EMPTY: "note",
  LEAD_NOTE_TOO_LONG: "note",
  LEAD_NOTE_NOT_FOUND: null,
  LEAD_NOTE_NOT_YOURS: null,
  LEAD_ENTRY_NOT_EDITABLE: null,
  LEAD_CURSOR_INVALID: null,
};

/** The refusals whose `index` names one sent link. */
const ROW_REASON_CODES: readonly LeadReasonCode[] = [
  "LEAD_LINK_INVALID",
  "LEAD_LINK_TOO_LONG",
  "LEAD_LINK_TAKEN",
];

/** The refusals that name the other lead holding the value. */
const OTHER_LEAD_REASON_CODES: readonly LeadReasonCode[] = [
  "LEAD_EMAIL_TAKEN",
  "LEAD_LINK_TAKEN",
  "LEAD_PERSONA_TAKEN",
];

/** The form row a link refusal points at. The server's `index` counts the
 *  links the form sent, so it maps back through `sentLinks.rowIndexes`; with
 *  no map, or an index outside it, the line sits under the whole list. */
function refusedRowIndexOf(
  index: number | null,
  sentLinks: SentLinks | undefined,
): number | null {
  if (index === null || sentLinks === undefined) return null;
  return sentLinks.rowIndexes[index] ?? null;
}

/** A failed write placed on the form. A failure with no lead code is a
 *  form-level line naming the connection, server or access cause. */
export function leadFieldErrorOf(
  cause: unknown,
  sentLinks?: SentLinks,
): LeadFieldError {
  const reasonCode = leadReasonOf(cause);
  const detail = leadRefusalDetailOf(cause);
  const isRowRefusal =
    reasonCode !== null && ROW_REASON_CODES.includes(reasonCode);
  const isOtherLeadRefusal =
    reasonCode !== null && OTHER_LEAD_REASON_CODES.includes(reasonCode);
  return {
    field: reasonCode === null ? null : LEAD_REASON_FIELD[reasonCode],
    rowIndex: isRowRefusal ? refusedRowIndexOf(detail.index, sentLinks) : null,
    messageKey: leadErrorKeyOf(cause),
    values: leadErrorValuesOf(cause),
    openLeadId: isOtherLeadRefusal ? detail.leadId : null,
    openLeadName: isOtherLeadRefusal ? detail.leadName : null,
  };
}

/** A refusal the form found itself, before sending. */
export function localLeadFieldError(code: LeadReasonCode): LeadFieldError {
  const max = LEAD_ERROR_MAX[code];
  return {
    field: LEAD_REASON_FIELD[code],
    rowIndex: null,
    messageKey: LEAD_REASON_KEY[code],
    values: max === undefined ? {} : { max },
    openLeadId: null,
    openLeadName: null,
  };
}
