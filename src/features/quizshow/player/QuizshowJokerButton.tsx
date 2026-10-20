import { useEffect, useRef, useState } from "react";
import { FiStar } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { isPlayerState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import styles from "./QuizshowPlay.module.css";
import { QuizshowErrorLine } from "./QuizshowJoinForm";
import { sendFailureKeyOf } from "./usePlayJoin";

interface QuizshowJokerButtonProps {
  controller: QuizshowSessionController;
  roundIndex: number;
}

/** The played line takes focus when it appears, so the button that left does not strand it. */
function PlayedLine({
  roundNumber,
  shouldFocus,
}: {
  roundNumber: number;
  shouldFocus: boolean;
}) {
  const { t } = useTranslation();
  const lineRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (shouldFocus) lineRef.current?.focus();
  }, [shouldFocus]);
  return (
    <p ref={lineRef} className={styles.statusLine} role="status" tabIndex={-1}>
      <FiStar aria-hidden="true" fill="none" />
      {t("quizshow:player.jokerPlayed", { number: roundNumber })}
    </p>
  );
}

/** Plays the joker on a round once; afterwards it names the round it was played on. */
export function QuizshowJokerButton({
  controller,
  roundIndex,
}: QuizshowJokerButtonProps) {
  const { t } = useTranslation();
  const [isSending, setIsSending] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [hasPlayedHere, setHasPlayedHere] = useState(false);
  const { session } = controller.state;
  if (!isPlayerState(session) || session.me === null) return null;
  const { me } = session;
  const playedRoundIndex = me.jokerRoundIndex ?? roundIndex;
  const hintKey =
    session.playMode === "teams"
      ? "quizshow:player.jokerTeamHint"
      : "quizshow:player.jokerHint";

  async function playJoker() {
    if (isSending) return;
    setIsSending(true);
    setErrorKey(null);
    const result = await controller.send("joker:play", { roundIndex });
    setIsSending(false);
    if (result.ok) setHasPlayedHere(true);
    else setErrorKey(sendFailureKeyOf(result.code));
  }

  return (
    <div className={styles.group}>
      <Collapse isOpen={!me.hasUsedJoker}>
        <div className={styles.group}>
          <Button
            variant="soft"
            size="lg"
            aria-disabled={isSending}
            onClick={() => void playJoker()}
          >
            <FiStar aria-hidden="true" fill="none" />
            {t("quizshow:player.jokerPlay")}
          </Button>
          <p className={styles.hint}>{t(hintKey)}</p>
        </div>
      </Collapse>
      <Collapse isOpen={me.hasUsedJoker}>
        <PlayedLine
          roundNumber={playedRoundIndex + 1}
          shouldFocus={hasPlayedHere}
        />
      </Collapse>
      <QuizshowErrorLine errorKey={errorKey} />
    </div>
  );
}
