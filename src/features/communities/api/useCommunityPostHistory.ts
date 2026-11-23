import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { memberRefDisplayName } from "../../../shared/api/refs";
import type { TFunction } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PostRevisionEntry } from "../../forum/EditHistoryModal";
import {
  getCommunityPostHistory,
  getCommunityReplyHistory,
} from "./communities.api";
import type {
  CommunityPostHistoryEntry,
  CommunityReplyHistoryEntry,
} from "./communities.api";

function authorName(
  entry: { author: CommunityPostHistoryEntry["author"] },
  t: TFunction,
): string {
  return memberRefDisplayName(entry.author, t);
}

// Community posts/replies have no title, so `previousTitle` is always null.
function postEntryToRevision(
  entry: CommunityPostHistoryEntry,
  t: TFunction,
): PostRevisionEntry {
  return {
    id: entry.id,
    authorName: authorName(entry, t),
    createdAt: entry.createdAt,
    previousBody: entry.previousBody,
    previousTitle: null,
  };
}

function replyEntryToRevision(
  entry: CommunityReplyHistoryEntry,
  t: TFunction,
): PostRevisionEntry {
  return {
    id: entry.id,
    authorName: authorName(entry, t),
    createdAt: entry.createdAt,
    previousBody: entry.previousText,
    previousTitle: null,
  };
}

// Demo has no server-side revision store; the history modal shows an empty
// timeline in demo mode. Live fetches lazily (gated by `enabled` — only when
// the modal opens).
export function useCommunityPostHistory(
  slug: string,
  postId: string | undefined,
  enabled: boolean,
): { revisions: PostRevisionEntry[]; isLoading: boolean } {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const live = !demoMode && enabled && !!postId;
  const query = useQuery({
    queryKey: ["community-post-history", slug, postId],
    enabled: live,
    queryFn: () => getCommunityPostHistory(slug, postId as string),
  });
  return {
    revisions: (query.data?.revisions ?? []).map((entry) =>
      postEntryToRevision(entry, t),
    ),
    isLoading: live && query.isLoading,
  };
}

export function useCommunityReplyHistory(
  slug: string,
  postId: string | undefined,
  replyId: string | undefined,
  enabled: boolean,
): { revisions: PostRevisionEntry[]; isLoading: boolean } {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const live = !demoMode && enabled && !!postId && !!replyId;
  const query = useQuery({
    queryKey: ["community-reply-history", slug, postId, replyId],
    enabled: live,
    queryFn: () =>
      getCommunityReplyHistory(slug, postId as string, replyId as string),
  });
  return {
    revisions: (query.data?.revisions ?? []).map((entry) =>
      replyEntryToRevision(entry, t),
    ),
    isLoading: live && query.isLoading,
  };
}
