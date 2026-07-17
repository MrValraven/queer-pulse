import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
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
 *
 * i18n: `language` joins the query key because `submissionToPitch`
 * locale-formats the "Submitted …" date via `fmt`. `statusLabelKey`/stage
 * `labelKey`s are stable catalog keys (label-key indirection) resolved via
 * `t()` in `PitchCard`/`PitchStages` — not runtime-resolved strings — so they
 * don't need `language` in the key themselves. Per-pitch `actions[].label`
 * (e.g. "Message Marta", "14 comments") remain plain English: mixed
 * content/chrome and name/count-fused, left unswept — see the `magazine:`
 * catalog's note by the `PitchCard` section.
 */
export function useMySubmissions() {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const { language } = useTranslation();
  return useQuery<Pitch[]>({
    queryKey: [MY_SUBMISSIONS_QUERY_KEY, demoMode, language],
    queryFn: async () => {
      if (demoMode) return PITCHES;
      const rows = await getMySubmissions();
      return rows.map((dto) => submissionToPitch(dto, fmt));
    },
  });
}
