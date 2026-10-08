import { useMemo, type ReactNode } from "react";
import { mentionNameKey } from "./mentionNameKey";
import {
  MentionNamesAuthorityContext,
  MentionNamesContext,
} from "./MentionNamesContext";
import { useMentionSuggestions } from "./useMentionSuggestions";

/** Build the "kind:slug" -> name map from the dual-mode suggestion lists.
 *  Topics are intentionally excluded: `#tag` mentions keep their tag as the
 *  label, so they are never resolved to a name. */
function useMentionNames(): {
  nameMap: ReadonlyMap<string, string>;
  isSettled: boolean;
} {
  const { members, communities, businesses, events, threads, isSettled } =
    useMentionSuggestions();
  const nameMap = useMemo(() => {
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
  return { nameMap, isSettled };
}

/** Supplies the slug -> name lookup to descendant MentionText renders. Mount it
 *  around a subtree that renders mentions (e.g. the messages view); it pulls in
 *  the mention corpora via useMentionSuggestions, so mount it where that data is
 *  already loaded rather than app-wide. */
export function MentionNamesProvider({
  children,
  isAuthoritativeWhenSettled = false,
}: {
  children: ReactNode;
  /** Demo mode only: the demo registries are the whole world, so once every
   *  corpus has loaded the map is complete and an unlisted mention points at
   *  nothing. Live corpora are first pages and never qualify. */
  isAuthoritativeWhenSettled?: boolean;
}) {
  const { nameMap, isSettled } = useMentionNames();
  return (
    <MentionNamesAuthorityContext.Provider
      value={isAuthoritativeWhenSettled && isSettled}
    >
      <MentionNamesContext.Provider value={nameMap}>
        {children}
      </MentionNamesContext.Provider>
    </MentionNamesAuthorityContext.Provider>
  );
}
