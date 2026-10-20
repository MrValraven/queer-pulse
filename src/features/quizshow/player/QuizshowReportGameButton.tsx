import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiFlag } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ReportListingModal } from "../../economy/ReportListingModal";

/** Files a report on the live game; the subject id is the session id. */
export function QuizshowReportGameButton({
  sessionId,
  quizTitle,
}: {
  sessionId: string;
  quizTitle: string;
}) {
  const { t } = useTranslation();
  const [isReportOpen, setIsReportOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsReportOpen(true)}
        aria-haspopup="dialog"
      >
        <FiFlag aria-hidden="true" fill="none" />
        {t("quizshow:player.reportGame")}
      </Button>
      <AnimatePresence>
        {isReportOpen && (
          <ReportListingModal
            subjectType="quizshow_game"
            subjectId={sessionId}
            subjectName={quizTitle}
            onClose={() => setIsReportOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
