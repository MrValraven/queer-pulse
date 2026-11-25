import { useId, useState } from "react";
import { FiCheck, FiSend } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { Toggle } from "../../../shared/components/ui/Controls";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowHostState } from "../../../shared/contracts/quizshow";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowRemoteErrorLine } from "./QuizshowRemoteControls";
import { QuizshowRemoteMakeTeams } from "./QuizshowRemoteMakeTeamsDialog";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import styles from "./QuizshowRemote.module.css";
import rosterStyles from "./QuizshowRemoteRoster.module.css";

interface SwitchRowProps {
  label: string;
  hint: string;
  isChecked: boolean;
  isPending: boolean;
  onChange: (isChecked: boolean) => void;
}

/** A labelled switch. While its command is in flight it shows the asked value and ignores taps. */
function SwitchRow({
  label,
  hint,
  isChecked,
  isPending,
  onChange,
}: SwitchRowProps) {
  const switchId = useId();
  const hintId = useId();
  return (
    <div className={rosterStyles.switchRow} aria-busy={isPending}>
      <div className={rosterStyles.switchText}>
        <label htmlFor={switchId} className={rosterStyles.switchLabel}>
          {label}
        </label>
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      </div>
      <Toggle
        id={switchId}
        aria-describedby={hintId}
        checked={isChecked}
        onChange={(next) => {
          if (!isPending) onChange(next);
        }}
      />
    </div>
  );
}

/** The value a switch shows: the asked one while its command is in flight, the server's otherwise. */
function useAskedFlag(serverValue: boolean, isPending: boolean) {
  const [askedValue, setAskedValue] = useState(serverValue);
  return {
    shownValue: isPending ? askedValue : serverValue,
    ask: setAskedValue,
  };
}

/**
 * D15: the game settings at the top of the players drawer. Close joining and
 * Move on by itself in any open status; in the lobby, Send the join code to
 * guests (an event session outside practice) and Make teams for tables
 * (teams play).
 */
export function QuizshowRemoteGameSettings({
  controller,
  session,
}: {
  controller: QuizshowSessionController;
  session: QuizshowHostState;
}) {
  const { t } = useTranslation();
  const { run, isPending, lastErrorKey } = useQuizshowHostCommand(controller);
  const isJoinLockPending = isPending("host:setJoinLock");
  const isAutoAdvancePending = isPending("host:setAutoAdvance");
  const isNotifyPending = isPending("host:notifyGuests");
  const joinLock = useAskedFlag(session.isJoinLocked, isJoinLockPending);
  const autoAdvance = useAskedFlag(
    session.isAutoAdvanceOn,
    isAutoAdvancePending,
  );
  const isLobby = session.cursor.status === "lobby";
  const isGuestPushShown =
    isLobby && session.kind === "event" && !session.isPractice;
  const isGuestPushSent = session.guestPushSentAt !== null;
  const isMakeTeamsShown = isLobby && session.playMode === "teams";

  return (
    <section
      className={styles.section}
      aria-labelledby="quizshow-remote-settings"
    >
      <h2 id="quizshow-remote-settings" className={styles.sectionTitle}>
        {t("quizshow:remote.settings.title")}
      </h2>
      <SwitchRow
        label={t("quizshow:remote.settings.joinLock")}
        hint={t("quizshow:remote.settings.joinLockHint")}
        isChecked={joinLock.shownValue}
        isPending={isJoinLockPending}
        onChange={(isLocked) => {
          joinLock.ask(isLocked);
          void run("host:setJoinLock", { isLocked });
        }}
      />
      <SwitchRow
        label={t("quizshow:remote.settings.autoAdvance")}
        hint={t("quizshow:remote.settings.autoAdvanceHint")}
        isChecked={autoAdvance.shownValue}
        isPending={isAutoAdvancePending}
        onChange={(isOn) => {
          autoAdvance.ask(isOn);
          void run("host:setAutoAdvance", { isOn });
        }}
      />
      <Collapse isOpen={isGuestPushShown && !isGuestPushSent}>
        <div className={rosterStyles.settingAction}>
          <Button
            variant="stage-ghost"
            size="md"
            aria-disabled={isNotifyPending}
            onClick={() => {
              if (!isNotifyPending) void run("host:notifyGuests", {});
            }}
          >
            <FiSend aria-hidden="true" fill="none" />
            {t("quizshow:remote.notifyGuests")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={isGuestPushShown && isGuestPushSent}>
        <p className={rosterStyles.sentLine}>
          <FiCheck aria-hidden="true" fill="none" />
          {t("quizshow:remote.guestsNotified")}
        </p>
      </Collapse>
      <QuizshowRemoteMakeTeams
        isShown={isMakeTeamsShown}
        controller={controller}
        teams={session.lobby.teams}
      />
      <QuizshowRemoteErrorLine errorKey={lastErrorKey} />
    </section>
  );
}
