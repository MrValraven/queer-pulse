import { useMemo, type ReactNode } from "react";
import { mentionNameKey } from "./mentionNameKey";
import { MentionNamesContext } from "./MentionNamesContext";
import { useMentionSuggestions } from "./useMentionSuggestions";

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
