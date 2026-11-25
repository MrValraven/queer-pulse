import { useEffect, useId, useRef, useState, type FormEvent } from "react";
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
import { quizshowSuggestedScreenNameOf } from "../api/quizshowErrors";
import { foldNameKey } from "../quizshowNormalise";
import { isPlayerState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import styles from "./QuizshowPlay.module.css";
import { sendFailureKeyOf } from "./usePlayJoin";
import { QuizshowTeamPicker } from "./QuizshowTeamPicker";

const NAME_ERROR_CODES: readonly QuizshowErrorCode[] = [
  "quizshow_text_blank",
  "quizshow_text_blocked",
];
/** The name copy when every "<name> 2".."<name> 99" is taken too (C6.13 omits the suggestion). */
const NAME_TAKEN_NO_SUGGESTION_KEY = "quizshow:player.nameTakenNoSuggestion";
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
  if (code === "quizshow_screen_name_taken") return { ...NO_ERRORS, name: key };
  if (NAME_ERROR_CODES.includes(code)) {
    return { ...NO_ERRORS, name: key, team: hasSentNewTeam ? key : null };
  }
  if (TEAM_ERROR_CODES.includes(code)) return { ...NO_ERRORS, team: key };
  return { ...NO_ERRORS, form: key };
}

/** The lobby team named like the player's old team (C6.17), compared by `foldNameKey`. */
function rematchTeamIdOf(
  session: QuizshowPlayerState,
  teamName: string | null,
): string | null {
  if (teamName === null) return null;
  const teamKey = foldNameKey(teamName);
  const lobbyTeam = session.lobby.teams.find(
    (candidate) => foldNameKey(candidate.name) === teamKey,
  );
  return lobbyTeam?.teamId ?? null;
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

interface QuizshowJoinFormProps {
  controller: QuizshowSessionController;
  /** The player confirmed the 18+ step; `lobby:join` then carries it. */
  hasAcceptedAdultContent?: boolean;
  /** The server asked for the 18+ step; the page shows it again and the form shows no error. */
  onConsentRequired?: () => void;
  /** The old team's name for a rematch join (D7). The play page owns the
   *  stored name: it reads it once and clears it, so the form never touches storage. */
  rematchTeamName?: string | null;
}

/** "Use Alex 2" under a taken name (item 33): fills the field, then focus moves to "I'm in". */
function NameSuggestion({
  suggestion,
  onUse,
}: {
  suggestion: string | null;
  onUse: (suggestion: string) => void;
}) {
  const { t } = useTranslation();
  const [shownSuggestion, setShownSuggestion] = useState(suggestion);
  if (suggestion !== null && suggestion !== shownSuggestion) {
    setShownSuggestion(suggestion);
  }
  return (
    <Collapse isOpen={suggestion !== null}>
      <Button
        variant="stage-ghost"
        size="md"
        onClick={() => {
          if (shownSuggestion !== null) onUse(shownSuggestion);
        }}
      >
        {t("quizshow:player.useSuggestion", {
          suggestion: shownSuggestion ?? "",
        })}
      </Button>
    </Collapse>
  );
}

function JoinFormBody({
  controller,
  session,
  hasAcceptedAdultContent = false,
  onConsentRequired,
  rematchTeamName = null,
}: QuizshowJoinFormProps & { session: QuizshowPlayerState }) {
  const { t } = useTranslation();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  // Coming from the 18+ step, focus lands on the name step's heading.
  useEffect(() => {
    if (hasAcceptedAdultContent) headingRef.current?.focus();
  }, [hasAcceptedAdultContent]);
  const [screenName, setScreenName] = useState(session.suggestedScreenName);
  // A rematch join starts on the old team when it is in this lobby (D7).
  const [rematchTeamId] = useState(() =>
    rematchTeamIdOf(session, rematchTeamName),
  );
  // The picker selects `rematchTeamId` on mount when that team has room.
  const [team, setTeam] = useState<QuizshowLobbyJoinInput["team"]>(null);
  const [errors, setErrors] = useState<JoinErrors>(NO_ERRORS);
  const [nameSuggestion, setNameSuggestion] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const isTeams = session.playMode === "teams";
  // A picked team that emptied and vanished drops the pick, and says why.
  if (
    team !== null &&
    "teamId" in team &&
    !session.lobby.teams.some((lobbyTeam) => lobbyTeam.teamId === team.teamId)
  ) {
    setTeam(null);
    setErrors({ ...errors, team: "quizshow:errors.team_not_found" });
  }

  function applySuggestion(suggestion: string) {
    setScreenName(suggestion);
    setNameSuggestion(null);
    setErrors({ ...errors, name: null });
    submitRef.current?.focus();
  }

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
    setNameSuggestion(null);
    setIsSending(true);
    const sentTeam =
      team !== null && "newTeam" in team
        ? { newTeam: { ...team.newTeam, name: team.newTeam.name.trim() } }
        : team;
    // Extra time and the photo are set from the lobby sheet after joining (item 31).
    const result = await controller.send("lobby:join", {
      screenName: trimmedName,
      ...(hasAcceptedAdultContent ? { hasAcceptedAdultContent: true } : {}),
      isAvatarShown: false,
      hasExtraTime: false,
      team: isTeams ? sentTeam : null,
    });
    setIsSending(false);
    if (result.ok) return;
    if (
      result.code === "quizshow_adult_consent_required" &&
      onConsentRequired !== undefined
    ) {
      onConsentRequired();
      return;
    }
    const suggestion =
      result.code === "transport_timeout"
        ? null
        : quizshowSuggestedScreenNameOf(result);
    const nextErrors = errorsForCode(
      result.code,
      isTeams && sentTeam !== null && "newTeam" in sentTeam,
    );
    setNameSuggestion(suggestion);
    setErrors(
      result.code === "quizshow_screen_name_taken" && suggestion === null
        ? { ...nextErrors, name: NAME_TAKEN_NO_SUGGESTION_KEY }
        : nextErrors,
    );
  }

  return (
    <form
      className={`${styles.form} ${styles.sheet}`}
      onSubmit={(event) => void submitJoin(event)}
      noValidate
    >
      <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
        {t("quizshow:player.nameTitle")}
      </h1>
      <Collapse isOpen={session.cursor.status !== "lobby"}>
        <p className={styles.lead}>{t("quizshow:player.waitNextQuestion")}</p>
      </Collapse>
      <FormField
        label={t("quizshow:player.nameLabel")}
        helper={t("quizshow:player.nameHint")}
        error={
          errors.name === null
            ? undefined
            : t(errors.name, { suggestion: nameSuggestion ?? "" })
        }
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
            setNameSuggestion(null);
          }}
        />
      </FormField>
      <NameSuggestion suggestion={nameSuggestion} onUse={applySuggestion} />
      {isTeams && (
        <>
          <hr className={styles.divider} />
          <QuizshowTeamPicker
            lobby={session.lobby}
            maxTeamSize={session.maxTeamSize}
            value={team}
            initialTeamId={rematchTeamId}
            onChange={(nextTeam) => {
              setTeam(nextTeam);
              setErrors({ ...errors, team: null });
            }}
          />
          <QuizshowErrorLine errorKey={errors.team} />
        </>
      )}
      <QuizshowErrorLine errorKey={errors.form} />
      <Button
        ref={submitRef}
        type="submit"
        variant="stage"
        size="lg"
        aria-disabled={isSending}
      >
        {t("quizshow:player.joinSubmit")}
      </Button>
    </form>
  );
}

export function QuizshowJoinForm({
  controller,
  hasAcceptedAdultContent,
  onConsentRequired,
  rematchTeamName,
}: QuizshowJoinFormProps) {
  const { session } = controller.state;
  if (!isPlayerState(session)) return null;
  return (
    <JoinFormBody
      controller={controller}
      session={session}
      hasAcceptedAdultContent={hasAcceptedAdultContent}
      onConsentRequired={onConsentRequired}
      rematchTeamName={rematchTeamName}
    />
  );
}
