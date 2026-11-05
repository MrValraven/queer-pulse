import type {
  MadeTogetherItemDTO,
  MadeTogetherPersonaDTO,
} from "../api/subprofiles.api";
import { isContentSection, itemsShownForKind } from "../subprofile-kinds";
import { DEMO_SUBPROFILES, type DemoSubprofile } from "./subprofiles.data";
import {
  DEMO_CARD_CREDIT_EDGES,
  isEligiblePersonaCredit,
  isVisibleCreditPersona,
  type DemoCreditEdge,
} from "./subprofileCardCredits.data";

// ── Demo "Made together" strip ───────────────────────────────────────────────
// Built from the same authored credit edges as the cards' credits rows, so a
// pair on the strip is also a pair on both portraits. The endpoint's rules
// (directory decision D6) are applied here over the demo registry.

/** The endpoint's hard cap; the hook slices to the asked limit. */
const MADE_TOGETHER_DEMO_CAP = 12;

/** How many cards one persona may appear on. */
const MAX_CARDS_PER_PERSONA = 2;

function toPersonaDTO(persona: DemoSubprofile): MadeTogetherPersonaDTO {
  return {
    handle: persona.handle ?? "",
    displayName: persona.displayName,
    kind: persona.kind,
    avatarUrl: persona.avatarUrl,
    accent: persona.accent,
  };
}

/** The author's first content picture in a section its kind shows, else its
 *  banner, else none. */
function demoWorkImage(author: DemoSubprofile): string | null {
  const pictured = itemsShownForKind(author.items, author.kind).find(
    (item) => isContentSection(item.section) && Boolean(item.imageUrl),
  );
  return pictured?.imageUrl ?? author.coverUrl ?? null;
}

const findByHandle = (handle: string) =>
  DEMO_SUBPROFILES.find((persona) => persona.handle === handle);

/** The partner for one edge, or null when it names a member or a persona the
 *  outbound rule refuses. */
function pairFor(
  edge: DemoCreditEdge,
): { author: DemoSubprofile; partner: DemoSubprofile } | null {
  if (edge.kind !== "persona") return null;
  const author = findByHandle(edge.fromHandle);
  const partner = findByHandle(edge.toHandle);
  if (!author || !partner || !isVisibleCreditPersona(author)) return null;
  if (!isEligiblePersonaCredit(partner, author)) return null;
  return { author, partner };
}

function buildMadeTogetherDemoItems(): MadeTogetherItemDTO[] {
  const newestFirst = [...DEMO_CARD_CREDIT_EDGES].sort(
    (first, second) =>
      second.createdAt.localeCompare(first.createdAt) ||
      first.itemId.localeCompare(second.itemId),
  );
  const seenPairs = new Set<string>();
  const appearances = new Map<string, number>();
  const items: MadeTogetherItemDTO[] = [];
  for (const edge of newestFirst) {
    if (items.length >= MADE_TOGETHER_DEMO_CAP) break;
    const pair = pairFor(edge);
    if (!pair) continue;
    const { author, partner } = pair;
    const pairKey = [author.id, partner.id].sort().join("|");
    if (seenPairs.has(pairKey)) continue;
    const authorCount = appearances.get(author.id) ?? 0;
    const partnerCount = appearances.get(partner.id) ?? 0;
    if (
      authorCount >= MAX_CARDS_PER_PERSONA ||
      partnerCount >= MAX_CARDS_PER_PERSONA
    ) {
      continue;
    }
    seenPairs.add(pairKey);
    appearances.set(author.id, authorCount + 1);
    appearances.set(partner.id, partnerCount + 1);
    items.push({
      itemId: edge.itemId,
      title: edge.workTitle,
      imageUrl: demoWorkImage(author),
      createdAt: edge.createdAt,
      author: toPersonaDTO(author),
      partner: toPersonaDTO(partner),
    });
  }
  return items;
}

/** The demo strip, newest work first: eight cards over real demo handles,
 *  every partner published, open, unlinked and another persona. Two personas
 *  of one owner may share a card, as on the live endpoint, which checks no
 *  roster. */
export const MADE_TOGETHER_DEMO_ITEMS: readonly MadeTogetherItemDTO[] =
  buildMadeTogetherDemoItems();
