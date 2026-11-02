import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { FormField } from "../../../shared/components/ui/FormField";
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_TEAM_COLOR_KEYS,
  type QuizshowLobby,
  type QuizshowLobbyJoinInput,
  type QuizshowTeamColorKey,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowShape } from "../QuizshowShape";
import { QUIZSHOW_SWATCHES } from "../quizshowSwatches";
import styles from "./QuizshowPlay.module.css";

type TeamChoice = QuizshowLobbyJoinInput["team"];

interface QuizshowTeamPickerProps {
  lobby: QuizshowLobby;
  maxTeamSize: number | null;
  value: TeamChoice;
  onChange: (team: TeamChoice) => void;
  /** The player's own team when changing team from the lobby; it reads as theirs and never as full. */
  currentTeamId?: string | null;
  /** A catalog key shown on the new team's name field, such as a blank name. */
  nameErrorKey?: string | null;
}

function firstFreeShape(
  takenShapes: ReadonlySet<QuizshowTeamColorKey>,
): QuizshowTeamColorKey {
  return (
    QUIZSHOW_TEAM_COLOR_KEYS.find((colorKey) => !takenShapes.has(colorKey)) ??
    QUIZSHOW_TEAM_COLOR_KEYS[0]
  );
}

/** A shape no lobby team shows yet, else any shape free to take. */
function preferredShape(
  lobbyShapes: ReadonlySet<QuizshowTeamColorKey>,
  takenShapes: ReadonlySet<QuizshowTeamColorKey>,
): QuizshowTeamColorKey {
  const hasUnusedShape = QUIZSHOW_TEAM_COLOR_KEYS.some(
    (colorKey) => !lobbyShapes.has(colorKey),
  );
  return firstFreeShape(hasUnusedShape ? lobbyShapes : takenShapes);
}

/** Pick a team that has room, or start one with a name and a shape nobody uses. */
export function QuizshowTeamPicker({
  lobby,
  maxTeamSize,
  value,
  onChange,
  currentTeamId = null,
  nameErrorKey = null,
}: QuizshowTeamPickerProps) {
  const { t } = useTranslation();
  const groupName = useId();
  // A player alone in their team leaves it empty by starting another, and the
  // empty team goes away, so its shape and its place under the limit are free.
  const otherTeams = lobby.teams.filter(
    (team) => !(team.teamId === currentTeamId && team.memberCount === 1),
  );
  const takenShapes = new Set(otherTeams.map((team) => team.colorKey));
  const lobbyShapes = new Set(lobby.teams.map((team) => team.colorKey));
  // The draft outlives the choice, so the form keeps its content while it folds away.
  const [draft, setDraft] = useState({
    name: "",
    colorKey: preferredShape(lobbyShapes, takenShapes),
  });
  const isStartingTeam = value !== null && "newTeam" in value;
  const isTeamLimitReached =
    otherTeams.length >= QUIZSHOW_LIMITS.teamsPerSessionMax;

  return (
    <fieldset className={styles.group}>
      <legend className={styles.groupLegend}>
        {t("quizshow:player.teamTitle")}
      </legend>
      <ul className={styles.choiceList}>
        <AnimatePresence initial={false}>
          {lobby.teams.map((team) => {
            const isCurrent = team.teamId === currentTeamId;
            const isFull =
              !isCurrent &&
              maxTeamSize !== null &&
              team.memberCount >= maxTeamSize;
            const isChosen =
              value !== null &&
              "teamId" in value &&
              value.teamId === team.teamId;
            return (
              <CollapseListItem key={team.teamId}>
                <label className={`${styles.choice} ${styles.choiceRow}`}>
                  <input
                    className={styles.choiceInput}
                    type="radio"
                    name={groupName}
                    checked={isChosen}
                    aria-disabled={isFull}
                    onChange={() => {
                      if (!isFull) onChange({ teamId: team.teamId });
                    }}
                  />
                  <span className={styles.choiceBody}>
                    <QuizshowShape
                      colorKey={team.colorKey}
                      size="small"
                      label={null}
                    />
                    <span className={styles.choiceName}>{team.name}</span>
                    <span className={styles.choiceMeta}>
                      {isCurrent
                        ? t("quizshow:player.changeTeam.current")
                        : isFull
                          ? t("quizshow:player.teamFull")
                          : t("quizshow:player.teamMembers", {
                              count: team.memberCount,
                            })}
                    </span>
                  </span>
                </label>
              </CollapseListItem>
            );
          })}
        </AnimatePresence>
      </ul>
      <label className={styles.choice}>
        <input
          className={styles.choiceInput}
          type="radio"
          name={groupName}
          checked={isStartingTeam}
          aria-disabled={isTeamLimitReached}
          onChange={() => {
            if (isTeamLimitReached) return;
            const colorKey = takenShapes.has(draft.colorKey)
              ? preferredShape(lobbyShapes, takenShapes)
              : draft.colorKey;
            setDraft({ ...draft, colorKey });
            onChange({ newTeam: { name: draft.name, colorKey } });
          }}
        />
        <span className={styles.choiceBody}>
          {t("quizshow:player.teamCreate")}
        </span>
      </label>
      <Collapse isOpen={isTeamLimitReached}>
        <p className={styles.hint}>{t("quizshow:errors.team_limit")}</p>
      </Collapse>
      <Collapse isOpen={isStartingTeam}>
        <div className={styles.newTeam}>
          <FormField
            label={t("quizshow:player.teamNameLabel")}
            error={nameErrorKey === null ? undefined : t(nameErrorKey)}
          >
            <input
              type="text"
              value={draft.name}
              maxLength={QUIZSHOW_LIMITS.teamNameMax}
              autoComplete="off"
              enterKeyHint="done"
              onChange={(event) => {
                const nextDraft = { ...draft, name: event.target.value };
                setDraft(nextDraft);
                onChange({ newTeam: nextDraft });
              }}
            />
          </FormField>
          <QuizshowShapeChoice
            takenShapes={takenShapes}
            value={draft.colorKey}
            onChange={(colorKey) => {
              const nextDraft = { ...draft, colorKey };
              setDraft(nextDraft);
              onChange({ newTeam: nextDraft });
            }}
          />
        </div>
      </Collapse>
    </fieldset>
  );
}

function QuizshowShapeChoice({
  takenShapes,
  value,
  onChange,
}: {
  takenShapes: ReadonlySet<QuizshowTeamColorKey>;
  value: QuizshowTeamColorKey;
  onChange: (colorKey: QuizshowTeamColorKey) => void;
}) {
  const { t } = useTranslation();
  const groupName = useId();
  return (
    <fieldset className={styles.group}>
      <legend className={styles.groupLegend}>
        {t("quizshow:player.teamShapeLabel")}
      </legend>
      <div className={styles.shapeGrid}>
        {QUIZSHOW_TEAM_COLOR_KEYS.map((colorKey) => {
          const isTaken = takenShapes.has(colorKey);
          const shapeName = t(QUIZSHOW_SWATCHES[colorKey].labelKey);
          return (
            <label key={colorKey} className={styles.choice}>
              <input
                className={styles.choiceInput}
                type="radio"
                name={groupName}
                checked={value === colorKey}
                aria-disabled={isTaken}
                onChange={() => {
                  if (!isTaken) onChange(colorKey);
                }}
              />
              <span className={`${styles.choiceBody} ${styles.shapeBody}`}>
                <QuizshowShape colorKey={colorKey} size="medium" label={null} />
              </span>
              <span className={styles.visuallyHidden}>{shapeName}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
