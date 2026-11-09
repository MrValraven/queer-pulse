import { useId, useState } from "react";
import type { QuizshowRoundKind } from "../../../shared/contracts/quizshow";
import { Button, Collapse } from "../../../shared/components/ui";
import type { QuizshowSessionScope } from "../quizshowScope";
import { QuizshowBlockedTip } from "./QuizshowBlockedTip";
import { useQuizshowBlockedTip } from "./useQuizshowBlockedTip";
import { QuizshowOpenLobbyDialog } from "./QuizshowOpenLobbyDialog";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowLobby.module.css";

interface QuizshowOpenLobbyButtonProps {
  scope: QuizshowSessionScope;
  /** The draft's rows, so the dialog's problem sentences number rounds and wheels. */
  rounds: ReadonlyArray<{ kind: QuizshowRoundKind }>;
  isBlocked: boolean;
  blockedReason: string | null;
  /** Describes a block that shows no reason here, such as a status line elsewhere on the page. */
  blockedDescriptionId?: string;
  /**
   * `studio` is the coral stage button for the dark studio's top bar, with its
   * blocked reason in a tooltip. `secondary` is the default button as a ghost,
   * for a card whose primary action is another one (the Manage tab's summary).
   */
  appearance?: "default" | "secondary" | "studio";
}

const VARIANT_BY_APPEARANCE = {
  default: "primary",
  secondary: "ghost",
  studio: "stage",
} as const;

export function QuizshowOpenLobbyButton({
  scope,
  rounds,
  isBlocked,
  blockedReason,
  blockedDescriptionId,
  appearance = "default",
}: QuizshowOpenLobbyButtonProps) {
  const { t } = useTranslation();
  const reasonId = useId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const tip = useQuizshowBlockedTip();
  const isStudio = appearance === "studio";
  const hasReason = isBlocked && blockedReason !== null;
  let describedById: string | undefined;
  if (hasReason) describedById = reasonId;
  else if (isBlocked) describedById = blockedDescriptionId;

  return (
    <div className={isStudio ? styles.studioWrap : styles.buttonWrap}>
      <Button
        variant={VARIANT_BY_APPEARANCE[appearance]}
        aria-disabled={isBlocked}
        aria-describedby={describedById}
        onClick={() => {
          if (!isBlocked) setIsDialogOpen(true);
          else if (isStudio) tip.pin();
        }}
      >
        {t("quizshow:lobby.open")}
      </Button>
      {isStudio ? (
        hasReason && (
          <QuizshowBlockedTip
            id={reasonId}
            isPinned={tip.isPinned}
            isDismissed={tip.isDismissed}
            onDismiss={tip.dismiss}
            onReset={tip.reset}
          >
            {blockedReason}
          </QuizshowBlockedTip>
        )
      ) : (
        <Collapse isOpen={hasReason}>
          <p id={reasonId} className={styles.blockedReason}>
            {blockedReason}
          </p>
        </Collapse>
      )}
      <QuizshowOpenLobbyDialog
        scope={scope}
        rounds={rounds}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
