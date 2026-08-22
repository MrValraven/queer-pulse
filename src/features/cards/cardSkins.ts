import type { CardSkin } from "./api/cards.api";

/**
 * The five curated skins. Each pairing is fixed so a community's choice can
 * never produce a failing contrast ratio: the a11y ratchet blocks the build,
 * and a card is unreadable at a door if its ink and ground are close.
 */
export const CARD_SKINS: CardSkin[] = ["plum", "cream", "jade", "coral", "ink"];
