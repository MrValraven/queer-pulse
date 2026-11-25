import { useSyncExternalStore } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { QuizshowEventDetail } from "../../../shared/contracts/quizshow";
import type { GatheringDetail } from "../../gatherings/data";
import { useIsQuizshowVisible } from "../quizshowLaunch";
import {
  demoGetWinBadgesPreview,
  getQuizWinBadgesDemoVersion,
  subscribeQuizWinBadgesDemo,
} from "../winBadges/quizWinBadgesDemoStore";
import { DEMO_QUIZSHOW_EVENT_DETAILS } from "./quizshowEventDemo.data";

/** What this event says about Pulse Live, or null while the feature is hidden
 *  or the event has nothing to show. Demo reads the colocated mock and fills
 *  `winBadges` from the demo badge store, so an admin edit shows at once. Live
 *  reads the event detail's `quizshow` field. */
export function useQuizshowEventSummary(
  gathering: GatheringDetail,
): QuizshowEventDetail | null {
  const { demoMode } = useDemoMode();
  const isVisible = useIsQuizshowVisible();
  // Subscribes this component to the demo badge store in both modes, on every
  // render, so the hook order never changes and an admin edit re-renders it.
  useSyncExternalStore(subscribeQuizWinBadgesDemo, getQuizWinBadgesDemoVersion);
  if (!isVisible) return null;
  if (demoMode) {
    const mockSummary = DEMO_QUIZSHOW_EVENT_DETAILS[gathering.slug];
    if (!mockSummary) return null;
    return {
      ...mockSummary,
      winBadges: demoGetWinBadgesPreview(gathering.slug).preview,
    };
  }
  return gathering.quizshow ?? null;
}
