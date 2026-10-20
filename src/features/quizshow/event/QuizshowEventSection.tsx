import { AnimatePresence, m } from "motion/react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import type { GatheringDetail } from "../../gatherings/data";
import { QuizshowEventBanner } from "./QuizshowEventBanner";
import { QuizshowResultsCard } from "./QuizshowResultsCard";
import { useQuizshowEventSummary } from "./useQuizshowEventSummary";
import styles from "./QuizshowEvent.module.css";

/** The event page's Pulse Live slot: the join banner while a game is open,
 *  else the results card once a game has been kept. */
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
  const isShown = liveSessionCode !== null || hasResults;
  const fade = { duration: reducedMotion ? 0 : 0.2 };
  return (
    <Collapse isOpen={isShown} className={styles.section}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={liveSessionCode !== null ? "banner" : "results"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
        >
          {liveSessionCode !== null ? (
            <QuizshowEventBanner code={liveSessionCode} />
          ) : (
            <QuizshowResultsCard slug={gathering.slug} canDelete={canDelete} />
          )}
        </m.div>
      </AnimatePresence>
    </Collapse>
  );
}
