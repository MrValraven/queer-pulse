import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { apiPost } from "../../../shared/api/client";
import { MY_SUBMISSIONS_QUERY_KEY } from "./useMySubmissions";
import type { StorySubmissionDTO } from "./magazine.api";
import {
  createPitch as sendCreatePitch,
  triagePitch,
  type CreatePitchDto,
  type PitchDto,
  type TriagePitchDto,
} from "./pieces.api";

/**
 * The member-facing withdraw endpoint: `POST /magazine/submissions/:id/withdraw`,
 * 200 with the updated row, 409 once the desk has decided.
 *
 * Held as one named constant on purpose, which is what made this cheap to
 * correct: the build's original contract named the WRITER workspace's
 * resource (`/magazine/writer/pitches/:id/withdraw`), and that was wrong in
 * two ways. The tracker this powers reads `GET /magazine/submissions/mine`, a
 * `magazine_story_submission` row, so the ids are a different space entirely;
 * and `MagazineWriterController` sits behind `@StaffRoles('magazine_writer')`,
 * so the endpoint would have 403'd every member it was built for.
 *
 * The id passed in is already the story-submission id, so only the path moved.
 */
function withdrawPitchPath(submissionId: string): string {
  return `/magazine/submissions/${submissionId}/withdraw`;
}

/** HTTP status the backend answers with once a pitch has been decided. */
export const PITCH_ALREADY_DECIDED_STATUS = 409;

/** Translation key per verdict, resolved with `t()` at the call site.
 *  `commission` shares the piece desk's own "Commissioned" toast: triaging a
 *  pitch that way IS a commission, and the editor sees the same confirmation
 *  whichever door they came through. */
const TRIAGE_TOAST_KEY: Record<TriagePitchDto["verdict"], string> = {
  maybe: "magazine:desk.pitchToast.maybe",
  pass: "magazine:desk.pitchToast.passed",
  commission: "magazine:desk.pieceToast.commissioned",
};

/**
 * Pitch mutations, dual-mode. Demo never touches the network — each mutation
 * resolves immediately with a toast describing what would have happened. Live
 * calls the matching endpoint, then invalidates the affected queries. Triaging
 * a pitch as `commission` also creates a piece, so it invalidates the pieces
 * list and desk summary alongside the pitches list. Mirrors
 * `useDeckMutations.ts`.
 *
 * `triage` and `createPitch` are the editor desk's inbox
 * (`AdminMagazinePiecesController`). `withdraw` is the MEMBER's own move on
 * their own pitch, from the tracker at `/magazine/pitches` (PRD-129) — it lives
 * here because it is a pitch mutation and shares the invalidation set, and it
 * is deliberately the only one of the three a plain member can reach.
 */
export function usePitchMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  /** PATCH /magazine/admin/pitches/:id — decide a pitch's fate. */
  const triage = useMutation<
    PitchDto | { id: string } | undefined,
    Error,
    { id: string; body: TriagePitchDto }
  >({
    mutationFn: async ({ id, body }) => {
      if (demoMode) {
        showToast(t(TRIAGE_TOAST_KEY[body.verdict]), "success");
        return { id };
      }
      return triagePitch(id, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["magazine-pitches"] });
      void queryClient.invalidateQueries({ queryKey: ["magazine-pieces"] });
      void queryClient.invalidateQueries({
        queryKey: ["magazine-desk-summary"],
      });
    },
  });

  /** POST /magazine/admin/pitches — submit a new pitch to the inbox. */
  const createPitch = useMutation<{ id: string }, Error, CreatePitchDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast(t("magazine:desk.pitchToast.added"), "success");
        return { id: "demo" };
      }
      const pitch = await sendCreatePitch(body);
      return { id: pitch.id };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["magazine-pitches"] });
    },
  });

  /**
   * POST /magazine/submissions/:id/withdraw — the member pulls their own
   * story submission back before the desk answers it.
   *
   * Demo mode resolves without a network call and lets `PitchTrackerPage` keep
   * its local, undoable withdraw: the sandbox has no server to forget the row,
   * so an undo there is honest. Live has no undo — the desk really does stop
   * seeing it — which is why the page confirms first.
   *
   * Invalidates the tracker's own query. The editor inbox is invalidated too:
   * a commissioned submission has a `magazine_pitch` row behind it, so a
   * withdrawal that lands while an editor has the inbox open should not leave
   * them looking at a pitch that is gone.
   */
  const withdraw = useMutation<
    StorySubmissionDTO | { id: string },
    Error,
    { id: string }
  >({
    mutationFn: async ({ id }) => {
      if (demoMode) return { id };
      // Answers with the withdrawn row in the same shape
      // `GET /magazine/submissions/mine` serves, so the tracker's own adapter
      // could consume it directly. Nothing reads it today: the list is
      // invalidated below and `listMine` stops returning withdrawn rows, so
      // the card leaves the tracker rather than re-rendering in a new state.
      return apiPost<StorySubmissionDTO>(withdrawPitchPath(id));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [MY_SUBMISSIONS_QUERY_KEY],
      });
      void queryClient.invalidateQueries({ queryKey: ["magazine-pitches"] });
    },
  });

  return { triage, createPitch, withdraw };
}
