import { foldForSearch } from "../../../shared/lib/foldForSearch";
import {
  DEFAULT_LEAD_STAGE,
  type CreateLeadBody,
  type LeadDTO,
  type LeadEntryKind,
  type LeadListFilters,
  type LeadListPageDTO,
  type LeadPersonaSearchResultDTO,
  type UpdateLeadBody,
} from "./api/leads.types";
import { lisbonLeadDay } from "./leadDates";
import { DEMO_LEADS_SEED, type DemoLeadsSeed } from "./leadsDemo.data";
import {
  compareForList,
  hasLeadChanged,
  isDueLead,
  searchLeadPersonasIn,
  seededLead,
  stageCountsOf,
  toLeadDTO,
  toListItem,
  viewerAuthor,
  type StoredEntry,
  type StoredLead,
} from "./leadsDemoProjection";
import {
  assertLeadEmailFree,
  assertLeadLinksFree,
  leadRefusal,
  linkablePersonaOf,
  normalizeCreateNote,
  normalizeLeadFields,
  normalizeLeadListFilters,
  normalizeLeadNote,
  normalizeLeadSearchTerm,
  normalizeLinkedPersonaId,
} from "./leadsDemoRules";

export { leadRefusal } from "./leadsDemoRules";

// The demo leads: one lazily seeded in-memory record, read and written by
// the leads pages in demo. It answers the server's shapes, refusals and
// order (contract sections 3 to 4.2), modelled on `personaWallDemoStore`.
// The seed mapping and the DTO projections live in `leadsDemoProjection`,
// the field checks in `leadsDemoRules`.

let leadsState: { leads: StoredLead[]; nextNumber: number } | null = null;

function nextIdOf(prefix: string): string {
  const state = current();
  const number = state.nextNumber;
  state.nextNumber += 1;
  return `${prefix}-${String(number).padStart(6, "0")}`;
}

function current() {
  if (leadsState === null) resetDemoLeads();
  return leadsState ?? { leads: [], nextNumber: 1 };
}

/** Put the demo leads back to a seed (the authored one when none is given);
 *  follow-up offsets become days from today. */
export function resetDemoLeads(seed?: DemoLeadsSeed): void {
  leadsState = { leads: [], nextNumber: 1 };
  const now = Date.now();
  const today = lisbonLeadDay();
  leadsState.leads = (seed ?? DEMO_LEADS_SEED).leads.map((record) =>
    seededLead(record, now, today, () => nextIdOf("demo-lead-entry")),
  );
}

function findLead(leadId: string): StoredLead {
  const lead = current().leads.find((candidate) => candidate.id === leadId);
  if (!lead) throw leadRefusal("LEAD_NOT_FOUND", 404);
  return lead;
}

/** `GET /admin/leads` in demo: every match in one page. Due follow-ups come
 *  first, oldest date first, then the newest change. */
export function demoListLeads(
  filters: LeadListFilters,
  today: string = lisbonLeadDay(),
): LeadListPageDTO {
  const { stage, type } = normalizeLeadListFilters(filters);
  const term = foldForSearch(normalizeLeadSearchTerm(filters.q));
  const searched = current().leads.filter(
    (lead) =>
      (type === null || lead.type === type) &&
      foldForSearch(
        [lead.name, lead.email ?? "", JSON.stringify(lead.links)].join(" "),
      ).includes(term),
  );
  const items = searched
    .filter(
      (lead) =>
        (stage === null || lead.stage === stage) &&
        (!filters.isDueOnly || isDueLead(lead, today)),
    )
    .sort(compareForList(today))
    .map((lead) => toListItem(lead, today));
  return {
    items,
    nextCursor: null,
    stageCounts: stageCountsOf(searched),
    totalCount: searched.length,
  };
}

/** `GET /admin/leads/due-count` in demo: open stages due on or before today. */
export function demoLeadDueCount(today: string = lisbonLeadDay()): {
  count: number;
} {
  return {
    count: current().leads.filter((lead) => isDueLead(lead, today)).length,
  };
}

/** `GET /admin/leads/:id` in demo. */
export function demoGetLead(
  leadId: string,
  today: string = lisbonLeadDay(),
): LeadDTO {
  return toLeadDTO(findLead(leadId), today);
}

function writeEntry(
  lead: StoredLead,
  stamp: string,
  line: Partial<StoredEntry> & { kind: LeadEntryKind },
): void {
  lead.entries.push({
    id: nextIdOf("demo-lead-entry"),
    body: null,
    fromStage: null,
    toStage: null,
    personaId: null,
    author: viewerAuthor(),
    createdAt: stamp,
    editedAt: null,
    ...line,
  });
}

/** `POST /admin/leads` in demo: the lead, its created line, its first note. */
export function demoCreateLead(
  body: CreateLeadBody,
  today: string = lisbonLeadDay(),
): LeadDTO {
  const fields = normalizeLeadFields(body, true);
  const note = normalizeCreateNote(body.note);
  const { leads } = current();
  if (fields.email) assertLeadEmailFree(leads, fields.email, null);
  const links = fields.links ?? [];
  assertLeadLinksFree(leads, links, body.links, null);
  const stamp = new Date().toISOString();
  const stage = fields.stage ?? DEFAULT_LEAD_STAGE;
  const lead: StoredLead = {
    id: nextIdOf("demo-lead-new"),
    name: fields.name ?? "",
    type: fields.type ?? "other",
    stage,
    location: fields.location ?? null,
    email: fields.email ?? null,
    phone: fields.phone ?? null,
    links,
    followUpOn: fields.followUpOn ?? null,
    linkedPersonaId: null,
    createdAt: stamp,
    updatedAt: stamp,
    entries: [],
  };
  writeEntry(lead, stamp, { kind: "created", toStage: stage });
  if (note !== null) writeEntry(lead, stamp, { kind: "note", body: note });
  leads.push(lead);
  return toLeadDTO(lead, today);
}

/** `PATCH /admin/leads/:id` in demo. A field sent with its current value is
 *  no change: no line and no `updatedAt` bump. */
export function demoUpdateLead(
  leadId: string,
  body: UpdateLeadBody,
  today: string = lisbonLeadDay(),
): LeadDTO {
  const fields = normalizeLeadFields(body, false);
  const sentPersonaId = normalizeLinkedPersonaId(body);
  const { leads } = current();
  const lead = findLead(leadId);
  if (fields.email && fields.email !== lead.email) {
    assertLeadEmailFree(leads, fields.email, lead.id);
  }
  if (fields.links) {
    assertLeadLinksFree(leads, fields.links, body.links, lead.id);
  }
  const previous = { ...lead };
  const personaId =
    sentPersonaId === undefined ? lead.linkedPersonaId : sentPersonaId;
  const isPersonaChange = personaId !== previous.linkedPersonaId;
  if (isPersonaChange && personaId !== null) {
    linkablePersonaOf(leads, personaId, lead.id);
  }
  const next: StoredLead = { ...lead, ...fields, linkedPersonaId: personaId };
  if (!hasLeadChanged(previous, next)) return toLeadDTO(lead, today);
  const stamp = new Date().toISOString();
  Object.assign(lead, next, { updatedAt: stamp });
  if (next.stage !== previous.stage) {
    writeEntry(lead, stamp, {
      kind: "stage_changed",
      fromStage: previous.stage,
      toStage: next.stage,
    });
  }
  if (isPersonaChange && previous.linkedPersonaId !== null) {
    writeEntry(lead, stamp, {
      kind: "persona_unlinked",
      personaId: previous.linkedPersonaId,
    });
  }
  if (isPersonaChange && personaId !== null) {
    writeEntry(lead, stamp, { kind: "persona_linked", personaId });
  }
  return toLeadDTO(lead, today);
}

/** `DELETE /admin/leads/:id` in demo: the lead and every line go. */
export function demoDeleteLead(leadId: string): { ok: true } {
  const state = current();
  const lead = findLead(leadId);
  state.leads = state.leads.filter((candidate) => candidate !== lead);
  return { ok: true };
}

/** `POST /admin/leads/:id/entries` in demo: the viewer's note. */
export function demoAddLeadNote(
  leadId: string,
  body: { body: string },
  today: string = lisbonLeadDay(),
): LeadDTO {
  const note = normalizeLeadNote(body.body);
  const lead = findLead(leadId);
  const stamp = new Date().toISOString();
  writeEntry(lead, stamp, { kind: "note", body: note });
  lead.updatedAt = stamp;
  return toLeadDTO(lead, today);
}

/** The note an edit or a delete acts on; any other kind of line refuses. */
function noteOf(lead: StoredLead, entryId: string): StoredEntry {
  const entry = lead.entries.find((candidate) => candidate.id === entryId);
  if (!entry) throw leadRefusal("LEAD_NOTE_NOT_FOUND", 404);
  if (entry.kind !== "note") throw leadRefusal("LEAD_ENTRY_NOT_EDITABLE", 409);
  return entry;
}

/** `PATCH /admin/leads/:id/entries/:entryId` in demo. An unchanged body
 *  stamps nothing. */
export function demoEditLeadNote(
  leadId: string,
  entryId: string,
  body: { body: string },
  today: string = lisbonLeadDay(),
): LeadDTO {
  const note = normalizeLeadNote(body.body);
  const lead = findLead(leadId);
  const entry = noteOf(lead, entryId);
  if (entry.body !== note) {
    const stamp = new Date().toISOString();
    entry.body = note;
    entry.editedAt = stamp;
    lead.updatedAt = stamp;
  }
  return toLeadDTO(lead, today);
}

/** `DELETE /admin/leads/:id/entries/:entryId` in demo. */
export function demoDeleteLeadNote(
  leadId: string,
  entryId: string,
  today: string = lisbonLeadDay(),
): LeadDTO {
  const lead = findLead(leadId);
  const entry = noteOf(lead, entryId);
  lead.entries = lead.entries.filter((candidate) => candidate !== entry);
  lead.updatedAt = new Date().toISOString();
  return toLeadDTO(lead, today);
}

/** `GET /admin/leads/personas/search` in demo: `@` searches handles, any
 *  other term the directory; each result names the lead that links it. */
export function demoSearchLeadPersonas(
  query: string,
): LeadPersonaSearchResultDTO[] {
  return searchLeadPersonasIn(current().leads, normalizeLeadSearchTerm(query));
}
