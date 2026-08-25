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

/** Which surface is reading/posting — the editor desk or the writer
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

/** Maps the role-tagged demo fixture to real `PieceMessageDto`s from the
 *  point of view of `side` — mirrors the server computing `fromMe` per
 *  requester rather than baking one fixed boolean into the fixture. */
function demoThreadFor(side: PieceThreadSide): PieceMessageDto[] {
  return DEMO_PIECE_MESSAGES.map((seed) => ({
    id: seed.id,
    author: seed.authorName,
    body: seed.body,
    createdAt: seed.createdAt,
    fromMe: seed.authorRole === side,
  }));
}

/**
 * A piece's editor↔writer message thread (Phase 7 Wave F), dual-mode and
 * shared by both surfaces. Demo mode returns the static `DEMO_PIECE_MESSAGES`
 * fixture, re-derived per `side` (see `demoThreadFor`); live mode calls the
 * matching `GET /magazine/{admin,writer}/pieces/:id/messages` — both return
 * the same `PieceMessageDto[]` shape, oldest-first (chat order), so no
 * client-side branching on shape is needed.
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
      if (demoMode) return demoThreadFor(side);
      return side === "editor"
        ? getEditorPieceMessages(pieceId)
        : getWriterPieceMessages(pieceId);
    },
  });

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/** A synthetic id for a demo-only sent message — never sent to a server,
 *  only ever used as a React `key` within the same session's local cache. */
function demoMessageId(): string {
  return `demo-message-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Write side of `PieceThread`, dual-mode. Demo never touches the network —
 * `send` appends straight onto this exact query's own cache
 * (`queryClient.setQueryData`, keyed identically to `usePieceMessages`) with
 * `fromMe: true` (the local user just sent it), plus a toast confirming the
 * local-only write. Live mode posts to the side's real endpoint, then
 * ALWAYS invalidates the messages query rather than trusting the mutation
 * response directly into place — matches `useCommentMutations`'s convention
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
