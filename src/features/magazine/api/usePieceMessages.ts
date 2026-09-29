import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  getEditorPieceMessages,
  postEditorPieceMessage,
  type PieceMessageDto,
} from "./pieces.api";
import {
  getWriterPieceMessages,
  postWriterPieceMessage,
} from "./writerWorkspace.api";
import { DEMO_PIECE_MESSAGES } from "../data/pieceMessages.data";

/** Which surface is reading/posting: the editor desk or the writer
 *  workspace. Same `PieceMessageDto` shape either way; only the base path
 *  (and, in demo, which row counts as "me") differs. */
export type PieceThreadSide = "editor" | "writer";

/** Shared by `usePieceMessages` and `usePieceMessageMutations` so the query
 *  and its cache patches always agree on the exact key. */
export function pieceMessagesQueryKey(
  demoMode: boolean,
  side: PieceThreadSide,
  pieceId: string,
) {
  return ["magazine-piece-messages", demoMode, side, pieceId] as const;
}

/** Maps the role-tagged demo fixture keyed by `pieceId` to real
 *  `PieceMessageDto`s from the point of view of `side`: the fixture keeps
 *  each row's actual `authorRole` and this derives `fromMe` from it per
 *  requester, mirroring how the live server computes
 *  `fromMe: message.authorId === requestingUserId`. `pieceId` here is
 *  whatever id the caller's own surface
 *  reads by: the desk peek's own piece id, or the writer workspace's
 *  assignment id, both aliased to the same thread in `pieceMessages.data.ts`
 *  where they name the same piece. An id with no seeded thread resolves to
 *  `[]` (every piece used to show the same one thread before), so its
 *  peek falls straight through to the thread's own "no messages yet" empty
 *  state. */
function demoThreadFor(
  pieceId: string,
  side: PieceThreadSide,
): PieceMessageDto[] {
  const seeds = DEMO_PIECE_MESSAGES[pieceId] ?? [];
  return seeds.map((seed) => ({
    id: seed.id,
    author: seed.authorName,
    body: seed.body,
    createdAt: seed.createdAt,
    fromMe: seed.authorRole === side,
  }));
}

/**
 * A piece's editor↔writer message thread (Phase 7 Wave F), dual-mode and
 * shared by both surfaces. Demo mode returns `pieceId`'s own entry in the
 * static `DEMO_PIECE_MESSAGES` fixture, re-derived per `side` (see
 * `demoThreadFor`), or an empty thread for a piece with none seeded; live
 * mode calls the matching `GET /magazine/{admin,writer}/pieces/:id/messages`.
 * Both return the same `PieceMessageDto[]` shape, oldest-first (chat order),
 * so no client-side branching on shape is needed.
 */
export function usePieceMessages(pieceId: string, side: PieceThreadSide) {
  const { demoMode } = useDemoMode();
  const query = useQuery<PieceMessageDto[]>({
    queryKey: pieceMessagesQueryKey(demoMode, side, pieceId),
    // Guards the "no assignment yet" case (e.g. `EditorMessageCard` with an
    // empty writer workspace) so this never fires a malformed request
    // against `/pieces//messages`.
    enabled: pieceId !== "",
    queryFn: async () => {
      if (demoMode) return demoThreadFor(pieceId, side);
      return side === "editor"
        ? getEditorPieceMessages(pieceId)
        : getWriterPieceMessages(pieceId);
    },
  });

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/** A synthetic id for a demo-only sent message. It stays purely local, used
 *  only as a React `key` within the same session's own cache. */
function demoMessageId(): string {
  return `demo-message-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Write side of `PieceThread`, dual-mode. Demo never touches the network:
 * `send` appends straight onto this exact query's own cache
 * (`queryClient.setQueryData`, keyed identically to `usePieceMessages`) with
 * `fromMe: true` (the local user just sent it), plus a toast confirming the
 * local-only write. Live mode posts to the side's real endpoint, then
 * ALWAYS invalidates the messages query rather than trusting the mutation
 * response directly into place, matching `useCommentMutations`'s convention
 * so a slow/rejected optimistic update can never diverge from the server.
 */
export function usePieceMessageMutations(
  pieceId: string,
  side: PieceThreadSide,
) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const queryKey = pieceMessagesQueryKey(demoMode, side, pieceId);

  const send = useMutation<void, Error, string>({
    mutationFn: async (body) => {
      if (demoMode) {
        const newMessage: PieceMessageDto = {
          id: demoMessageId(),
          author: t("magazine:pieceThread.you"),
          body,
          createdAt: new Date().toISOString(),
          fromMe: true,
        };
        queryClient.setQueryData<PieceMessageDto[]>(queryKey, (thread = []) => [
          ...thread,
          newMessage,
        ]);
        showToast(t("magazine:pieceThread.sentToast"), "success");
        return;
      }
      if (side === "editor") await postEditorPieceMessage(pieceId, { body });
      else await postWriterPieceMessage(pieceId, { body });
    },
    onSuccess: () => {
      if (!demoMode) void queryClient.invalidateQueries({ queryKey });
    },
  });

  return { send };
}
