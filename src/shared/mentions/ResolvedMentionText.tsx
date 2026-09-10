import { useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MentionText } from "./MentionText";
import { MentionNamesProvider } from "./MentionNames";
import { MentionNamesContext } from "./MentionNamesContext";
import { getMentionNames } from "./mentionNames.api";
import { mentionNameKey } from "./mentionNameKey";
import { mentionRefsIn } from "./mentionRefs";

/** A display name is about as stable as platform data gets, and a reader moving
 *  between profiles hits the same names repeatedly — so this outlives the 30s
 *  global default rather than re-asking on every hop. */
const NAME_STALE_TIME_MS = 5 * 60_000;

/**
 * `MentionText` with the names filled in — the renderer for standing text whose
 * mentions point anywhere on the platform, not just at whatever list the
 * current page happens to have loaded.
 *
 * The difference from mounting `MentionNamesProvider` yourself: that provider
 * resolves against the mention-typeahead corpora (`useMentionSuggestions`),
 * which in live mode are the FIRST PAGE of the member directory, the
 * communities list, and so on. That is the right trade inside a composer, where
 * the same corpora are already loaded and drive the picker. It is the wrong one
 * for a bio, which can name any member on the platform: anyone past page one
 * would keep rendering as `@slug`. This asks the server for exactly the refs
 * the text contains instead — one request, however large the directory grows.
 *
 * Demo mode keeps the corpus route: the demo registries are the whole world
 * there and resolve with full fidelity, and there is no backend to ask.
 *
 * Signed out, nothing resolves and mentions render as the author typed them.
 * `GET /mentions/names` is authenticated on purpose (a member's name reaches
 * the open web only through a public profile they published), which lines up
 * with the surfaces reachable signed out already rendering mentions inert.
 */
export function ResolvedMentionText({
  text,
  renderText,
  linkify = true,
}: {
  text: string;
  renderText?: (value: string) => ReactNode;
  linkify?: boolean;
}) {
  const { demoMode } = useDemoMode();
  const mention = (
    <MentionText text={text} renderText={renderText} linkify={linkify} />
  );
  // Two different providers, chosen by mode — so the live branch's query hook
  // never runs in demo mode and the demo branch's six corpus hooks never fire
  // requests in live mode. `demoMode` is fixed for the session, so this is a
  // branch, not a remount hazard.
  return demoMode ? (
    <MentionNamesProvider>{mention}</MentionNamesProvider>
  ) : (
    <LiveMentionNames text={text}>{mention}</LiveMentionNames>
  );
}

function LiveMentionNames({
  text,
  children,
}: {
  text: string;
  children: ReactNode;
}) {
  const nameMap = useMentionNamesFor(text);
  return (
    <MentionNamesContext.Provider value={nameMap}>
      {children}
    </MentionNamesContext.Provider>
  );
}

/** `kind:slug` -> display name for exactly the mentions `text` contains.
 *  Empty until the names land, so a mention renders as `sigil + slug` first and
 *  settles into the name — the same thing it renders permanently when a target
 *  can't be resolved at all. */
function useMentionNamesFor(text: string): ReadonlyMap<string, string> {
  const { loggedIn, checking } = useAuth();
  const refs = useMemo(() => mentionRefsIn(text), [text]);
  const { data } = useQuery({
    // `refs` is sorted and de-duplicated, so two surfaces rendering the same
    // bio (desktop hero, mobile header, the owner's own preview) share one key
    // and therefore one request.
    queryKey: ["mention-names", refs],
    queryFn: ({ signal }) => getMentionNames(refs, signal),
    enabled: loggedIn && !checking && refs.length > 0,
    staleTime: NAME_STALE_TIME_MS,
  });
  return useMemo(() => {
    const nameMap = new Map<string, string>();
    for (const resolved of data ?? []) {
      nameMap.set(mentionNameKey(resolved.kind, resolved.slug), resolved.name);
    }
    return nameMap;
  }, [data]);
}
