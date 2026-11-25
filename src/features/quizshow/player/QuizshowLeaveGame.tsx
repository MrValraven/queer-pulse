import { AnimatePresence } from "motion/react";
import { useContext, useRef, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowPlayPath } from "../quizshowPaths";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowStudioDarkStamp } from "../studio/QuizshowStudioDarkStamp";
import { QuizshowErrorLine } from "./QuizshowJoinForm";
import { QuizshowTryOutContext } from "./quizshowTryOutContext";
import { sendFailureKeyOf } from "./usePlayJoin";
import lobbyStyles from "./QuizshowPlayerLobby.module.css";

interface QuizshowLeaveGameProps {
  controller: QuizshowSessionController;
}

/** "Leave the game" (C6.14, item 35): confirms, sends `lobby:leave`, then goes back to the code entry. The studio's try-out phone has no way out of its game, so it shows nothing there. */
export function QuizshowLeaveGame({ controller }: QuizshowLeaveGameProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  // Two taps in the same frame both see the old state, so the ref holds the send.
  const isLeavingRef = useRef(false);
  const isTryOut = useContext(QuizshowTryOutContext);

  async function leave() {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    setIsLeaving(true);
    const result = await controller.send("lobby:leave", {});
    isLeavingRef.current = false;
    setIsLeaving(false);
    setIsConfirmOpen(false);
    if (result.ok) {
      void navigate(quizshowPlayPath());
    } else {
      setErrorKey(sendFailureKeyOf(result.code));
    }
  }

  if (isTryOut) return null;
  return (
    <div className={lobbyStyles.leave}>
      <Button
        variant="stage-ghost"
        size="sm"
        onClick={() => {
          setErrorKey(null);
          setIsConfirmOpen(true);
        }}
      >
        <FiLogOut aria-hidden />
        {t("quizshow:player.leave.button")}
      </Button>
      <QuizshowErrorLine errorKey={errorKey} />
      <AnimatePresence>
        {isConfirmOpen && (
          <ConfirmDialog
            key="quizshow-player-leave"
            open
            tone="destructive"
            title={t("quizshow:player.leave.confirmTitle")}
            description={t("quizshow:player.leave.confirmBody")}
            confirmLabel={t("quizshow:player.leave.confirm")}
            cancelLabel={t("quizshow:player.leave.cancel")}
            loading={isLeaving}
            initialFocus="cancel"
            onClose={() => {
              if (!isLeavingRef.current) setIsConfirmOpen(false);
            }}
            onConfirm={() => {
              void leave();
            }}
          >
            <QuizshowStudioDarkStamp />
          </ConfirmDialog>
        )}
      </AnimatePresence>
    </div>
  );
}
