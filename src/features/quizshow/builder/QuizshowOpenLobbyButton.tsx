import { useId, useState } from "react";
import { Button, Collapse } from "../../../shared/components/ui";
import type { QuizshowSessionScope } from "../quizshowScope";
import { QuizshowOpenLobbyDialog } from "./QuizshowOpenLobbyDialog";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowLobby.module.css";

interface QuizshowOpenLobbyButtonProps {
  scope: QuizshowSessionScope;
  isBlocked: boolean;
  blockedReason: string | null;
  /** Describes a block that shows no reason here, such as the save bar's "Unsaved changes". */
  blockedDescriptionId?: string;
}

export function QuizshowOpenLobbyButton({
  scope,
  isBlocked,
  blockedReason,
  blockedDescriptionId,
}: QuizshowOpenLobbyButtonProps) {
  const { t } = useTranslation();
  const reasonId = useId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const hasReason = isBlocked && blockedReason !== null;
  let describedById: string | undefined;
  if (hasReason) describedById = reasonId;
  else if (isBlocked) describedById = blockedDescriptionId;

  return (
    <div className={styles.buttonWrap}>
      <Button
        aria-disabled={isBlocked}
        aria-describedby={describedById}
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
        scope={scope}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
