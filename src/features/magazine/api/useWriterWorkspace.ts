import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getMyAssignments, getMyPayments, getMyPitches } from "./writerWorkspace.api";
import { DEMO_WRITER, type WriterIdentity } from "../data/writerWorkspace.data";

/**
 * The signed-in writer's own workspace — assignments, pitches, and payments,
 * scoped server-side to `writerId`/`submitterId` (see
 * `magazine-writer.controller.ts`). Demo mode always returns the static
 * `DEMO_WRITER` fixture; live mode fires the three `GET /magazine/writer/*`
 * endpoints as independent queries (rather than `useQueries`, to match this
 * feature's existing single-`useQuery`-per-resource style — see
 * `usePieceRecord`/`usePieces`) so a slow payments fetch never blocks
 * assignments from rendering.
 *
 * `me` (the header identity) has no backing endpoint — there is no
 * `/magazine/writer/me` — so live mode derives it from the already-loaded
 * `useAuth()` session instead of a fourth network round-trip.
 */
export function useWriterWorkspace() {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();

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

  const me: WriterIdentity = demoMode
    ? DEMO_WRITER.me
    : {
        name:
          [user?.profile.firstName, user?.profile.lastName]
            .filter(Boolean)
            .join(" ") || user?.email || "",
        role: "Contributor",
        tint: "jade",
      };

  return {
    me,
    assignments: assignmentsQuery.data ?? [],
    pitches: pitchesQuery.data ?? [],
    payments: paymentsQuery.data ?? [],
    isLoading:
      assignmentsQuery.isLoading ||
      pitchesQuery.isLoading ||
      paymentsQuery.isLoading,
    isError:
      assignmentsQuery.isError ||
      pitchesQuery.isError ||
      paymentsQuery.isError,
  };
}
