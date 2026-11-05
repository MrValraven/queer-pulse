import { currentUser } from "../../members/data/demoCurrentUser";
import {
  DEMO_SUBPROFILES,
  mockDirectory,
  type DemoSubprofile,
} from "../../subprofiles/data/subprofiles.data";
import { demoPersonaPublicState } from "../../subprofiles/personaWallDemoStore";
import {
  LEAD_LIST_LINKS_SHOWN,
  LEAD_PERSONA_SEARCH_LIMIT,
  type LeadDTO,
  type LeadEntryAuthorDTO,
  type LeadEntryDTO,
  type LeadEntryKind,
  type LeadLinkedPersonaDTO,
  type LeadListItemDTO,
  type LeadPersonaDTO,
  type LeadPersonaSearchResultDTO,
  type LeadStage,
  type LeadType,
} from "./api/leads.types";
import { isLeadFollowUpDue, shiftLeadDay } from "./leadDates";
import { DEMO_LEAD_AUTHORS, type DemoLeadRecord } from "./leadsDemo.data";
import type { LeadClashCandidate } from "./leadsDemoRules";

// The demo leads store's records and how they read on the wire: the seed
// turned into stored records, and stored records turned into the contract's
// DTOs (section 4.1). `leadsDemoStore` owns the state and the writes.

export interface StoredEntry {
  id: string;
  kind: LeadEntryKind;
  body: string | null;
  fromStage: LeadStage | null;
  toStage: LeadStage | null;
  personaId: string | null;
  author: LeadEntryAuthorDTO | null;
  createdAt: string;
  editedAt: string | null;
}

export interface StoredLead extends LeadClashCandidate {
  type: LeadType;
  stage: LeadStage;
  location: string | null;
  phone: string | null;
  followUpOn: string | null;
  createdAt: string;
  updatedAt: string;
  entries: StoredEntry[];
}

const DAY_MS = 86_400_000;

/** Plain text order, the order Postgres `ORDER BY` gives ids and stamps. */
export const compareText = (first: string, second: string): number =>
  first < second ? -1 : first > second ? 1 : 0;

export const isDueLead = (lead: StoredLead, today: string): boolean =>
  isLeadFollowUpDue(lead.stage, lead.followUpOn, today);

/** The list order: due follow-ups first, oldest date first, then the
 *  newest change, then the id (contract 4.2). */
export function compareForList(
  today: string,
): (first: StoredLead, second: StoredLead) => number {
  return (first, second) => {
    const isFirstDue = isDueLead(first, today);
    const isSecondDue = isDueLead(second, today);
    return (
      Number(!isFirstDue) - Number(!isSecondDue) ||
      (isFirstDue && isSecondDue
        ? compareText(first.followUpOn ?? "", second.followUpOn ?? "")
        : 0) ||
      compareText(second.updatedAt, first.updatedAt) ||
      compareText(second.id, first.id)
    );
  };
}

/** Every stage with its count, 0 when none. */
export function stageCountsOf(
  leads: readonly StoredLead[],
): Record<LeadStage, number> {
  const stageCounts: Record<LeadStage, number> = {
    to_contact: 0,
    contacted: 0,
    in_talks: 0,
    on_board: 0,
    not_now: 0,
  };
  for (const lead of leads) stageCounts[lead.stage] += 1;
  return stageCounts;
}

/** The single-value fields an update compares with what is stored. */
const SCALAR_FIELDS = [
  "name",
  "type",
  "stage",
  "location",
  "email",
  "phone",
  "followUpOn",
  "linkedPersonaId",
] as const;

/** Whether an update changes anything: a field sent with its current value
 *  is no change. */
export const hasLeadChanged = (previous: StoredLead, next: StoredLead) =>
  JSON.stringify(next.links) !== JSON.stringify(previous.links) ||
  SCALAR_FIELDS.some((field) => next[field] !== previous[field]);

function seedAuthorOf(authorId: string | null): LeadEntryAuthorDTO | null {
  const author = authorId === null ? undefined : DEMO_LEAD_AUTHORS[authorId];
  if (authorId === null || author === undefined) return null;
  return { id: authorId, ...author, avatarCrop: null };
}

/** The demo viewer, an Admin, writes every new line. */
export const viewerAuthor = (): LeadEntryAuthorDTO => ({
  id: String(currentUser.id),
  displayName: `${currentUser.first} ${currentUser.last}`,
  avatarUrl: currentUser.photo ?? null,
  avatarCrop: null,
});

/** A seed record as stored: entries get ids oldest first, so a tie on the
 *  timestamp still reads newest first by id. */
export function seededLead(
  record: DemoLeadRecord,
  now: number,
  today: string,
  nextEntryId: () => string,
): StoredLead {
  const stampOf = (daysAgo: number) =>
    new Date(now - daysAgo * DAY_MS).toISOString();
  const entries = [...record.entries]
    .sort((first, second) => second.daysAgo - first.daysAgo)
    .map((entry): StoredEntry => ({
      id: nextEntryId(),
      kind: entry.kind,
      body: entry.body ?? null,
      fromStage: entry.fromStage ?? null,
      toStage: entry.toStage ?? null,
      personaId: entry.personaId ?? null,
      author: seedAuthorOf(entry.authorId),
      createdAt: stampOf(entry.daysAgo),
      editedAt: entry.isEdited ? stampOf(Math.max(entry.daysAgo - 1, 0)) : null,
    }));
  const { followUpOffsetDays, entries: _seedEntries, ...fields } = record;
  return {
    ...fields,
    links: [...fields.links],
    followUpOn:
      followUpOffsetDays === null
        ? null
        : shiftLeadDay(today, followUpOffsetDays),
    createdAt: entries[0]?.createdAt ?? stampOf(0),
    updatedAt: entries[entries.length - 1]?.createdAt ?? stampOf(0),
    entries,
  };
}

const findPersona = (personaId: string | null): DemoSubprofile | undefined =>
  DEMO_SUBPROFILES.find((persona) => persona.id === personaId);

/** The persona-only projection: the six `LeadPersonaDTO` keys. */
const toLeadPersona = (persona: DemoSubprofile): LeadPersonaDTO => ({
  id: persona.id,
  handle: persona.handle,
  displayName: persona.displayName,
  kind: persona.kind,
  avatarUrl: persona.avatarUrl,
  avatarCrop: persona.avatarCrop ?? null,
});

function linkedPersonaOf(lead: StoredLead): LeadLinkedPersonaDTO | null {
  const persona = findPersona(lead.linkedPersonaId);
  if (!persona) return null;
  return {
    ...toLeadPersona(persona),
    publicState: demoPersonaPublicState(persona),
  };
}

const isPersonaKind = (kind: LeadEntryKind) =>
  kind === "persona_linked" || kind === "persona_unlinked";

const toEntryDTO = ({ personaId, ...entry }: StoredEntry): LeadEntryDTO => {
  const persona = isPersonaKind(entry.kind)
    ? findPersona(personaId)
    : undefined;
  return {
    ...entry,
    persona: persona ? toLeadPersona(persona) : null,
    canEdit: entry.kind === "note",
  };
};

const newestFirst = (first: StoredEntry, second: StoredEntry): number =>
  compareText(second.createdAt, first.createdAt) ||
  compareText(second.id, first.id);

/** `LeadDTO`: every link and every line, newest first. */
export function toLeadDTO(lead: StoredLead, today: string): LeadDTO {
  const { linkedPersonaId: _personaId, entries, ...fields } = lead;
  return {
    ...fields,
    links: [...lead.links],
    isFollowUpDue: isDueLead(lead, today),
    linkedPersona: linkedPersonaOf(lead),
    entries: [...entries].sort(newestFirst).map(toEntryDTO),
  };
}

/** `LeadListItemDTO`: the first three links and the full count. */
export function toListItem(lead: StoredLead, today: string): LeadListItemDTO {
  const newestEntry = [...lead.entries].sort(newestFirst)[0];
  return {
    id: lead.id,
    name: lead.name,
    type: lead.type,
    stage: lead.stage,
    location: lead.location,
    links: lead.links.slice(0, LEAD_LIST_LINKS_SHOWN),
    linkCount: lead.links.length,
    followUpOn: lead.followUpOn,
    isFollowUpDue: isDueLead(lead, today),
    linkedPersona: linkedPersonaOf(lead),
    noteCount: lead.entries.filter((entry) => entry.kind === "note").length,
    lastEntryAt: newestEntry?.createdAt ?? lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

/** Shown personas whose handle starts with the prefix, by name then id. */
function personasByHandlePrefix(prefix: string): DemoSubprofile[] {
  const foldedPrefix = prefix.toLowerCase();
  if (foldedPrefix === "") return [];
  return DEMO_SUBPROFILES.filter(
    (persona) =>
      demoPersonaPublicState(persona) === "shown" &&
      (persona.handle ?? "").toLowerCase().startsWith(foldedPrefix),
  ).sort(
    (first, second) =>
      compareText(first.displayName, second.displayName) ||
      compareText(first.id, second.id),
  );
}

/** The persona search over a normalized term: `@` searches handles (the
 *  rest trimmed, as the server does), any other term the directory; each
 *  result names the lead that links it. */
export function searchLeadPersonasIn(
  leads: readonly StoredLead[],
  term: string,
): LeadPersonaSearchResultDTO[] {
  if (term === "") return [];
  const personas = term.startsWith("@")
    ? personasByHandlePrefix(term.slice(1).trim())
    : mockDirectory({ query: term }).flatMap((card) => {
        const persona = findPersona(card.id ?? null);
        return persona ? [persona] : [];
      });
  return personas.slice(0, LEAD_PERSONA_SEARCH_LIMIT).map((persona) => {
    const holder = leads.find((lead) => lead.linkedPersonaId === persona.id);
    return {
      persona: toLeadPersona(persona),
      linkedLead: holder ? { id: holder.id, name: holder.name } : null,
    };
  });
}
