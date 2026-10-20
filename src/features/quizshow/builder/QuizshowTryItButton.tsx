import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowDraft } from "./quizshowDraft";
import type { QuizshowLocalProblem } from "./quizshowValidation";
import { QuizshowDryRun } from "./QuizshowDryRun";
import { QuizshowProblemList } from "./QuizshowProblemList";

/** Plays the draft with pretend players; blocked while the draft has problems (the questions need answers to play). */
export function QuizshowTryItButton({
  draft,
  pickedPreviewUrls,
  problems,
}: {
  draft: QuizshowDraft;
  pickedPreviewUrls: ReadonlyMap<string, string>;
  problems: readonly QuizshowLocalProblem[];
}) {
  const { t } = useTranslation();
  const problemsId = useId();
  const [isDryRunOpen, setIsDryRunOpen] = useState(false);
  const isBlocked = problems.length > 0;
  return (
    <>
      <Button
        variant="ghost"
        type="button"
        aria-disabled={isBlocked}
        aria-describedby={isBlocked ? problemsId : undefined}
        onClick={() => {
          if (!isBlocked) setIsDryRunOpen(true);
        }}
      >
        {t("quizshow:dryRun.open")}
      </Button>
      {/* Read out as the button's description; the problems panel shows the same list on screen. */}
      <div id={problemsId} hidden>
        <QuizshowProblemList problems={problems} />
      </div>
      <AnimatePresence>
        {isDryRunOpen && (
          <QuizshowDryRun
            key="quizshow-dry-run"
            draft={draft}
            pickedPreviewUrls={pickedPreviewUrls}
            onClose={() => setIsDryRunOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
