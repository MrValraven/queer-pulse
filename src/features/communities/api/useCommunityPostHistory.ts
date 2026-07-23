import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { memberRefToPerson } from "../../../shared/api/refs";
import type { PostRevisionEntry } from "../../forum/EditHistoryModal";
import {
  getCommunityPostHistory,
  getCommunityReplyHistory,
} from "./communities.api";
import type {
  CommunityPostHistoryEntry,
  CommunityReplyHistoryEntry,
} from "./communities.api";

function authorName(entry: { author: CommunityPostHistoryEntry["author"] }): string {
  return memberRefToPerson(entry.author)?.name ?? "";
}

// Community posts/replies have no title, so `previousTitle` is always null.
function postEntryToRevision(entry: CommunityPostHistoryEntry): PostRevisionEntry {
  return {
    id: entry.id,
    authorName: authorName(entry),
    createdAt: entry.createdAt,
    previousBody: entry.previousBody,
    previousTitle: null,
  };
}

function replyEntryToRevision(entry: CommunityReplyHistoryEntry): PostRevisionEntry {
  return {
    id: entry.id,
    authorName: authorName(entry),
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
  const { demoMode } = useDemoMode();
  const live = !demoMode && enabled && !!postId;
  const query = useQuery({
    queryKey: ["community-post-history", slug, postId],
    enabled: live,
    queryFn: () => getCommunityPostHistory(slug, postId as string),
  });
  return {
    revisions: (query.data?.revisions ?? []).map(postEntryToRevision),
    isLoading: live && query.isLoading,
  };
}

export function useCommunityReplyHistory(
  slug: string,
  postId: string | undefined,
  replyId: string | undefined,
  enabled: boolean,
): { revisions: PostRevisionEntry[]; isLoading: boolean } {
  const { demoMode } = useDemoMode();
  const live = !demoMode && enabled && !!postId && !!replyId;
  const query = useQuery({
    queryKey: ["community-reply-history", slug, postId, replyId],
    enabled: live,
    queryFn: () =>
      getCommunityReplyHistory(slug, postId as string, replyId as string),
  });
  return {
    revisions: (query.data?.revisions ?? []).map(replyEntryToRevision),
    isLoading: live && query.isLoading,
  };
}
