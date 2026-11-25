import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiUser, FiUsers } from "react-icons/fi";
import { Button, Collapse, Modal, Toggle } from "../../../shared/components/ui";
import { RadioCardGroup } from "../../../shared/components/ui/RadioCardGroup";
import { Select } from "../../../shared/components/ui/Select";
import {
  QUIZSHOW_LIMITS,
  type QuizshowOpenSessionInput,
  type QuizshowOpenSettingsMemory,
  type QuizshowPlayMode,
  type QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import {
  quizshowScopeScreenPath,
  type QuizshowSessionScope,
} from "../quizshowScope";
import { QuizshowPracticeNoBadgesLine } from "../winBadges/QuizshowPracticeNoBadgesLine";
import { QuizshowProblemList } from "./QuizshowProblemList";
import { useQuizshowDarkDialog } from "./useQuizshowDarkDialog";
import { useQuizshowOpenLobby } from "./useQuizshowOpenLobby";
import styles from "./QuizshowLobby.module.css";

const NO_TEAM_LIMIT = "none";
const MIN_TEAM_SIZE = QUIZSHOW_LIMITS.maxTeamSizeMin;
const MAX_TEAM_SIZE = QUIZSHOW_LIMITS.maxTeamSizeMax;
const PLAY_MODES: readonly QuizshowPlayMode[] = ["solo", "teams"];
const PLAY_MODE_ICONS = { solo: FiUser, teams: FiUsers } as const;

/** The finished session a rematch replays (item 38). */
export interface QuizshowRematchOf {
  sessionId: string;
  isPractice: boolean;
}

interface QuizshowOpenLobbyDialogProps {
  scope: QuizshowSessionScope;
  rounds: ReadonlyArray<{ kind: QuizshowRoundKind }>;
  isOpen: boolean;
  onClose: () => void;
  /** A draft event (item 53): practice is the only way in, so the switch starts on and stays on. */
  isPracticeOnly?: boolean;
  /** Rematch (item 38): practice follows the finished session and the open sends its id. */
  rematchOf?: QuizshowRematchOf | null;
}

/** The dialog's fields, named as the open input names them. */
type OpenLobbySettings = Pick<
  QuizshowOpenSessionInput,
  "playMode" | "isReviewOn" | "notifyGuests" | "isPractice"
> & { teamSize: string };

interface ToggleRowProps {
  label: string;
  hint: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  isDisabled?: boolean;
}

function ToggleRow({
  label,
  hint,
  isChecked,
  onChange,
  isDisabled = false,
}: ToggleRowProps) {
  const toggleId = useId();
  return (
    <div className={styles.toggleRow}>
      <label htmlFor={toggleId} className={styles.toggleText}>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={styles.toggleHint}>{hint}</span>
      </label>
      <Toggle
        id={toggleId}
        checked={isChecked}
        onChange={onChange}
        disabled={isDisabled}
      />
    </div>
  );
}

function teamSizeOptions(noneLabel: string) {
  const sizes = Array.from(
    { length: MAX_TEAM_SIZE - MIN_TEAM_SIZE + 1 },
    (_unused, sizeIndex) => String(MIN_TEAM_SIZE + sizeIndex),
  );
  return [
    { value: NO_TEAM_LIMIT, label: noneLabel },
    ...sizes.map((size) => ({ value: size, label: size })),
  ];
}

function teamSizeOf(maxTeamSize: number | null | undefined): string {
  if (maxTeamSize == null) return NO_TEAM_LIMIT;
  const isInRange =
    maxTeamSize >= MIN_TEAM_SIZE && maxTeamSize <= MAX_TEAM_SIZE;
  return isInRange ? String(maxTeamSize) : NO_TEAM_LIMIT;
}

/** C6.8: the guest push starts off; item 52: the rest follows the last open. */
function settingsFromMemory(
  memory: QuizshowOpenSettingsMemory | null,
  isPractice: boolean,
): OpenLobbySettings {
  return {
    playMode: memory?.playMode ?? "solo",
    teamSize: teamSizeOf(memory?.maxTeamSize),
    isReviewOn: memory?.isReviewOn ?? true,
    notifyGuests: false,
    isPractice,
  };
}

/** Null leaves the practice switch to the host; true or false holds it there. */
function lockedPracticeOf(
  isPracticeOnly: boolean,
  rematchOf: QuizshowRematchOf | null,
): boolean | null {
  if (rematchOf) return rematchOf.isPractice;
  return isPracticeOnly ? true : null;
}

function useOpenLobbySettings(
  scope: QuizshowSessionScope,
  lockedPractice: boolean | null,
) {
  const memory =
    useQuizshowQuiz(scope, { isEnabled: true }).data?.lastOpenSettings ?? null;
  const [settings, setSettings] = useState(() =>
    settingsFromMemory(memory, lockedPractice ?? false),
  );
  const [hasSettled, setHasSettled] = useState(memory !== null);
  // The quiz read can land after the dialog opened: it prefills once, unless
  // the host already changed a setting.
  if (!hasSettled && memory !== null) {
    setHasSettled(true);
    setSettings(settingsFromMemory(memory, settings.isPractice));
  }
  function update(patch: Partial<OpenLobbySettings>) {
    setHasSettled(true);
    setSettings((previous) => ({ ...previous, ...patch }));
  }
  return { settings, update };
}

function PlayModeField({
  playMode,
  onChange,
}: {
  playMode: QuizshowPlayMode;
  onChange: (playMode: QuizshowPlayMode) => void;
}) {
  const { t } = useTranslation();
  const groupLabelId = useId();
  return (
    <div className={styles.field}>
      <span className={styles.label} id={groupLabelId}>
        {t("quizshow:lobby.playMode.label")}
      </span>
      <RadioCardGroup<QuizshowPlayMode>
        value={playMode}
        onChange={onChange}
        ariaLabel={t("quizshow:lobby.playMode.label")}
        ariaLabelledBy={groupLabelId}
        className={styles.modeGroup}
        optionClassName={styles.modeOption}
        checkedClassName={styles.modeOptionOn}
        options={PLAY_MODES.map((mode) => {
          const ModeIcon = PLAY_MODE_ICONS[mode];
          // Title and hint both sit inside the radio button, so a screen
          // reader announces the explanation as part of the option.
          return {
            id: mode,
            render: (
              <>
                <span className={styles.modeTop}>
                  <ModeIcon className={styles.modeIcon} aria-hidden />
                  <span className={styles.modeMark} aria-hidden />
                </span>
                <span className={styles.modeTitle}>
                  {t(`quizshow:lobby.playMode.${mode}Title`)}
                </span>
                <span className={styles.modeHint}>
                  {t(`quizshow:lobby.playMode.${mode}Hint`)}
                </span>
              </>
            ),
          };
        })}
      />
    </div>
  );
}

function LobbyFeedback({
  scope,
  rounds,
  lobby,
  onClose,
}: Pick<QuizshowOpenLobbyDialogProps, "scope" | "rounds" | "onClose"> & {
  lobby: ReturnType<typeof useQuizshowOpenLobby>;
}) {
  const { t } = useTranslation();
  const isGame = scope.kind === "game";
  return (
    <>
      <Collapse isOpen={lobby.problems.length > 0}>
        <div className={styles.feedback} role="alert">
          <p className={styles.feedbackTitle}>
            {t("quizshow:lobby.incomplete")}
          </p>
          <QuizshowProblemList problems={lobby.problems} rounds={rounds} />
        </div>
      </Collapse>
      <Collapse isOpen={lobby.alreadyOpen !== null}>
        <div className={styles.feedback} role="alert">
          <p className={styles.feedbackTitle}>
            {t(
              isGame
                ? "quizshow:lobby.alreadyOpenGame"
                : "quizshow:lobby.alreadyOpen",
            )}
          </p>
          <Button
            variant="stage-ghost"
            size="sm"
            to={quizshowScopeScreenPath(scope)}
            onClick={onClose}
          >
            {t("quizshow:lobby.goToGame")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={lobby.errorKey !== null}>
        <p className={styles.errorLine} role="alert">
          {lobby.errorKey ? t(lobby.errorKey) : null}
        </p>
      </Collapse>
    </>
  );
}

function OpenLobbyForm({
  scope,
  rounds,
  onClose,
  isPracticeOnly = false,
  rematchOf = null,
}: Omit<QuizshowOpenLobbyDialogProps, "isOpen">) {
  const { t } = useTranslation();
  const teamSizeLabelId = useId();
  const lockedPractice = lockedPracticeOf(isPracticeOnly, rematchOf);
  const { settings, update } = useOpenLobbySettings(scope, lockedPractice);
  // Read live, so a lock that arrives after the dialog opened still holds.
  const isPractice = lockedPractice ?? settings.isPractice;
  const isGame = scope.kind === "game";
  const isRematch = rematchOf !== null;
  // A rematch of a scored game keeps scoring, so the practice row stays away.
  const isPracticeRowShown = !isRematch || rematchOf.isPractice;
  const lobby = useQuizshowOpenLobby(scope);
  const darkDialogRef = useQuizshowDarkDialog();

  function handleOpen() {
    if (lobby.isPending) return;
    const isTeams = settings.playMode === "teams";
    lobby.open({
      playMode: settings.playMode,
      maxTeamSize:
        isTeams && settings.teamSize !== NO_TEAM_LIMIT
          ? Number(settings.teamSize)
          : null,
      isReviewOn: settings.isReviewOn,
      notifyGuests: !isGame && !isPractice && settings.notifyGuests,
      shouldReplaceResults: false,
      isPractice,
      rematchOfSessionId: rematchOf?.sessionId ?? null,
    });
  }

  return (
    <Modal
      title={t(
        isRematch
          ? "quizshow:lobby.rematch.title"
          : "quizshow:lobby.dialogTitle",
      )}
      sub={t("quizshow:lobby.dialogSub")}
      onClose={onClose}
      className={styles.stageDialog}
      footer={
        <div className={styles.footer}>
          <Button variant="stage-ghost" onClick={onClose}>
            {t("shared:confirmDialog.cancel")}
          </Button>
          <Button
            variant="stage"
            aria-disabled={lobby.isPending}
            onClick={handleOpen}
          >
            {t(
              isRematch
                ? "quizshow:lobby.rematch.submit"
                : "quizshow:lobby.open",
            )}
          </Button>
        </div>
      }
    >
      <div className={styles.form} ref={darkDialogRef}>
        <PlayModeField
          playMode={settings.playMode}
          onChange={(playMode) => update({ playMode })}
        />
        <Collapse isOpen={settings.playMode === "teams"}>
          <div className={styles.field}>
            <span className={styles.label} id={teamSizeLabelId}>
              {t("quizshow:lobby.maxTeamSize.label")}
            </span>
            <Select
              value={settings.teamSize}
              onChange={(next) => update({ teamSize: next ?? NO_TEAM_LIMIT })}
              options={teamSizeOptions(t("quizshow:lobby.maxTeamSize.none"))}
              labelledBy={teamSizeLabelId}
              searchable={false}
            />
            <p className={styles.fieldHint}>
              {t("quizshow:lobby.playMode.teamsScoring")}
            </p>
          </div>
        </Collapse>
        <ToggleRow
          label={t("quizshow:lobby.review.label")}
          hint={t(
            isGame
              ? "quizshow:lobby.review.hintGame"
              : "quizshow:lobby.review.hint",
          )}
          isChecked={settings.isReviewOn}
          onChange={(isReviewOn) => update({ isReviewOn })}
        />
        <Collapse isOpen={isPracticeRowShown}>
          <ToggleRow
            label={t("quizshow:lobby.practice.label")}
            hint={t(
              isPracticeOnly
                ? "quizshow:builder.draftEvent.line"
                : "quizshow:lobby.practice.hint",
            )}
            isChecked={isPractice}
            onChange={(isChecked) => update({ isPractice: isChecked })}
            isDisabled={lockedPractice !== null}
          />
        </Collapse>
        <QuizshowPracticeNoBadgesLine scope={scope} isPractice={isPractice} />
        <Collapse isOpen={!isGame && !isPractice}>
          <ToggleRow
            label={t("quizshow:lobby.notify.label")}
            hint={t("quizshow:lobby.notify.hint")}
            isChecked={settings.notifyGuests}
            onChange={(notifyGuests) => update({ notifyGuests })}
          />
        </Collapse>
        <LobbyFeedback
          scope={scope}
          rounds={rounds}
          lobby={lobby}
          onClose={onClose}
        />
      </div>
      {lobby.replaceResultsDialog}
    </Modal>
  );
}

export function QuizshowOpenLobbyDialog({
  isOpen,
  ...formProps
}: QuizshowOpenLobbyDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && <OpenLobbyForm key="quizshow-open-lobby" {...formProps} />}
    </AnimatePresence>
  );
}
