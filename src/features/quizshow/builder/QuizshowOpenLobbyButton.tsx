import { useId, useMemo, useState } from "react";
import type { QuizshowRoundKind } from "../../../shared/contracts/quizshow";
import { Button, Collapse } from "../../../shared/components/ui";
import type { QuizshowSessionScope } from "../quizshowScope";
import { QuizshowBlockedTip } from "./QuizshowBlockedTip";
import { useQuizshowBlockedTip } from "./useQuizshowBlockedTip";
import {
  QuizshowAfterOpenProvider,
  type QuizshowAfterOpen,
} from "./useQuizshowOpenLobby";
import {
  QuizshowOpenLobbyDialog,
  type QuizshowRematchOf,
} from "./QuizshowOpenLobbyDialog";
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
  /** A draft event (item 53): the button reads "Open a practice lobby" and the dialog holds practice on. */
  isPracticeOnly?: boolean;
  /**
   * A crowded bar (the studio below 1280px): a draft event's button keeps
   * "Open lobby" while the dialog still holds practice on, and the bar names
   * practice elsewhere.
   */
  isLabelShort?: boolean;
  /** Rematch (item 38): opens the dialog prefilled from the finished session; the main button reads "Play again with these players". */
  rematchOf?: QuizshowRematchOf | null;
  /**
   * Where a successful open goes. Left out, the host goes to the big screen as
   * always. Given (the phone remote's rematch), the dialog closes and the host
   * stays on that page when it is the current one.
   */
  afterOpenPath?: QuizshowAfterOpen["afterOpenPath"];
}

function buttonLabelKeyOf(
  isPracticeOnly: boolean,
  isLabelShort: boolean,
  rematchOf: QuizshowRematchOf | null,
): string {
  if (rematchOf) return "quizshow:lobby.rematch.submit";
  if (isPracticeOnly && !isLabelShort) {
    return "quizshow:builder.draftEvent.openPractice";
  }
  return "quizshow:lobby.open";
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
  isPracticeOnly = false,
  isLabelShort = false,
  rematchOf = null,
  afterOpenPath,
}: QuizshowOpenLobbyButtonProps) {
  const { t } = useTranslation();
  const reasonId = useId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const tip = useQuizshowBlockedTip();
  const afterOpen = useMemo<QuizshowAfterOpen | null>(
    () =>
      afterOpenPath === undefined
        ? null
        : {
            afterOpenPath,
            onOpened: () => setIsDialogOpen(false),
            shouldReplaceHistory: true,
          },
    [afterOpenPath],
  );
  const isStudio = appearance === "studio";
  const hasReason = isBlocked && blockedReason !== null;
  const dialog = (
    <QuizshowOpenLobbyDialog
      scope={scope}
      rounds={rounds}
      isOpen={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      isPracticeOnly={isPracticeOnly}
      rematchOf={rematchOf}
    />
  );
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
        {t(buttonLabelKeyOf(isPracticeOnly, isLabelShort, rematchOf))}
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
      {afterOpen === null ? (
        dialog
      ) : (
        <QuizshowAfterOpenProvider value={afterOpen}>
          {dialog}
        </QuizshowAfterOpenProvider>
      )}
    </div>
  );
}
