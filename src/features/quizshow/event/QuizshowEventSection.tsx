import { AnimatePresence, m } from "motion/react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { FadeIn } from "../../../shared/components/ui/FadeIn";
import type { GatheringDetail } from "../../gatherings/data";
import { eventScope } from "../quizshowScope";
import { QuizshowWinToEarn } from "../winBadges/QuizshowWinToEarn";
import { QuizshowEventBanner } from "./QuizshowEventBanner";
import { QuizshowResultsCard } from "./QuizshowResultsCard";
import { useQuizshowEventSummary } from "./useQuizshowEventSummary";
import styles from "./QuizshowEvent.module.css";

/** The event page's Pulse Live slot: the join banner while a game is open,
 *  the results card once a game has been kept, and under either one the next
 *  game's "Win to earn" badges. */
export function QuizshowEventSection({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const summary = useQuizshowEventSummary(gathering);
  const { demoMode } = useDemoMode();
  const { reducedMotion } = useMotionPrefs();
  const canDelete = demoMode || gathering.viewerIsOrganizer === true;
  const liveSessionCode = summary?.liveSessionCode ?? null;
  const hasResults = summary?.hasResults === true;
  const winBadges = summary?.winBadges ?? null;
  const isShown = liveSessionCode !== null || hasResults || winBadges !== null;
  const fade = { duration: reducedMotion ? 0 : 0.2 };
  const hasSlot = liveSessionCode !== null || hasResults;
  const slotKey = liveSessionCode !== null ? "banner" : "results";
  return (
    <Collapse isOpen={isShown} className={styles.section}>
      <AnimatePresence mode="wait" initial={false}>
        {hasSlot && (
          <m.div
            key={slotKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            {liveSessionCode !== null ? (
              <QuizshowEventBanner code={liveSessionCode} />
            ) : (
              <QuizshowResultsCard
                scope={eventScope(gathering.slug)}
                canDelete={canDelete}
              />
            )}
          </m.div>
        )}
      </AnimatePresence>
      {/* While this folds, the panel keeps the last preview it rendered. */}
      <Collapse isOpen={winBadges !== null}>
        {winBadges !== null && (
          <FadeIn
            key={winBadges.gameNumber}
            className={hasSlot ? styles.winToEarn : undefined}
          >
            <QuizshowWinToEarn preview={winBadges} tone="page" />
          </FadeIn>
        )}
      </Collapse>
    </Collapse>
  );
}
