/**
 * Curation for the homepage member highlight (the "#discovery" section).
 *
 * Member identities (name, role, hood, photo, tint, vouchers) resolve from
 * `../data/members` — every person here is a real registry member. This file
 * only picks who's highlighted and gives each featured member a line in their
 * own voice.
 */

export interface FeaturedSpotlight {
  /** Member slug (key into the members registry). */
  key: string;
  /** The member's own words — warm, specific, non-transactional. */
  quote: string;
}

/** Members who take turns in the large featured card (it rotates through these). */
export const featuredSpotlights: FeaturedSpotlight[] = [
  {
    key: "gabriella",
    quote:
      "I'm a Londoner in Lisbon, looking to collaborate with others who centre community, compassion and growth — in a world designed to isolate.",
  },
  {
    key: "philippine",
    quote:
      "I've spent my life bridging worlds — dance stages, runways, and now venture. Come find me if you're building something sustainable and don't know where to start.",
  },
  {
    key: "ines",
    quote:
      "I'm around for anyone rethinking a wordmark — or who just wants to argue about serifs over coffee.",
  },
  {
    key: "sofia",
    quote:
      "Tell me about the corners of this city no one films. That's usually where I want to point a camera.",
  },
  {
    key: "rui",
    quote:
      "I'll happily pair on a stubborn bug, or just help you start the side-project you keep putting off.",
  },
  {
    key: "diogo",
    quote:
      "Bring me your half-finished demos. Some of the best nights start as a voice note at 2am.",
  },
];

/** Members shown in the compact stack beside the featured card. */
export const highlightRowKeys = ["tomas", "beatriz", "mariana", "andre"];
