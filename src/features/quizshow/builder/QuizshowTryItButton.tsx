import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowDraft } from "./quizshowDraft";
import type { QuizshowDryRunSlice } from "./quizshowDryRunQuiz";
import type { QuizshowLocalProblem } from "./quizshowValidation";
import { QuizshowBlockedTip } from "./QuizshowBlockedTip";
import { useQuizshowBlockedTip } from "./useQuizshowBlockedTip";
import { QuizshowDryRun } from "./QuizshowDryRun";
import { QuizshowProblemList } from "./QuizshowProblemList";
import styles from "./QuizshowLobby.module.css";

/** A tooltip stays short: the first few problems, then a count of the rest. */
const TIP_PROBLEM_LIMIT = 3;

/** The button's words: the whole draft, one round, or one round from a question on (item 21). */
function labelKeyOf(slice: QuizshowDryRunSlice | undefined): string {
  if (slice === undefined) return "quizshow:dryRun.open";
  return slice.fromQuestionIndex === undefined
    ? "quizshow:dryRun.tryRound"
    : "quizshow:dryRun.tryFromQuestion";
}

/**
 * Plays the draft, or one slice of it, with pretend players; blocked while
 * what it plays has problems (the questions need answers to play).
 */
export function QuizshowTryItButton({
  draft,
  pickedPreviewUrls,
  problems,
  slice,
  appearance = "default",
}: {
  draft: QuizshowDraft;
  pickedPreviewUrls: ReadonlyMap<string, string>;
  /** What blocks it: the draft's problems, or for a slice `sliceProblemsOf(dryRunProblems, draft, slice)` over the studio's own `dryRunProblems`. */
  problems: readonly QuizshowLocalProblem[];
  /** Try this round or Try from this question; left out, the whole draft. */
  slice?: QuizshowDryRunSlice;
  /** `studio` is the glass stage button for the dark studio's top bar, with the blocking problems in a tooltip. */
  appearance?: "default" | "studio";
}) {
  const { t } = useTranslation();
  const problemsId = useId();
  const [isDryRunOpen, setIsDryRunOpen] = useState(false);
  const isBlocked = problems.length > 0;
  const isStudio = appearance === "studio";
  const tip = useQuizshowBlockedTip();
  const shownProblems = problems.slice(0, TIP_PROBLEM_LIMIT);
  const hiddenCount = problems.length - shownProblems.length;
  return (
    <div className={isStudio ? styles.studioWrap : styles.inlineWrap}>
      <Button
        variant={isStudio ? "stage-ghost" : "ghost"}
        type="button"
        aria-disabled={isBlocked}
        aria-describedby={isBlocked ? problemsId : undefined}
        onClick={() => {
          if (!isBlocked) setIsDryRunOpen(true);
          else if (isStudio) tip.pin();
        }}
      >
        {t(labelKeyOf(slice))}
      </Button>
      {isStudio ? (
        isBlocked && (
          <QuizshowBlockedTip
            id={problemsId}
            isPinned={tip.isPinned}
            isDismissed={tip.isDismissed}
            onDismiss={tip.dismiss}
            onReset={tip.reset}
          >
            <p className={styles.tipTitle}>
              {t("quizshow:dryRun.blockedTitle")}
            </p>
            <QuizshowProblemList
              problems={shownProblems}
              rounds={draft.rounds}
            />
            {hiddenCount > 0 && (
              <p className={styles.tipMore}>
                {t("quizshow:dryRun.blockedMore", { count: hiddenCount })}
              </p>
            )}
          </QuizshowBlockedTip>
        )
      ) : (
        /* Read out as the button's description; the problems panel shows the same list on screen. */
        <div id={problemsId} hidden>
          <QuizshowProblemList problems={problems} rounds={draft.rounds} />
        </div>
      )}
      <AnimatePresence>
        {isDryRunOpen && (
          <QuizshowDryRun
            key="quizshow-dry-run"
            draft={draft}
            pickedPreviewUrls={pickedPreviewUrls}
            slice={slice}
            onClose={() => setIsDryRunOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
