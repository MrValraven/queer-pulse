import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat, type Formatters } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../shared/i18n/types";
import type { Pitch } from "../pitchTracker.data";
import { submissionToPitch } from "./magazine.adapters";
import { getMySubmissions, type StorySubmissionDTO } from "./magazine.api";

export const MY_SUBMISSIONS_QUERY_KEY = "magazine-my-submissions";

/** Status pill copy per decision. `accepted` and `commissioned` both arrive as
 *  `status: "accepted"`, so the decision is what tells them apart. */
const DECISION_LABEL_KEY = {
  accepted: "magazine:pitchTracker.statusLabel.accepted",
  declined: "magazine:pitchTracker.statusLabel.rejected",
  commissioned: "magazine:pitchTracker.statusLabel.commissioned",
} as const;

/**
 * Fold the editorial OUTCOME onto the card `submissionToPitch` built.
 *
 * The base adapter maps `status` alone, which cannot distinguish "we're taking
 * it" from "we've commissioned it into the next issue" and knows nothing about
 * the reply the decider wrote. Both live on the decision fields, so they are
 * applied here rather than in the shared adapter.
 *
 * `note` is the decider's reply, rendered by `PitchCard` under the stages. It
 * is the only prose a submitter gets about the decision: QueerPulse delivers
 * no email, so this card and the in-app bell are how they hear.
 */
function withDecision(
  pitch: Pitch,
  dto: StorySubmissionDTO,
  t: TFunction,
): Pitch {
  if (!dto.decision) return pitch;
  return {
    ...pitch,
    status: dto.decision === "commissioned" ? "commissioned" : pitch.status,
    statusLabelKey: DECISION_LABEL_KEY[dto.decision],
    ...(dto.decisionNote
      ? {
          note: {
            author: t("magazine:pitchTracker.card.deskAuthor"),
            body: dto.decisionNote,
          },
        }
      : {}),
  };
}

function toTrackerPitch(
  dto: StorySubmissionDTO,
  fmt: Formatters,
  t: TFunction,
): Pitch {
  return withDecision(submissionToPitch(dto, fmt), dto, t);
}

/**
 * `PitchTrackerPage.tsx` ("my submissions"). Demo mode keeps the page's own
 * `PITCHES` registry, editorial workflow and all. Live mode calls GET
 * /magazine/submissions/mine and maps each row through `submissionToPitch`,
 * then folds the editorial decision on top (see `withDecision`): a submission
 * now reaches accepted / declined / commissioned with the desk's reply
 * attached, instead of reading "submitted" forever.
 *
 * i18n: `language` joins the query key because `submissionToPitch`
 * locale-formats the "Submitted …" date via `fmt`, and because the decision
 * note's byline is resolved through `t()` here. `statusLabelKey`/stage
 * `labelKey`s are stable catalog keys (label-key indirection) resolved via
 * `t()` in `PitchCard`/`PitchStages`, so they don't need `language`
 * themselves. Per-pitch `actions[].label` (e.g. "Message Marta", "14
 * comments") remain plain English: mixed content/chrome and name/count-fused,
 * left unswept — see the `magazine:` catalog's note by the `PitchCard`
 * section.
 */
export function useMySubmissions() {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const { language, t } = useTranslation();
  return useQuery<Pitch[]>({
    queryKey: [MY_SUBMISSIONS_QUERY_KEY, demoMode, language],
    queryFn: async () => {
      if (demoMode) {
        // Demo-only mock registry — dynamically imported so it never ships in
        // the live bundle (live mode fetches from the API below).
        const { PITCHES } = await import("../pitchTracker.data");
        return PITCHES;
      }
      const rows = await getMySubmissions();
      return rows.map((dto) => toTrackerPitch(dto, fmt, t));
    },
  });
}
