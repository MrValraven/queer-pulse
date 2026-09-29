import type { TherapistCardVM } from "../../../resources/therapistPersonaCard";
import type { PublicSubprofileView } from "../../api/subprofiles.adapters";

/** Folds a topic for comparison: trimmed, lower-case, accents removed. */
function foldTopic(topic: string): string {
  return topic
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

/**
 * The topics the persona on screen can share with a directory card. A card
 * carries its specialism titles (demo) or its item tags (live directory), so
 * this gathers both from the page, plus the modality ids ("emdr", "act")
 * in case a therapist tagged items with them. Folded for comparison.
 */
export function therapistTopicSet(data: PublicSubprofileView): Set<string> {
  const topics = new Set<string>();
  const addTopic = (topic: string) => {
    const folded = foldTopic(topic);
    if (folded !== "") topics.add(folded);
  };
  for (const section of data.sections) {
    if (section.section === "links") continue;
    for (const item of section.items) {
      if (section.section === "specialisms") addTopic(item.title);
      item.tags.forEach(addTopic);
    }
  }
  (data.skinData?.modalities ?? []).forEach(addTopic);
  return topics;
}

/** FNV-1a, 32-bit: a small, stable string hash for the tie-break rotation. */
export function stableHash(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** How many of the card's topics the page on screen also lists. */
function sharedTopicCount(card: TherapistCardVM, topics: Set<string>): number {
  const cardTopics = new Set(card.specs.map(foldTopic));
  let shared = 0;
  for (const topic of cardTopics) {
    if (topic !== "" && topics.has(topic)) shared += 1;
  }
  return shared;
}

interface RankSimilarInput {
  /** Every other therapist card (the page's own persona already removed). */
  cards: TherapistCardVM[];
  /** The page's topics, from `therapistTopicSet`. */
  topics: Set<string>;
  /** A stable key for the page on screen; seeds the tie-break rotation. */
  currentSlug: string;
  limit: number;
}

/**
 * Orders the "Also worth a look" cards: most shared topics first, then
 * therapists taking new clients, then a rotation seeded by the page on
 * screen. The rotation hashes the page key with each card's address, so
 * each therapist page shows its own neighbours and every therapist gets a
 * turn across the directory. Pure: the same input always gives the same
 * order.
 */
export function rankSimilarTherapists({
  cards,
  topics,
  currentSlug,
  limit,
}: RankSimilarInput): TherapistCardVM[] {
  const scored = cards.map((card) => ({
    card,
    shared: sharedTopicCount(card, topics),
    isOpen: card.availability === "open",
    rotation: stableHash(`${currentSlug}|${card.href}`),
  }));
  scored.sort(
    (first, second) =>
      second.shared - first.shared ||
      Number(second.isOpen) - Number(first.isOpen) ||
      first.rotation - second.rotation ||
      first.card.href.localeCompare(second.card.href),
  );
  return scored.slice(0, limit).map((entry) => entry.card);
}
