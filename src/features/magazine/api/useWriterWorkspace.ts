import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getMyAssignments,
  getMyDraft,
  getMyPayments,
  getMyPitches,
  type WriterDraftDto,
} from "./writerWorkspace.api";
import { DEMO_WRITER } from "../data/writerWorkspace.data";

/**
 * The signed-in writer's own workspace — assignments, pitches, and payments,
 * scoped server-side to `writerId`/`submitterId` (see
 * `magazine-writer.controller.ts`). Demo mode always returns the static
 * `DEMO_WRITER` fixture; live mode fires the three `GET /magazine/writer/*`
 * endpoints as independent queries (rather than `useQueries`, to match this
 * feature's existing single-`useQuery`-per-resource style — see
 * `usePieceRecord`/`usePieces`) so a slow payments fetch never blocks
 * assignments from rendering.
 */
export function useWriterWorkspace() {
  const { demoMode } = useDemoMode();

  const assignmentsQuery = useQuery({
    queryKey: ["magazine-writer", "assignments", demoMode],
    queryFn: async () =>
      demoMode ? DEMO_WRITER.assignments : getMyAssignments(),
  });
  const pitchesQuery = useQuery({
    queryKey: ["magazine-writer", "pitches", demoMode],
    queryFn: async () => (demoMode ? DEMO_WRITER.pitches : getMyPitches()),
  });
  const paymentsQuery = useQuery({
    queryKey: ["magazine-writer", "payments", demoMode],
    queryFn: async () => (demoMode ? DEMO_WRITER.payments : getMyPayments()),
  });

  return {
    assignments: assignmentsQuery.data ?? [],
    pitches: pitchesQuery.data ?? [],
    payments: paymentsQuery.data ?? [],
    isLoading:
      assignmentsQuery.isLoading ||
      pitchesQuery.isLoading ||
      paymentsQuery.isLoading,
    isError:
      assignmentsQuery.isError || pitchesQuery.isError || paymentsQuery.isError,
  };
}

/**
 * The writer's own article draft for one piece (PRD-122a), so a writer can
 * read what their editor has actually done to the piece and revise from it
 * instead of filing blind into an article they have never seen.
 *
 * `pieceId` is nullable so a caller can mount the hook before the writer has
 * chosen a piece (the file-draft modal opens per assignment); the query simply
 * stays disabled until there is one. Demo mode resolves to `null`: the static
 * `DEMO_WRITER` fixture carries no article body, and inventing one would be
 * the demo/live leak the house rules forbid.
 */
export function useWriterDraft(pieceId: string | null) {
  const { demoMode } = useDemoMode();

  const draftQuery = useQuery<WriterDraftDto | null>({
    queryKey: ["magazine-writer", "draft", pieceId, demoMode],
    queryFn: async () => {
      if (demoMode || pieceId === null) {
        return null;
      }
      return getMyDraft(pieceId);
    },
    enabled: pieceId !== null,
  });

  return {
    draft: draftQuery.data ?? null,
    isLoading: draftQuery.isLoading,
    isError: draftQuery.isError,
    refetch: draftQuery.refetch,
  };
}
