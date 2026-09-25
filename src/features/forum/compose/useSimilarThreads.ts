import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getThreads } from "../api/forum.api";
import { threadToCard } from "../api/forum.adapters";
import { THREADS, type Thread } from "../forum.data";
import { normalizeTitle, tokenize } from "./composeText";

// ── "Already discussed?" ────────────────────────────────────────────────────
// The rail answers this while the member is still typing the title, because
// the cheapest thread to answer is the one that already exists.
//
// It calls `getThreads` DIRECTLY rather than going through `useThreads`. That
// hook caches under `["forum-threads", …]`, which is exactly the key the
// publish mutation invalidates, so searching from the composer would have the
// composer repeatedly evicting and refetching the forum list behind it. This
// query lives under its own key and answers only this panel.

/** How long the title sits still before a search goes out. Matches
 *  `ForumSearch`, so the forum feels the same in both places. */
const SEARCH_DEBOUNCE_MS = 300;

/** Under this many meaningful words, a title is not a search yet. */
const MIN_TITLE_TOKENS = 2;

/** At most three, because the panel is advice beside the composer. */
const MAX_HITS = 3;

/** Under this many characters, two normalized titles matching means little. */
const DUPLICATE_MIN_LENGTH = 12;

/** How many distinct words two titles must share before one counts as a
 *  repeat of the other. */
const DUPLICATE_OVERLAP = 0.85;

/** The fewest meaningful words a title needs before the overlap test runs. */
const DUPLICATE_MIN_TOKENS = 3;

/** One thread already covering the ground the member is about to cover. */
export interface SimilarThread {
  /** Numeric id, for a demo route and for a stable React key. */
  id: number;
  /** Live routing slug. Absent on demo threads, which route by `id`. */
  slug?: string;
  title: string;
  category: string;
  replyCount: number;
  /** Already-relative "2mo" style label, translated. */
  postedLabel: string;
  /** True when somebody's reply in there has been marked as the answer. */
  hasAcceptedAnswer: boolean;
  /** A taste of that answer, when this mode can see one. Demo reads it off the
   *  accepted reply; live list responses carry no answer text, so it is
   *  absent there and the panel shows the accepted-answer flag alone. */
  acceptedAnswerExcerpt?: string;
}

export interface SimilarThreadsResult {
  threads: SimilarThread[];
  /** True when one of the hits is close enough to call this title a repeat.
   *  `composeBlockers` turns this into a refusal to publish. */
  isDuplicate: boolean;
  /** The title of that thread, for the blocker message. */
  duplicateTitle: string | null;
  isLoading: boolean;
  /** True while the typed title is long enough to search but the debounce
   *  has not sent it yet, so an empty `threads` is no answer yet. */
  isAwaitingFirstSearch: boolean;
}

/**
 * Threads already covering this title, debounced on the title itself.
 *
 * Demo mode: `getThreads` ignores `q` entirely there (the demo branch returns
 * the whole `THREADS` corpus), so the same title match and `top` ordering
 * `filterAndSortThreads` applies on the forum page is applied here, over the
 * same corpus. Without it the panel would answer every title with the same
 * three threads.
 */
export function useSimilarThreads(title: string): SimilarThreadsResult {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const [debouncedTitle, setDebouncedTitle] = useState(title);

  useEffect(() => {
    if (debouncedTitle === title) return;
    const timer = window.setTimeout(
      () => setDebouncedTitle(title),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [title, debouncedTitle]);

  const trimmedTitle = debouncedTitle.trim();
  const isSearchable = tokenize(trimmedTitle).length >= MIN_TITLE_TOKENS;
  const isAwaitingFirstSearch =
    !isSearchable && tokenize(title.trim()).length >= MIN_TITLE_TOKENS;

  const query = useQuery<Thread[]>({
    // Its OWN key namespace. Never `["forum-threads", …]`, which publishing
    // invalidates.
    queryKey: ["forum-compose-similar", demoMode, language, trimmedTitle],
    enabled: isSearchable,
    // The last answer stays on screen while the next debounce is in flight, so
    // the list and the rail tab count hold steady as the member types.
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (demoMode) return searchDemoThreads(trimmedTitle);
      const page = await getThreads(undefined, undefined, {
        q: trimmedTitle,
        sort: "top",
      });
      return page.data.map((dto) => threadToCard(dto, t, fmt));
    },
  });

  return useMemo(() => {
    if (!isSearchable)
      return {
        threads: [],
        isDuplicate: false,
        duplicateTitle: null,
        isLoading: false,
        isAwaitingFirstSearch,
      };
    const found = (query.data ?? []).slice(0, MAX_HITS).map(toSimilarThread);
    const duplicate = duplicateOf(trimmedTitle, found);
    return {
      threads: found,
      isDuplicate: !!duplicate,
      duplicateTitle: duplicate?.title ?? null,
      isLoading: query.isLoading,
      isAwaitingFirstSearch: false,
    };
  }, [
    isAwaitingFirstSearch,
    isSearchable,
    query.data,
    query.isLoading,
    trimmedTitle,
  ]);
}

/**
 * Demo mode's stand-in for the server's `q`. Mirrors `filterAndSortThreads`:
 * a lowercase title match, then the `top` ordering (pinned first, then votes).
 */
function searchDemoThreads(searchText: string): Thread[] {
  const needle = searchText.toLowerCase();
  return THREADS.filter((thread) =>
    thread.title.toLowerCase().includes(needle),
  ).sort(
    (first, second) =>
      (second.pinned ? 1000 : 0) +
      second.upvotes -
      ((first.pinned ? 1000 : 0) + first.upvotes),
  );
}

function toSimilarThread(thread: Thread): SimilarThread {
  const acceptedReply = thread.replies.find((reply) => reply.accepted);
  return {
    id: thread.id,
    slug: thread.slug,
    title: thread.title,
    category: thread.category,
    replyCount: thread.comments,
    postedLabel: thread.posted,
    hasAcceptedAnswer: !!thread.acceptedPostId || !!acceptedReply,
    acceptedAnswerExcerpt: acceptedReply?.body[0],
  };
}

/**
 * The thread this title is really a repeat of, or null.
 *
 * Two ways in: the normalized titles are identical, or they share at least
 * 85% of their meaningful words. Both sides are measured against the LARGER
 * word set, so a short title sitting inside a long one is not called a
 * duplicate of it.
 */
function duplicateOf(
  title: string,
  candidates: readonly SimilarThread[],
): SimilarThread | null {
  const normalized = normalizeTitle(title);
  if (normalized.length < DUPLICATE_MIN_LENGTH) return null;
  const mine = new Set(tokenize(normalized));
  for (const candidate of candidates) {
    const theirNormalized = normalizeTitle(candidate.title);
    if (theirNormalized === normalized) return candidate;
    const theirs = new Set(tokenize(theirNormalized));
    const shared = [...mine].filter((word) => theirs.has(word)).length;
    if (
      mine.size >= DUPLICATE_MIN_TOKENS &&
      shared / Math.max(mine.size, theirs.size) >= DUPLICATE_OVERLAP
    )
      return candidate;
  }
  return null;
}
