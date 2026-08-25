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
