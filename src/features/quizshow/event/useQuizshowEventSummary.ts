import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { QuizshowEventDetail } from "../../../shared/contracts/quizshow";
import type { GatheringDetail } from "../../gatherings/data";
import { useIsQuizshowVisible } from "../quizshowLaunch";
import { DEMO_QUIZSHOW_EVENT_DETAILS } from "./quizshowEventDemo.data";

/** What this event says about Pulse Live, or null while the feature is hidden
 *  or the event has nothing to show. Demo reads the colocated mock; live reads
 *  the event detail's `quizshow` field. */
export function useQuizshowEventSummary(
  gathering: GatheringDetail,
): QuizshowEventDetail | null {
  const { demoMode } = useDemoMode();
  const isVisible = useIsQuizshowVisible();
  if (!isVisible) return null;
  if (demoMode) return DEMO_QUIZSHOW_EVENT_DETAILS[gathering.slug] ?? null;
  return gathering.quizshow ?? null;
}
