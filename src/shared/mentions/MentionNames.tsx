import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMentionSuggestions } from "./useMentionSuggestions";

/** Stable lookup key so a resolved-name map is shared across all mention kinds. */
export function mentionNameKey(kind: string, slug: string): string {
  return `${kind}:${slug}`;
}

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

/** Build the "kind:slug" -> name map from the dual-mode suggestion lists.
 *  Topics are intentionally excluded: `#tag` mentions keep their tag as the
 *  label, so they are never resolved to a name. */
function useMentionNames(): ReadonlyMap<string, string> {
  const { members, communities, businesses, events, threads } =
    useMentionSuggestions();
  return useMemo(() => {
    const nameMap = new Map<string, string>();
    for (const group of [members, communities, businesses, events, threads]) {
      for (const suggestion of group) {
        if (suggestion.name) {
          nameMap.set(
            mentionNameKey(suggestion.kind, suggestion.slug),
            suggestion.name,
          );
        }
      }
    }
    return nameMap;
  }, [members, communities, businesses, events, threads]);
}

/** Supplies the slug -> name lookup to descendant MentionText renders. Mount it
 *  around a subtree that renders mentions (e.g. the messages view); it pulls in
 *  the mention corpora via useMentionSuggestions, so mount it where that data is
 *  already loaded rather than app-wide. */
export function MentionNamesProvider({ children }: { children: ReactNode }) {
  const nameMap = useMentionNames();
  return (
    <MentionNamesContext.Provider value={nameMap}>
      {children}
    </MentionNamesContext.Provider>
  );
}
