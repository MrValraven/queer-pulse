import { useId, useState } from "react";
import { Button, Collapse } from "../../../shared/components/ui";
import { QuizshowOpenLobbyDialog } from "./QuizshowOpenLobbyDialog";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowLobby.module.css";

interface QuizshowOpenLobbyButtonProps {
  slug: string;
  isBlocked: boolean;
  blockedReason: string | null;
}

export function QuizshowOpenLobbyButton({
  slug,
  isBlocked,
  blockedReason,
}: QuizshowOpenLobbyButtonProps) {
  const { t } = useTranslation();
  const reasonId = useId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const hasReason = isBlocked && blockedReason !== null;

  return (
    <div className={styles.buttonWrap}>
      <Button
        aria-disabled={isBlocked}
        aria-describedby={hasReason ? reasonId : undefined}
        onClick={() => {
          if (!isBlocked) setIsDialogOpen(true);
        }}
      >
        {t("quizshow:lobby.open")}
      </Button>
      <Collapse isOpen={hasReason}>
        <p id={reasonId} className={styles.blockedReason}>
          {blockedReason}
        </p>
      </Collapse>
      <QuizshowOpenLobbyDialog
        slug={slug}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
