import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useSocial } from "../../../app/providers/useSocial";
import { getFeed, type FeedItem } from "./feed.api";

/**
 * The window the sidebar's "New this week" heading promises, in days. Sent to
 * the backend as `joinedWithinDays`, whose spelling the global
 * `forbidNonWhitelisted` validation pipe checks exactly.
 */
export const NEW_MEMBERS_WINDOW_DAYS = 7;

/**
 * PRD-168: the sidebar's "New this week" widget, bounded to people who
 * actually joined this week.
 *
 * The widget used to read `useFeed("People")`, which returns the newest active
 * members with no date bound at all, so on a quiet week it listed people who
 * joined months ago under a heading that says "this week". This hook asks the
 * same People tab for the same shape with `joinedWithinDays` set, and holds
 * its own query key so the People TAB is never narrowed alongside it: an
 * empty week now yields an empty list and the widget's existing empty state,
 * which is the honest answer.
 *
 * One page is enough. The widget shows at most five rows and has no pager, so
 * there is nothing for a cursor to do here.
 *
 * Demo mode is inert, exactly like `useFeed`: the feed page renders its
 * scripted `NEW_THIS_WEEK` rows and never reaches the API.
 */
export function useNewMembersThisWeek() {
  const { demoMode } = useDemoMode();
  const { blocked, muted } = useSocial();

  const query = useQuery<FeedItem[]>({
    // Deliberately NOT the shape `useFeed` uses (["feed", tab, demoMode,
    // language]). Sharing a key with the People tab is what would narrow the
    // tab to this week as well.
    queryKey: ["feed", "newMembersThisWeek", demoMode, NEW_MEMBERS_WINDOW_DAYS],
    enabled: !demoMode,
    queryFn: async () => {
      // No `lang`: it reaches the magazine source alone, and the People tab
      // carries no magazine items.
      const page = await getFeed(
        "People",
        undefined,
        undefined,
        NEW_MEMBERS_WINDOW_DAYS,
      );
      return page.data;
    },
  });

  // Defense-in-depth, matching `useFeed`: never flash someone this member has
  // blocked or muted while a fresh block propagates to the server.
  const hiddenAuthorHandles = useMemo(
    () => new Set([...blocked, ...muted]),
    [blocked, muted],
  );

  const items = useMemo<FeedItem[]>(() => {
    if (demoMode) return [];
    return (query.data ?? []).filter(
      (item) =>
        !item.actor?.handle || !hiddenAuthorHandles.has(item.actor.handle),
    );
  }, [demoMode, query.data, hiddenAuthorHandles]);

  return { ...query, items };
}
