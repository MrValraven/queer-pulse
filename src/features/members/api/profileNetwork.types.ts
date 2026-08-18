/**
 * Shared data contract for the profile "Your network" section — the three
 * grouped lists a member sees on their OWN profile (who they're connected with,
 * who they vouched for, who vouched for them). The UI builds against these
 * types; `useProfileNetwork` produces them.
 */

/** One person in a network group — a connection or a voucher. */
export interface NetworkPerson {
  /** Member slug the row links to (`/members/:slug`). Empty for an anonymous voucher. */
  slug: string;
  /** First + last name, trimmed. Empty for an anonymous voucher. */
  name: string;
  avatarUrl?: string;
  pronouns?: string;
  /** The voucher vouched anonymously; render an un-linked, un-named row. */
  anonymous?: boolean;
  /** ISO timestamp of the action (connected / vouched); `null` when unknown. */
  at: string | null;
}

/** Which of the three network lists a group represents. */
export type NetworkGroupKey = "connected" | "vouchedGiven" | "vouchedReceived";

/** One titled list in the section, its people sorted newest-first (null `at` last). */
export interface NetworkGroup {
  key: NetworkGroupKey;
  people: NetworkPerson[];
  /**
   * The TRUE server-side total for this group — the count the hero chip shows.
   * For `connected` this is the paginated server `total` (which can exceed
   * `people.length` when more than one page exists); for the two vouch groups,
   * which arrive as full lists, it equals `people.length`. In demo mode every
   * total equals `people.length`.
   */
  total: number;
}
