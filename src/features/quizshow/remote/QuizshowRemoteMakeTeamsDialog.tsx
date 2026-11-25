import { AnimatePresence } from "motion/react";
import { useId, useState, type FormEvent } from "react";
import { FiMinus, FiPlus, FiUsers } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { Modal } from "../../../shared/components/ui/Modal";
import type { TFunction } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_TEAM_COLOR_KEYS,
  type QuizshowHostTeam,
} from "../../../shared/contracts/quizshow";
import { foldNameKey } from "../quizshowNormalise";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowStudioDarkStamp } from "../studio/QuizshowStudioDarkStamp";
import { QuizshowRemoteErrorLine } from "./QuizshowRemoteControls";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import styles from "./QuizshowRemote.module.css";
import rosterStyles from "./QuizshowRemoteRoster.module.css";

const MIN_TABLE_COUNT = 2;
const BLANK_NAME_ERROR_KEY = "quizshow:errors.text_blank";
const TEAM_LIMIT_ERROR_KEY = "quizshow:errors.team_limit";

/** The host's copy for a refusal: the player-facing team limit line asks to join a team, so the dialog swaps it. */
function hostErrorKeyOf(errorKey: string | null): string | null {
  return errorKey === TEAM_LIMIT_ERROR_KEY
    ? "quizshow:remote.makeTeams.limit"
    : errorKey;
}
const DEFAULT_TABLE_COUNT = 4;

/** C6.11: how many teams one "Create these teams" can add, capped by the free team keys. */
function maxNewTeamsFor(existingTeamCount: number): number {
  const freeKeys = Math.min(
    QUIZSHOW_TEAM_COLOR_KEYS.length,
    QUIZSHOW_LIMITS.teamsPerSessionMax,
  );
  return Math.max(
    0,
    Math.min(
      QUIZSHOW_LIMITS.hostTeamsPerCommandMax,
      freeKeys - existingTeamCount,
    ),
  );
}

/** The next "Table N" whose name no team and no other row already holds, so the defaults never collide. */
function nextTableName(takenNames: readonly string[], t: TFunction): string {
  const takenKeys = new Set(takenNames.map((name) => foldNameKey(name)));
  for (let tableNumber = 1; ; tableNumber += 1) {
    const name = t("quizshow:remote.makeTeams.defaultName", {
      number: tableNumber,
    });
    if (!takenKeys.has(foldNameKey(name))) return name;
  }
}

function initialNames(
  count: number,
  existingNames: readonly string[],
  t: TFunction,
): string[] {
  const names: string[] = [];
  while (names.length < count) {
    names.push(nextTableName([...existingNames, ...names], t));
  }
  return names;
}

function MakeTeamsForm({
  controller,
  teams,
  maxCount,
  onClose,
}: {
  controller: QuizshowSessionController;
  teams: readonly QuizshowHostTeam[];
  maxCount: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { run, isPending, lastErrorKey } = useQuizshowHostCommand(controller);
  const existingNames = teams.map((team) => team.name);
  const minCount = Math.min(MIN_TABLE_COUNT, maxCount);
  const [names, setNames] = useState(() =>
    initialNames(
      Math.min(Math.max(DEFAULT_TABLE_COUNT, minCount), maxCount),
      existingNames,
      t,
    ),
  );
  const countLabelId = useId();
  const formId = useId();
  const isCreating = isPending("host:createTeams");
  // A blank name is stopped here: the server drops the whole command without an ack.
  const [isBlankShown, setIsBlankShown] = useState(false);

  const changeCount = (step: 1 | -1) => {
    setNames((current) => {
      if (step === -1) {
        return current.length > minCount ? current.slice(0, -1) : current;
      }
      if (current.length >= maxCount) return current;
      return [...current, nextTableName([...existingNames, ...current], t)];
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreating) return;
    const trimmedNames = names.map((name) => name.trim());
    const hasBlankName = trimmedNames.some((name) => name === "");
    setIsBlankShown(hasBlankName);
    if (hasBlankName) return;
    void run("host:createTeams", { names: trimmedNames }).then((isDone) => {
      if (isDone) onClose();
    });
  };

  return (
    <Modal
      title={t("quizshow:remote.makeTeams.open")}
      sub={t("quizshow:remote.makeTeams.hint")}
      onClose={onClose}
      className={rosterStyles.stageDialog}
      footer={
        <div className={rosterStyles.dialogFooter}>
          <Button variant="stage-ghost" onClick={onClose}>
            {t("quizshow:common.cancel")}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="stage"
            aria-disabled={isCreating}
          >
            {t("quizshow:remote.makeTeams.submit")}
          </Button>
        </div>
      }
    >
      {/* The dialog portals to the body; the stamp keeps it in the remote's dark. */}
      <QuizshowStudioDarkStamp />
      <form id={formId} className={rosterStyles.dialogForm} onSubmit={submit}>
        <div
          role="group"
          aria-labelledby={countLabelId}
          className={rosterStyles.stepper}
        >
          <span id={countLabelId} className={styles.label}>
            {t("quizshow:remote.makeTeams.count")}
          </span>
          <IconButton
            tone="dark"
            aria-label={t("quizshow:remote.makeTeams.fewer")}
            aria-disabled={names.length <= minCount}
            onClick={() => changeCount(-1)}
          >
            <FiMinus aria-hidden="true" fill="none" />
          </IconButton>
          <output className={rosterStyles.stepperValue} aria-live="polite">
            {names.length}
          </output>
          <IconButton
            tone="dark"
            aria-label={t("quizshow:remote.makeTeams.more")}
            aria-disabled={names.length >= maxCount}
            onClick={() => changeCount(1)}
          >
            <FiPlus aria-hidden="true" fill="none" />
          </IconButton>
        </div>
        <ol className={rosterStyles.nameList}>
          <AnimatePresence initial={false}>
            {names.map((name, nameIndex) => (
              // A row is its place in the list: rows only ever join or leave at the end.
              <CollapseListItem key={nameIndex}>
                <label className={rosterStyles.nameField}>
                  <span className={styles.label}>
                    {t("quizshow:remote.makeTeams.nameLabel", {
                      number: nameIndex + 1,
                    })}
                  </span>
                  <input
                    className={styles.input}
                    value={name}
                    maxLength={QUIZSHOW_LIMITS.teamNameMax}
                    autoComplete="off"
                    onChange={(event) => {
                      const nextName = event.target.value;
                      setIsBlankShown(false);
                      setNames((current) =>
                        current.map((currentName, currentIndex) =>
                          currentIndex === nameIndex ? nextName : currentName,
                        ),
                      );
                    }}
                  />
                </label>
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </ol>
        <QuizshowRemoteErrorLine
          errorKey={
            isBlankShown ? BLANK_NAME_ERROR_KEY : hostErrorKeyOf(lastErrorKey)
          }
        />
      </form>
    </Modal>
  );
}

/**
 * C6.11, teams play in the lobby: "Make teams for tables" opens a dialog that
 * names one team per table ("Table 1".."Table N") and creates them all at
 * once. Hidden while `isShown` is false or no team key is free.
 */
export function QuizshowRemoteMakeTeams({
  isShown,
  controller,
  teams,
}: {
  isShown: boolean;
  controller: QuizshowSessionController;
  teams: readonly QuizshowHostTeam[];
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const maxCount = maxNewTeamsFor(teams.length);
  const isAvailable = isShown && maxCount > 0;
  // Once the button goes (the game started, or every team key is taken), a
  // later return must not reopen the dialog on its own.
  if (isOpen && !isAvailable) setIsOpen(false);
  return (
    <>
      <Collapse isOpen={isAvailable}>
        <div className={rosterStyles.settingAction}>
          <Button
            variant="stage-ghost"
            size="md"
            aria-haspopup="dialog"
            onClick={() => setIsOpen(true)}
          >
            <FiUsers aria-hidden="true" fill="none" />
            {t("quizshow:remote.makeTeams.open")}
          </Button>
        </div>
      </Collapse>
      <AnimatePresence>
        {isOpen && isAvailable && (
          <MakeTeamsForm
            key="quizshow-remote-make-teams"
            controller={controller}
            teams={teams}
            maxCount={maxCount}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
