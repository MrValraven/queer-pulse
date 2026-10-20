import type { QuizshowEventDetail } from "../../../shared/contracts/quizshow";
import { QUIZSHOW_DEMO_JOIN_CODE } from "../quizshow.constants";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS_SLUG,
} from "../api/quizshowDemoStore.data";

/** What demo events say about Pulse Live: one with a game open in the lobby,
 *  one past event with kept results. Live reads `gathering.quizshow`. */
export const DEMO_QUIZSHOW_EVENT_DETAILS: Readonly<
  Record<string, QuizshowEventDetail>
> = {
  [QUIZSHOW_DEMO_LIVE_SLUG]: {
    hasQuiz: true,
    liveSessionCode: QUIZSHOW_DEMO_JOIN_CODE,
    hasResults: false,
  },
  [QUIZSHOW_DEMO_RESULTS_SLUG]: {
    hasQuiz: true,
    liveSessionCode: null,
    hasResults: true,
  },
};
