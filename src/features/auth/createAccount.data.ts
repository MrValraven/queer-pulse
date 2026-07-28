import { getMember } from "../members/data/members";

const INVITER = getMember("ines")!;
const INVITER_NAME = `${INVITER.first} ${INVITER.last}`;

/** The mock inviter, shown when the page is reached without an invite in flight. */
export const FALLBACK_INVITER = {
  name: INVITER_NAME,
  initials: INVITER.initials,
  photo: INVITER.photo,
};

export type Visibility = "open" | "network" | "private";

// Self-identification shorthand the member picks for themselves — kept as the
// widely-recognised English pronoun-set convention (he/him, she/her, they/them
// …) rather than translated, the same way a member's own pronouns are never
// translated on their profile.
export const PRONOUNS = [
  "he/him",
  "she/her",
  "they/them",
  "she/they",
  "he/they",
];

/** i18n Pattern A — visibility radio options, keyed for the component to resolve via `t()`. */
export const VIS_OPTS = [
  {
    value: "open",
    labelKey: "auth:createAccount.visibility.open.label",
    subtitleKey: "auth:createAccount.visibility.open.sub",
  },
  {
    value: "network",
    labelKey: "auth:createAccount.visibility.network.label",
    subtitleKey: "auth:createAccount.visibility.network.sub",
  },
  {
    value: "private",
    labelKey: "auth:createAccount.visibility.private.label",
    subtitleKey: "auth:createAccount.visibility.private.sub",
  },
] as const;
