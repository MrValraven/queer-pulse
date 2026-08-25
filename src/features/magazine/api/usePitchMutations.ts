import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  createPitch as sendCreatePitch,
  triagePitch,
  type CreatePitchDto,
  type PitchDto,
  type TriagePitchDto,
} from "./pieces.api";

const TRIAGE_TOAST: Record<TriagePitchDto["verdict"], string> = {
  maybe: "Marked as maybe",
  pass: "Pitch passed",
  commission: "Commissioned",
};

/**
 * Editor desk pitch-inbox mutations, dual-mode. Demo never touches the
 * network — each mutation resolves immediately with a toast describing what
 * would have happened. Live calls the matching `AdminMagazinePiecesController`
 * pitch endpoints, then invalidates the affected queries. Triaging a pitch as
 * `commission` also creates a piece, so it invalidates the pieces list and
 * desk summary alongside the pitches list. Mirrors `useDeckMutations.ts`.
 */
export function usePitchMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  /** PATCH /magazine/admin/pitches/:id — decide a pitch's fate. */
  const triage = useMutation<
    PitchDto | { id: string } | undefined,
    Error,
    { id: string; body: TriagePitchDto }
  >({
    mutationFn: async ({ id, body }) => {
      if (demoMode) {
        showToast(TRIAGE_TOAST[body.verdict], "success");
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
        showToast("Pitch added", "success");
        return { id: "demo" };
      }
      const pitch = await sendCreatePitch(body);
      return { id: pitch.id };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["magazine-pitches"] });
    },
  });

  return { triage, createPitch };
}
