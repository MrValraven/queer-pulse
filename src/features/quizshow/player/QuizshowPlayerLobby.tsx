import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { FormField } from "../../../shared/components/ui/FormField";
import {
  QUIZSHOW_LIMITS,
  type QuizshowErrorCode,
  type QuizshowMe,
  type QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowShape } from "../QuizshowShape";
import { isPlayerState } from "../realtime/quizshowClientStore";
import { QuizshowPausedNote } from "../stage/QuizshowPausedNote";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowJokerButton } from "./QuizshowJokerButton";
import { QuizshowErrorLine, QuizshowToggleRow } from "./QuizshowJoinForm";
import { sendFailureKeyOf } from "./usePlayJoin";
import styles from "./QuizshowPlay.module.css";

type SettingResult =
  { ok: true } | { ok: false; code: QuizshowErrorCode | "transport_timeout" };

/** A switch that answers at once and settles on what the server then reports. */
function useLiveSetting(
  serverValue: boolean,
  save: (next: boolean) => Promise<SettingResult>,
) {
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  if (pendingValue !== null && pendingValue === serverValue) {
    setPendingValue(null);
  }
  function change(next: boolean) {
    setPendingValue(next);
    setErrorKey(null);
    void save(next).then((result) => {
      if (result.ok) return;
      setPendingValue(null);
      setErrorKey(sendFailureKeyOf(result.code));
    });
  }
  return { value: pendingValue ?? serverValue, errorKey, change };
}

function LobbySettings({
  controller,
  me,
}: {
  controller: QuizshowSessionController;
  me: QuizshowMe;
}) {
  const { t } = useTranslation();
  const extraTime = useLiveSetting(me.hasExtraTime, (hasExtraTime) =>
    controller.send("settings:extraTime", { hasExtraTime }),
  );
  const avatar = useLiveSetting(me.isAvatarShown, (isAvatarShown) =>
    controller.send("settings:avatar", { isAvatarShown }),
  );
  return (
    <div className={styles.group}>
      <QuizshowToggleRow
        label={t("quizshow:player.avatarLabel")}
        isOn={avatar.value}
        onChange={avatar.change}
      />
      <QuizshowErrorLine errorKey={avatar.errorKey} />
      <QuizshowToggleRow
        label={t("quizshow:player.extraTimeLabel")}
        hint={t("quizshow:player.extraTimeHint")}
        isOn={extraTime.value}
        onChange={extraTime.change}
      />
      <QuizshowErrorLine errorKey={extraTime.errorKey} />
    </div>
  );
}

function NameEditor({
  controller,
  me,
}: {
  controller: QuizshowSessionController;
  me: QuizshowMe;
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(me.screenName);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function saveName() {
    if (isSending) return;
    const trimmedName = draftName.trim();
    if (trimmedName === "") {
      setErrorKey("quizshow:errors.text_blank");
      return;
    }
    setIsSending(true);
    const result = await controller.send("lobby:setName", {
      screenName: trimmedName,
    });
    setIsSending(false);
    if (result.ok) {
      setErrorKey(null);
      setIsEditing(false);
    } else {
      setErrorKey(sendFailureKeyOf(result.code));
    }
  }

  return (
    <>
      <div className={styles.nameLine}>
        <span className={styles.screenName}>{me.screenName}</span>
        <Button
          variant="ghost"
          aria-expanded={isEditing}
          onClick={() => {
            setDraftName(me.screenName);
            setErrorKey(null);
            setIsEditing(!isEditing);
          }}
        >
          {t("quizshow:player.changeName")}
        </Button>
      </div>
      <Collapse isOpen={isEditing}>
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            void saveName();
          }}
          noValidate
        >
          <FormField
            label={t("quizshow:player.nameLabel")}
            error={errorKey === null ? undefined : t(errorKey)}
          >
            <input
              type="text"
              value={draftName}
              maxLength={QUIZSHOW_LIMITS.screenNameMax}
              autoComplete="nickname"
              enterKeyHint="done"
              onChange={(event) => setDraftName(event.target.value)}
            />
          </FormField>
          <Button type="submit" aria-disabled={isSending}>
            {t("quizshow:player.saveName")}
          </Button>
        </form>
      </Collapse>
    </>
  );
}

function LobbyBody({
  controller,
  session,
  me,
}: {
  controller: QuizshowSessionController;
  session: QuizshowPlayerState;
  me: QuizshowMe;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const team = session.lobby.teams.find(
    (candidate) => candidate.teamId === me.teamId,
  );
  const firstRound = session.rounds.find((round) => round.roundIndex === 0);
  // The first round's title card shows on the big screen while the phone stays here.
  const isRoundIntro = session.cursor.phase === "round_intro";
  // A pause on that title card shows here too: the paused note shows it and the
  // status region says it, while the lead line keeps its words.
  const isPaused = session.cursor.status === "paused";
  const leadKey = isRoundIntro
    ? "quizshow:player.getReady"
    : "quizshow:player.lobbyBody";
  return (
    <div className={styles.column}>
      <h1 className={styles.title}>{t("quizshow:player.lobbyTitle")}</h1>
      <p className={styles.lead} role="status">
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={leadKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            {t(leadKey)}
          </m.span>
        </AnimatePresence>
        <span className={styles.visuallyHidden}>
          {isPaused ? `. ${t("quizshow:stage.paused")}` : ""}
        </span>
      </p>
      <QuizshowPausedNote isPaused={isPaused} />
      <section className={styles.card}>
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={session.cursor.phase === "lobby" ? "editable" : "fixed"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            {session.cursor.phase === "lobby" ? (
              <NameEditor controller={controller} me={me} />
            ) : (
              <span className={styles.screenName}>{me.screenName}</span>
            )}
          </m.div>
        </AnimatePresence>
        {team !== undefined && (
          <p className={styles.teamLine}>
            <QuizshowShape colorKey={team.colorKey} size="small" label={null} />
            {t("quizshow:player.yourTeam", { team: team.name })}
          </p>
        )}
      </section>
      <LobbySettings controller={controller} me={me} />
      {firstRound?.isJokerAllowed === true && (
        <QuizshowJokerButton controller={controller} roundIndex={0} />
      )}
    </div>
  );
}

export function QuizshowPlayerLobby({
  controller,
}: {
  controller: QuizshowSessionController;
}) {
  const { session } = controller.state;
  if (!isPlayerState(session) || session.me === null) return null;
  return (
    <LobbyBody controller={controller} session={session} me={session.me} />
  );
}
