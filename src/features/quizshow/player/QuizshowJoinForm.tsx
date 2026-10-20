import { useId, useState, type FormEvent } from "react";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { Toggle } from "../../../shared/components/ui/Controls";
import { FormField } from "../../../shared/components/ui/FormField";
import {
  QUIZSHOW_LIMITS,
  type QuizshowErrorCode,
  type QuizshowLobbyJoinInput,
  type QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { isPlayerState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import styles from "./QuizshowPlay.module.css";
import { sendFailureKeyOf } from "./usePlayJoin";
import { QuizshowTeamPicker } from "./QuizshowTeamPicker";

const NAME_ERROR_CODES: readonly QuizshowErrorCode[] = [
  "quizshow_text_blank",
  "quizshow_text_blocked",
];
const TEAM_ERROR_CODES: readonly QuizshowErrorCode[] = [
  "quizshow_team_not_found",
  "quizshow_team_full",
  "quizshow_team_limit",
  "quizshow_team_name_taken",
  "quizshow_team_color_taken",
  "quizshow_team_required",
  "quizshow_team_change_closed",
];

interface JoinErrors {
  name: string | null;
  team: string | null;
  form: string | null;
}

const NO_ERRORS: JoinErrors = { name: null, team: null, form: null };

/** A refused text may be the screen name or a new team's name, so both fields show it. */
function errorsForCode(
  code: QuizshowErrorCode | "transport_timeout",
  hasSentNewTeam: boolean,
): JoinErrors {
  const key = sendFailureKeyOf(code);
  if (code === "transport_timeout") return { ...NO_ERRORS, form: key };
  if (NAME_ERROR_CODES.includes(code)) {
    return { ...NO_ERRORS, name: key, team: hasSentNewTeam ? key : null };
  }
  if (TEAM_ERROR_CODES.includes(code)) return { ...NO_ERRORS, team: key };
  return { ...NO_ERRORS, form: key };
}

/** A line under a control that folds in and out; it keeps its words while it folds away. */
export function QuizshowErrorLine({ errorKey }: { errorKey: string | null }) {
  const { t } = useTranslation();
  const [shownKey, setShownKey] = useState(errorKey);
  if (errorKey !== null && errorKey !== shownKey) setShownKey(errorKey);
  return (
    <Collapse isOpen={errorKey !== null}>
      <p className={styles.errorLine} role="alert">
        {shownKey === null ? "" : t(shownKey)}
      </p>
    </Collapse>
  );
}

interface QuizshowToggleRowProps {
  label: string;
  hint?: string;
  isOn: boolean;
  onChange: (isOn: boolean) => void;
}

/** A switch whose visible words are its name, with an optional line of help below. */
export function QuizshowToggleRow({
  label,
  hint,
  isOn,
  onChange,
}: QuizshowToggleRowProps) {
  const toggleId = useId();
  const hintId = useId();
  return (
    <div>
      <div className={styles.toggleRow}>
        <label className={styles.toggleLabel} htmlFor={toggleId}>
          {label}
        </label>
        <Toggle
          id={toggleId}
          checked={isOn}
          onChange={onChange}
          aria-describedby={hint === undefined ? undefined : hintId}
        />
      </div>
      {hint !== undefined && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

function JoinFormBody({
  controller,
  session,
}: {
  controller: QuizshowSessionController;
  session: QuizshowPlayerState;
}) {
  const { t } = useTranslation();
  const [screenName, setScreenName] = useState(session.suggestedScreenName);
  const [isAvatarShown, setIsAvatarShown] = useState(false);
  const [hasExtraTime, setHasExtraTime] = useState(false);
  const [team, setTeam] = useState<QuizshowLobbyJoinInput["team"]>(null);
  const [errors, setErrors] = useState<JoinErrors>(NO_ERRORS);
  const [isSending, setIsSending] = useState(false);
  const isTeams = session.playMode === "teams";

  async function submitJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending) return;
    const trimmedName = screenName.trim();
    const isTeamNameBlank =
      team !== null && "newTeam" in team && team.newTeam.name.trim() === "";
    if (trimmedName === "" || (isTeams && team === null) || isTeamNameBlank) {
      setErrors({
        name: trimmedName === "" ? "quizshow:errors.text_blank" : null,
        team:
          isTeams && team === null
            ? "quizshow:errors.team_required"
            : isTeamNameBlank
              ? "quizshow:errors.text_blank"
              : null,
        form: null,
      });
      return;
    }
    setErrors(NO_ERRORS);
    setIsSending(true);
    const sentTeam =
      team !== null && "newTeam" in team
        ? { newTeam: { ...team.newTeam, name: team.newTeam.name.trim() } }
        : team;
    const result = await controller.send("lobby:join", {
      screenName: trimmedName,
      isAvatarShown,
      hasExtraTime,
      team: isTeams ? sentTeam : null,
    });
    setIsSending(false);
    if (!result.ok) {
      setErrors(
        errorsForCode(
          result.code,
          isTeams && sentTeam !== null && "newTeam" in sentTeam,
        ),
      );
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => void submitJoin(event)}
      noValidate
    >
      <h1 className={styles.title}>{t("quizshow:player.nameTitle")}</h1>
      <Collapse isOpen={session.cursor.status !== "lobby"}>
        <p className={styles.lead}>{t("quizshow:player.waitNextQuestion")}</p>
      </Collapse>
      <FormField
        label={t("quizshow:player.nameLabel")}
        helper={t("quizshow:player.nameHint")}
        error={errors.name === null ? undefined : t(errors.name)}
      >
        <input
          type="text"
          value={screenName}
          maxLength={QUIZSHOW_LIMITS.screenNameMax}
          autoComplete="nickname"
          enterKeyHint="go"
          onChange={(event) => {
            setScreenName(event.target.value);
            setErrors({ ...errors, name: null });
          }}
        />
      </FormField>
      <QuizshowToggleRow
        label={t("quizshow:player.avatarLabel")}
        isOn={isAvatarShown}
        onChange={setIsAvatarShown}
      />
      <QuizshowToggleRow
        label={t("quizshow:player.extraTimeLabel")}
        hint={t("quizshow:player.extraTimeHint")}
        isOn={hasExtraTime}
        onChange={setHasExtraTime}
      />
      {isTeams && (
        <>
          <QuizshowTeamPicker
            lobby={session.lobby}
            maxTeamSize={session.maxTeamSize}
            value={team}
            onChange={(nextTeam) => {
              setTeam(nextTeam);
              setErrors({ ...errors, team: null });
            }}
          />
          <QuizshowErrorLine errorKey={errors.team} />
        </>
      )}
      <QuizshowErrorLine errorKey={errors.form} />
      <Button type="submit" size="lg" aria-disabled={isSending}>
        {t("quizshow:player.joinCta")}
      </Button>
    </form>
  );
}

export function QuizshowJoinForm({
  controller,
}: {
  controller: QuizshowSessionController;
}) {
  const { session } = controller.state;
  if (!isPlayerState(session)) return null;
  return <JoinFormBody controller={controller} session={session} />;
}
