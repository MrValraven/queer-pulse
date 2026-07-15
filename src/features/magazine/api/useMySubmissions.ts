import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { PITCHES, type Pitch } from "../pitchTracker.data";
import { submissionToPitch } from "./magazine.adapters";
import { getMySubmissions } from "./magazine.api";

export const MY_SUBMISSIONS_QUERY_KEY = "magazine-my-submissions";

/**
 * `PitchTrackerPage.tsx` ("my submissions"). Demo mode keeps the page's own
 * `PITCHES` registry, editorial workflow and all. Live mode calls GET
 * /magazine/submissions/mine — the backend is read + one write only (no
 * moderation workflow), so the mapped `Pitch` cards carry a plain
 * pitched → in review → accepted → published progression and drop the
 * mock's editor notes/outline/messaging actions, which have no backend
 * analogue (see `submissionToPitch`).
 */
export function useMySubmissions() {
  const { demoMode } = useDemoMode();
  return useQuery<Pitch[]>({
    queryKey: [MY_SUBMISSIONS_QUERY_KEY, demoMode],
    queryFn: async () => {
      if (demoMode) return PITCHES;
      const rows = await getMySubmissions();
      return rows.map(submissionToPitch);
    },
  });
}
