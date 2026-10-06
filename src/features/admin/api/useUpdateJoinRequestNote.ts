import { useQueryClient, type Query } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  updateJoinRequestNote,
  type JoinRequestDTO,
} from "../../auth/api/joinRequest.api";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { noteFieldsFromDto, type JoinRequestView } from "./useJoinRequests";
import { demoRow } from "./useReissueJoinRequestInvite";

/** Who demo mode credits with a note when nobody is signed in, matching the
 *  stand-in reviewer the fixture rows and the review mutation use. Exported so
 *  the note section can still say "you" for it. */
export const DEMO_EDITOR_ID = "demo-staff";
const DEMO_EDITOR_NAME = "Inês Duarte";

export interface UpdateJoinRequestNoteVars {
  id: string;
  /** The note as typed. Trimmed before it is sent; empty clears it. */
  note: string;
}

/**
 * True for the platform queue's own cache entries. The prefix
 * `["join-requests"]` is shared with the COMMUNITY join-request lists
 * (`["join-requests", slug]`), whose rows are a different shape, so the patch
 * below only touches keys whose second element is the demo-mode boolean that
 * `useJoinRequests` puts there.
 */
function isPlatformQueueQuery(query: Query): boolean {
  return typeof query.queryKey[1] === "boolean";
}

/**
 * Write, rewrite or clear the staff-only note on a declined join request.
 *
 * The note is for staff alone: a second reviewer's context on why a request
 * was declined, or what to look for if the same person asks again. The
 * applicant never sees it.
 *
 * Live mode PATCHes `/join-requests/:id/note` (moderator or admin); demo mode
 * synthesizes the same updated row, credited to the signed-in reviewer, so
 * the editor is exercisable with no backend.
 *
 * On success the saved note is laid onto every loaded queue row with that id
 * at once, so the row shows the new text the moment the editor closes. Live
 * mode then invalidates to reconcile with the server. Demo mode skips that
 * refetch, because its queue is re-derived from a fixture that never changes
 * and a refetch there would put the old note straight back.
 */
export function useUpdateJoinRequestNote() {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<JoinRequestDTO, Error, UpdateJoinRequestNoteVars>(
    {
      demoMode,
      // The note editor shows its own per-status error line and keeps the
      // draft, so silence the global duplicate toast.
      meta: { silentError: true },
      demoResult: ({ id, note }) => {
        const trimmedNote = note.trim();
        const hasNote = trimmedNote.length > 0;
        // The backend names an author with no profile "Member", so a note
        // with an author always carries a name; demo mode does the same.
        const editorName = user
          ? `${user.profile.firstName} ${user.profile.lastName}`.trim() ||
            "Member"
          : DEMO_EDITOR_NAME;
        return {
          ...demoRow(id),
          status: "declined",
          internalNote: hasNote ? trimmedNote : null,
          internalNoteUpdatedAt: hasNote ? new Date().toISOString() : null,
          internalNoteUpdatedBy: hasNote ? (user?.id ?? DEMO_EDITOR_ID) : null,
          internalNoteUpdatedByName: hasNote ? editorName : undefined,
        };
      },
      live: ({ id, note }) => updateJoinRequestNote(id, note.trim()),
      logLabel: "admin.joinRequest.updateNote",
      logContext: ({ id }) => ({ id }),
      // Merges ONLY the four note fields into the row already held. The
      // PATCH response is built without the list's batch context, so its
      // flags, prior-decline count and reference member come back empty, and
      // taking the whole row would wipe them off the screen.
      onSuccess: (updatedRow) => {
        queryClient.setQueriesData<JoinRequestView[]>(
          { queryKey: ["join-requests"], predicate: isPlatformQueueQuery },
          (rows) =>
            rows?.some((row) => row.id === updatedRow.id)
              ? rows.map((row) =>
                  row.id === updatedRow.id
                    ? { ...row, ...noteFieldsFromDto(updatedRow) }
                    : row,
                )
              : rows,
        );
      },
      onLiveSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      },
    },
  );
}
