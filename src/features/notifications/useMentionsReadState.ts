import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { reasonFor } from "../../shared/api/errorMessage";
import { markNotificationRead } from "./api/notifications.api";
import { markAllMentionsRead } from "./api/mentions.api";
import type { MentionDay } from "./api/useMentions";
import type { MentionTabId } from "./mentions.data";

export interface MentionsReadState {
  /** Ids the member has read in this session, on top of the server's flags. */
  readIds: Set<string>;
  /** Still-unread mentions, after the local reads above. */
  unreadCount: number;
  /** ISO time the oldest still-unread mention landed, or null when unknown. */
  oldestUnreadIso: string | null;
  /** Badge total for each sub-tab. */
  tabCounts: Record<MentionTabId, number>;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

/**
 * Read state for the mentions thread: which rows the member has read here, the
 * derived counts, and the two writes that persist them.
 *
 * Both writes flip local state first for instant feedback, then invalidate the
 * **mentions** query as well as the bell. The cached rows still carry
 * `read: false`, so without that invalidation leaving the tab (or switching
 * language, which changes the query key) brought every row back unread. A
 * failed write restores the previous state and says why, instead of being
 * swallowed by an empty catch under a success toast that already fired.
 */
export function useMentionsReadState(
  mentionDays: MentionDay[],
): MentionsReadState {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const allMentions = useMemo(
    () => mentionDays.flatMap((group) => group.items),
    [mentionDays],
  );
  const unreadIds = useMemo(
    () =>
      allMentions
        .filter((mention) => mention.unread)
        .map((mention) => mention.id),
    [allMentions],
  );
  const unreadCount = unreadIds.filter((id) => !readIds.has(id)).length;

  // When the oldest still-unread mention actually landed. The panel's summary
  // line used to read "oldest from 14 hours ago" for every member in both
  // modes, because the distance was a constant rather than anything from data.
  const oldestUnreadIso = useMemo(() => {
    let oldest: { iso: string; time: number } | null = null;
    for (const mention of allMentions) {
      if (!mention.unread || readIds.has(mention.id) || !mention.createdAtIso) {
        continue;
      }
      const time = new Date(mention.createdAtIso).getTime();
      if (Number.isNaN(time)) continue;
      if (!oldest || time < oldest.time) {
        oldest = { iso: mention.createdAtIso, time };
      }
    }
    return oldest?.iso ?? null;
  }, [allMentions, readIds]);

  // Tab badge counts derived from the live data, so they stay correct in demo
  // and live mode alike (and never show mock totals when the thread is empty).
  const tabCounts: Record<MentionTabId, number> = useMemo(
    () => ({
      all: allMentions.length,
      unread: allMentions.filter(
        (mention) => mention.unread && !readIds.has(mention.id),
      ).length,
      posts: allMentions.filter((mention) => mention.category === "post")
        .length,
      articles: allMentions.filter((mention) => mention.category === "article")
        .length,
      events: allMentions.filter((mention) => mention.category === "event")
        .length,
    }),
    [allMentions, readIds],
  );

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["mentions"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  const markRead = useCallback(
    (id: string) => {
      const previous = readIds;
      setReadIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
      if (demoMode) return;
      // Live: a mention id IS a notification id, so the per-notification read
      // endpoint persists it.
      void markNotificationRead(id)
        .then(refresh)
        .catch((error: unknown) => {
          setReadIds(previous);
          showToast(
            reasonFor(error) ?? t("notifications:page.markReadError"),
            "error",
          );
        });
    },
    [readIds, demoMode, refresh, showToast, t],
  );

  const markAllRead = useCallback(() => {
    if (unreadCount === 0) return;
    const previous = readIds;
    setReadIds(new Set(unreadIds));
    if (demoMode) {
      showToast(t("notifications:mentions.markAllReadToast"), "success");
      return;
    }
    // Scoped to mentions server-side, so it never clears other notification
    // categories. The success toast waits for the server to confirm.
    void markAllMentionsRead()
      .then(() => {
        showToast(t("notifications:mentions.markAllReadToast"), "success");
        refresh();
      })
      .catch((error: unknown) => {
        setReadIds(previous);
        showToast(
          reasonFor(error) ?? t("notifications:page.markAllReadError"),
          "error",
        );
      });
  }, [unreadCount, readIds, unreadIds, demoMode, refresh, showToast, t]);

  return {
    readIds,
    unreadCount,
    oldestUnreadIso,
    tabCounts,
    markRead,
    markAllRead,
  };
}
