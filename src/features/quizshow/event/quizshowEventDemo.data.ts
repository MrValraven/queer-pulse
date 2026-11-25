import type {
  QuizshowEventDetail,
  QuizshowGivingLink,
} from "../../../shared/contracts/quizshow";
import { QUIZSHOW_DEMO_JOIN_CODE } from "../quizshow.constants";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS_SLUG,
  QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG,
} from "../api/quizshowDemoStore.data";

/** What demo events say about Pulse Live: one with a game open in the lobby,
 *  one past event with kept results, and one whose quiz copies a template
 *  (`QUIZSHOW_DEMO_EVENT_QUIZ_SEEDS`). Live reads `gathering.quizshow`. The
 *  entries keep `winBadges: null`: the demo summary hook
 *  (`useQuizshowEventSummary`) fills it from the demo badge store, so an admin
 *  edit in demo reaches the event page. */
export const DEMO_QUIZSHOW_EVENT_DETAILS: Readonly<
  Record<string, QuizshowEventDetail>
> = {
  [QUIZSHOW_DEMO_LIVE_SLUG]: {
    hasQuiz: true,
    liveSessionCode: QUIZSHOW_DEMO_JOIN_CODE,
    hasResults: false,
    winBadges: null,
  },
  [QUIZSHOW_DEMO_RESULTS_SLUG]: {
    hasQuiz: true,
    liveSessionCode: null,
    hasResults: true,
    winBadges: null,
  },
  [QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG]: {
    hasQuiz: true,
    liveSessionCode: null,
    hasResults: false,
    winBadges: null,
  },
};

/**
 * C10 row 66: the giving line a demo event's finished game shows (C6.27). The
 * demo event `pride-brunch-jun` is led by Queer Runners Lisboa, a public
 * community whose demo support section has methods
 * (`features/gatherings/data.ts` and `communities/giving/communityGiving.data.ts`).
 * The frame carries the community slug and name only. Practice
 * sessions leave it null.
 */
export const DEMO_QUIZSHOW_EVENT_GIVING: Readonly<
  Record<string, QuizshowGivingLink>
> = {
  [QUIZSHOW_DEMO_LIVE_SLUG]: {
    communitySlug: "queer-runners",
    communityName: "Queer Runners Lisboa",
  },
};
