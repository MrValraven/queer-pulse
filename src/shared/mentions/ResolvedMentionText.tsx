import { useMemo, type ReactNode } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MentionText } from "./MentionText";
import { MentionNamesProvider } from "./MentionNames";
import {
  MentionNamesAuthorityContext,
  MentionNamesContext,
} from "./MentionNamesContext";
import {
  getMentionNames,
  type ResolvedMentionNameDTO,
} from "./mentionNames.api";
import { mentionNameKey } from "./mentionNameKey";
import { MAX_MENTION_NAME_REFS, mentionRefsInMarkdownAll } from "./mentionRefs";

/** A display name is about as stable as platform data gets, and a reader moving
 *  between profiles hits the same names repeatedly, so this outlives the 30s
 *  global default and skips re-asking on every hop. */
const NAME_STALE_TIME_MS = 5 * 60_000;

/**
 * `MentionText` with the names filled in, the renderer for standing text whose
 * mentions point anywhere on the platform, whatever list the
 * current page happens to have loaded.
 *
 * The difference from mounting `MentionNamesProvider` yourself: that provider
 * resolves against the mention-typeahead corpora (`useMentionSuggestions`),
 * which in live mode are the FIRST PAGE of the member directory, the
 * communities list, and so on. That is the right trade inside a composer, where
 * the same corpora are already loaded and drive the picker. It is the wrong one
 * for a bio, which can name any member on the platform: anyone past page one
 * would keep rendering as `@slug`. This asks the server for exactly the refs
 * the text contains in one request, however large the directory grows.
 *
 * Demo mode keeps the corpus route: the demo registries are the whole world
 * there and resolve with full fidelity, and there is no backend to ask.
 *
 * Once a lookup has settled (live: a query succeeded; demo: every registry
 * corpus has loaded), a member, community, business, event or thread mention
 * it was asked about and did not name points at nothing, so it renders as the
 * plain text the author typed (sigil + slug) with no link. Topics always link.
 * A mention no settled lookup has covered yet (the first request is pending or
 * failed, or it arrived with a new reply) keeps rendering as a link.
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
  const texts = useMemo(() => [text], [text]);
  return (
    <ResolvedMentionNamesProvider texts={texts}>
      <MentionText text={text} renderText={renderText} linkify={linkify} />
    </ResolvedMentionNamesProvider>
  );
}

/**
 * The provider behind `ResolvedMentionText`, for a page that renders many
 * pieces of standing text through plain `MentionText` (a forum thread, a
 * community thread). Every `MentionText` below it resolves against the names
 * of the refs found across `texts`, asked for in one query, so a page names
 * the people its posts mention however deep in the directory they sit.
 *
 * `texts` should be every body the subtree renders. Pass a memoised array
 * where the caller has one. The query key is built from the sorted refs, so
 * an array rebuilt each render re-parses its texts and reuses the same request.
 */
export function ResolvedMentionNamesProvider({
  texts,
  children,
}: {
  texts: readonly string[];
  children: ReactNode;
}) {
  const { demoMode } = useDemoMode();
  // Two different providers, chosen by mode, so the live branch's query hook
  // never runs in demo mode and the demo branch's six corpus hooks never fire
  // requests in live mode. `demoMode` is fixed for the session, so this is a
  // branch with no remount hazard.
  return demoMode ? (
    <MentionNamesProvider isAuthoritativeWhenSettled>
      {children}
    </MentionNamesProvider>
  ) : (
    <LiveMentionNames texts={texts}>{children}</LiveMentionNames>
  );
}

function LiveMentionNames({
  texts,
  children,
}: {
  texts: readonly string[];
  children: ReactNode;
}) {
  const { nameMap, unresolvedRefs } = useMentionNamesFor(texts);
  return (
    <MentionNamesAuthorityContext.Provider value={unresolvedRefs}>
      <MentionNamesContext.Provider value={nameMap}>
        {children}
      </MentionNamesContext.Provider>
    </MentionNamesAuthorityContext.Provider>
  );
}

/** `kind:slug` -> display name for exactly the mentions `texts` contain.
 *  Empty until the names land, so a mention renders as `sigil + slug` first and
 *  settles into the name, the same thing it renders permanently when a target
 *  can't be resolved at all. */
function useMentionNamesFor(texts: readonly string[]): {
  nameMap: ReadonlyMap<string, string>;
  unresolvedRefs: ReadonlySet<string>;
} {
  const { loggedIn, checking } = useAuth();
  const refs = useMemo(() => mentionRefsInMarkdownAll(texts), [texts]);
  const { data } = useQuery({
    // `refs` is sorted and de-duplicated, so two surfaces rendering the same
    // bio (desktop hero, mobile header, the owner's own preview) share one key
    // and therefore one request.
    queryKey: ["mention-names", refs],
    queryFn: ({ signal }) => getMentionNamesInChunks(refs, signal),
    enabled: loggedIn && !checking && refs.length > 0,
    staleTime: NAME_STALE_TIME_MS,
    // A thread's refs grow as "Load more" pages in replies or someone posts
    // one, and every change is a new key. Holding the previous answer while
    // the new one is in flight keeps the names already on screen from
    // flashing back to `@slug` for the length of a request.
    placeholderData: keepPreviousData,
  });
  return useMemo(() => {
    const names = new Map<string, string>();
    for (const resolved of data?.names ?? []) {
      names.set(mentionNameKey(resolved.kind, resolved.slug), resolved.name);
    }
    // `data` is always a settled answer, the current key's or, while a new
    // key is in flight, the previous one's. It vouches for exactly the refs
    // it was asked about, so a mention already shown as plain text stays
    // plain across the request and a ref added since keeps its link until an
    // answer covers it.
    const unresolvedRefs = new Set(
      (data?.requestedRefs ?? []).filter((ref) => !names.has(ref)),
    );
    return { nameMap: names, unresolvedRefs };
  }, [data]);
}

/** One settled lookup: the refs it asked about and the names that came back.
 *  Carrying the request beside the answer lets placeholder data still say
 *  which refs it covers. */
interface MentionNamesAnswer {
  requestedRefs: readonly string[];
  names: ResolvedMentionNameDTO[];
}

/** `getMentionNames` for any number of refs. The endpoint takes at most
 *  `MAX_MENTION_NAME_REFS` per call, so a busy thread is split into calls of
 *  that size, sent together, and merged into one answer. */
async function getMentionNamesInChunks(
  refs: readonly string[],
  signal: AbortSignal,
): Promise<MentionNamesAnswer> {
  const chunks: string[][] = [];
  for (let start = 0; start < refs.length; start += MAX_MENTION_NAME_REFS) {
    chunks.push(refs.slice(start, start + MAX_MENTION_NAME_REFS));
  }
  const chunkResults = await Promise.all(
    chunks.map((chunk) => getMentionNames(chunk, signal)),
  );
  return { requestedRefs: refs, names: chunkResults.flat() };
}
