import { MEMBERS, memberName } from "../../members/data/members";
import type {
  CardCreditsDTO,
  CreditFaceDTO,
  LinkVisibility,
  SubprofileStatus,
  Visibility,
} from "../api/subprofiles.api";

// ── Demo credits ─────────────────────────────────────────────────────────────
// The demo twin of the backend's card credits (directory decision D5). Kept
// free of `subprofiles.data.ts` so that file can import it: the registry is
// handed in by the caller (`toCardDto`) instead.

/** The persona fields the credit rules read. `DemoSubprofile` fits it. */
export interface DemoCreditPersona {
  id: string;
  handle: string | null;
  displayName: string;
  avatarUrl: string | null;
  accent: string | null;
  /** The creator. Demo models no co-owners on a published persona, so this
   *  one slug is the persona's whole roster, R(P). */
  ownerSlug: string;
  linkVisibility: LinkVisibility;
  status: SubprofileStatus;
  visibility: Visibility;
  removedAt?: string | null;
}

interface DemoCreditEdgeBase {
  /** The credited item's id, also the "Made together" card's key. */
  itemId: string;
  /** Handle of the persona whose item carries the credit. */
  fromHandle: string;
  createdAt: string;
  workTitle: string;
}

/** One credit on one demo item: a persona's handle or a member. */
export type DemoCreditEdge =
  | (DemoCreditEdgeBase & { kind: "persona"; toHandle: string })
  | (DemoCreditEdgeBase & {
      kind: "member";
      memberSlug: string;
      name: string;
      avatarUrl: string | null;
    });

const memberEdge = (
  base: DemoCreditEdgeBase,
  memberSlug: string,
): DemoCreditEdge => ({
  ...base,
  kind: "member",
  memberSlug,
  name: memberName(memberSlug),
  avatarUrl: MEMBERS[memberSlug]?.photo ?? null,
});

/**
 * Every credit in the demo world, newest first. Three of them are there to be
 * refused, so the demo shows the rules at work: a member credit on an
 * unlinked persona, a member crediting their own persona, and a credit to a
 * linked persona. The last edge is there to be KEPT: two unlinked personas of
 * one owner credit each other, and the pair counts. The persona page shows
 * credits with no roster check, so hiding a shared-owner pair on a card would
 * let a viewer spot the gap and tie a pseudonymous persona to its owner.
 */
export const DEMO_CARD_CREDIT_EDGES: readonly DemoCreditEdge[] = [
  {
    itemId: "itm-credit-lowlight-portraits",
    fromHandle: "nightform",
    createdAt: "2026-10-18T19:00:00.000Z",
    workTitle: "Press portraits for the Lowlight EP",
    kind: "persona",
    toHandle: "grain-studio",
  },
  memberEdge(
    {
      itemId: "itm-credit-rui-reading-app",
      fromHandle: "rui-engineering",
      createdAt: "2026-10-02T10:00:00.000Z",
      workTitle: "A reading app for a poetry night",
    },
    "anika",
  ),
  {
    itemId: "itm-credit-winter-supper-aprons",
    fromHandle: "casa-corvo",
    createdAt: "2026-09-27T20:30:00.000Z",
    workTitle: "Aprons and uniforms for the winter supper series",
    kind: "persona",
    toHandle: "santa-cruel",
  },
  memberEdge(
    {
      itemId: "itm-credit-maria-group-sessions",
      fromHandle: "maria-practice",
      createdAt: "2026-09-12T17:00:00.000Z",
      workTitle: "A peer support evening for trans newcomers",
    },
    "kai",
  ),
  {
    itemId: "itm-credit-cabaret-score",
    fromHandle: "vanda-diesel",
    createdAt: "2026-08-30T22:00:00.000Z",
    workTitle: "Live score for a cabaret night at Damas",
    kind: "persona",
    toHandle: "nightform",
  },
  {
    itemId: "itm-credit-bloco-opening-set",
    fromHandle: "jordan-lechatdashinko",
    createdAt: "2026-08-09T21:00:00.000Z",
    workTitle: "Opening set for the Bloco Rosa street party",
    kind: "persona",
    toHandle: "bloco-rosa",
  },
  {
    itemId: "itm-credit-third-floor-show",
    fromHandle: "terceiro-piso",
    createdAt: "2026-07-19T18:00:00.000Z",
    workTitle: "Medium format portraits, a group show on the third floor",
    kind: "persona",
    toHandle: "grain-studio",
  },
  {
    itemId: "itm-credit-pride-stories",
    fromHandle: "antes-de-nos",
    createdAt: "2026-06-28T15:00:00.000Z",
    workTitle: "Recorded stories from the first Lisbon pride marches",
    kind: "persona",
    toHandle: "aula-aberta",
  },
  {
    itemId: "itm-credit-supper-club-site",
    fromHandle: "rui-engineering",
    createdAt: "2026-06-02T09:00:00.000Z",
    workTitle: "Booking site for the Casa Corvo supper club",
    kind: "persona",
    toHandle: "casa-corvo",
  },
  memberEdge(
    {
      itemId: "itm-credit-threshold-mix",
      fromHandle: "nightform",
      createdAt: "2026-05-24T23:00:00.000Z",
      workTitle: "Threshold, the extended mix",
    },
    "rui",
  ),
  memberEdge(
    {
      itemId: "itm-credit-anika-self",
      fromHandle: "anika-poetry",
      createdAt: "2026-05-20T12:00:00.000Z",
      workTitle: "Notes from a first reading",
    },
    "anika",
  ),
  {
    itemId: "itm-credit-linked-partner",
    fromHandle: "anika-poetry",
    createdAt: "2026-05-02T12:00:00.000Z",
    workTitle: "Launch notes for the poetry reading app",
    kind: "persona",
    toHandle: "rui-engineering",
  },
  {
    itemId: "itm-credit-same-owner",
    fromHandle: "mesa-do-dragao",
    createdAt: "2026-04-11T19:00:00.000Z",
    workTitle: "A one-shot campaign for the language class",
    kind: "persona",
    toHandle: "aula-aberta",
  },
];

// ── Rules ────────────────────────────────────────────────────────────────────

/** Published, open, not removed and holding a handle: a persona the viewer
 *  may see credited at all. Demo has no takedowns and no blocks. */
export function isVisibleCreditPersona(persona: DemoCreditPersona): boolean {
  return (
    persona.status === "published" &&
    persona.visibility === "open" &&
    !persona.removedAt &&
    Boolean(persona.handle)
  );
}

/** The outbound persona rule (`isPersonaPairCredit` on the backend): `partner`
 *  counts on `author`'s card when it is visible, UNLINKED and another persona.
 *  No roster or owner check: the persona page lists credits without one, so a
 *  card that skipped a shared-owner pair would let a viewer tie a pseudonymous
 *  persona to its owner. */
export function isEligiblePersonaCredit(
  partner: DemoCreditPersona,
  author: DemoCreditPersona,
): boolean {
  return (
    isVisibleCreditPersona(partner) &&
    partner.linkVisibility === "unlinked" &&
    partner.id !== author.id
  );
}

interface Counterpart {
  identity: string;
  face: CreditFaceDTO;
  newestAt: string;
}

const personaFace = (persona: DemoCreditPersona): CreditFaceDTO => ({
  kind: "persona",
  name: persona.displayName,
  avatarUrl: persona.avatarUrl,
  accent: persona.accent,
});

/** The counterparts one edge gives persona `self`, outbound or inbound. */
function counterpartFor(
  self: DemoCreditPersona,
  edge: DemoCreditEdge,
  byHandle: ReadonlyMap<string, DemoCreditPersona>,
): Counterpart | null {
  if (edge.fromHandle === self.handle) {
    if (edge.kind === "member") {
      // A member is named only on a LINKED persona, and the persona's own
      // maker is never counted as a member credit.
      if (self.linkVisibility !== "linked") return null;
      if (edge.memberSlug === self.ownerSlug) return null;
      return {
        identity: `member:${edge.memberSlug}`,
        face: {
          kind: "member",
          name: edge.name,
          avatarUrl: edge.avatarUrl,
          accent: null,
        },
        newestAt: edge.createdAt,
      };
    }
    const partner = byHandle.get(edge.toHandle);
    if (!partner || !isEligiblePersonaCredit(partner, self)) return null;
    return {
      identity: `persona:${partner.id}`,
      face: personaFace(partner),
      newestAt: edge.createdAt,
    };
  }
  // Inbound: someone else's item credits this persona. Only an unlinked
  // persona with a handle can be credited by handle on another's work.
  if (edge.kind !== "persona" || edge.toHandle !== self.handle) return null;
  if (self.linkVisibility !== "unlinked") return null;
  const creditor = byHandle.get(edge.fromHandle);
  if (!creditor || !isVisibleCreditPersona(creditor)) return null;
  if (creditor.id === self.id) return null;
  return {
    identity: `persona:${creditor.id}`,
    face: personaFace(creditor),
    newestAt: edge.createdAt,
  };
}

const byNewestThenName = (first: Counterpart, second: Counterpart) =>
  second.newestAt.localeCompare(first.newestAt) ||
  first.face.name.localeCompare(second.face.name);

/**
 * Every visible persona's card credits, keyed by persona id: distinct
 * counterparts (a persona by id, a member by slug), and at most three faces,
 * newest shared work first and then by name. A persona with no credit gets
 * `{ count: 0, faces: [] }`.
 */
export function buildDemoCardCredits(
  personas: readonly DemoCreditPersona[],
  edges: readonly DemoCreditEdge[],
): Map<string, CardCreditsDTO> {
  const byHandle = new Map<string, DemoCreditPersona>();
  for (const persona of personas) {
    if (persona.handle) byHandle.set(persona.handle, persona);
  }
  const creditsById = new Map<string, CardCreditsDTO>();
  for (const self of personas) {
    const counterparts = new Map<string, Counterpart>();
    for (const edge of edges) {
      const counterpart = counterpartFor(self, edge, byHandle);
      if (!counterpart) continue;
      const known = counterparts.get(counterpart.identity);
      if (!known || known.newestAt < counterpart.newestAt) {
        counterparts.set(counterpart.identity, counterpart);
      }
    }
    const ordered = [...counterparts.values()].sort(byNewestThenName);
    creditsById.set(self.id, {
      count: ordered.length,
      faces: ordered.slice(0, 3).map((counterpart) => counterpart.face),
    });
  }
  return creditsById;
}
