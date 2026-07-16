import { routes } from "../../app/routeMap";

/** Copy for the persona not-found wall. Mirrors the warm, non-blaming tone of
 *  the main ProfilePage's not-found state — nothing's wrong on the reader's end. */
export const NOT_FOUND = {
  title: "This persona isn't here",
  description:
    "It may have been unpublished, kept private, or this link could be out of date. Nothing's wrong on your end.",
  action: { label: "Browse personas", to: routes.subprofiles },
  backLabel: "← Go back",
} as const;

/** Prefix shown before the owner's name when a linked persona names its main
 *  profile — offered as a gentle tie, never for unlinked (pseudonymous) personas. */
export const OWNER_TIE_PREFIX = "Part of";
