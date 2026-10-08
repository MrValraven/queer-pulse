import { createContext, useContext } from "react";

/** Empty map is the default: without a provider, MentionText resolves nothing
 *  and renders exactly as it did before this feature (sigil + slug). Module-level
 *  constant so its identity is stable and never triggers re-renders. */
const EMPTY_NAME_MAP: ReadonlyMap<string, string> = new Map();

export const MentionNamesContext =
  createContext<ReadonlyMap<string, string>>(EMPTY_NAME_MAP);

/** Read the current slug -> display-name map. */
export function useMentionNameMap(): ReadonlyMap<string, string> {
  return useContext(MentionNamesContext);
}

/** Which mentions the current name map can vouch for as pointing at nothing.
 *  `true`: the map lists every ref that exists and that the viewer may see (the
 *  demo registries once loaded), so any ref missing from it is unresolved.
 *  A set: the `kind:slug` refs a settled server lookup was asked about and did
 *  not name; every other ref is still unknown. `false`: nothing is known, so
 *  the corpus provider (first page typeahead lists in live mode) and no
 *  provider at all never un-link. A non-topic mention known to be unresolved
 *  renders as plain text. */
export type MentionNameAuthority = boolean | ReadonlySet<string>;

export const MentionNamesAuthorityContext =
  createContext<MentionNameAuthority>(false);

/** Read which refs the current name map vouches for. */
export function useMentionNameAuthority(): MentionNameAuthority {
  return useContext(MentionNamesAuthorityContext);
}

/** Whether `refKey` (`kind:slug`) is known to point at nothing under
 *  `authority`. The caller still checks the name map first: a named ref is
 *  never unresolved. */
export function isMentionRefKnownUnresolved(
  authority: MentionNameAuthority,
  refKey: string,
): boolean {
  return typeof authority === "boolean" ? authority : authority.has(refKey);
}
