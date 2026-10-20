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
}

function firstFreeShape(
  takenShapes: ReadonlySet<QuizshowTeamColorKey>,
): QuizshowTeamColorKey {
  return (
    QUIZSHOW_TEAM_COLOR_KEYS.find((colorKey) => !takenShapes.has(colorKey)) ??
    QUIZSHOW_TEAM_COLOR_KEYS[0]
  );
}

/** Pick a team that has room, or start one with a name and a shape nobody uses. */
export function QuizshowTeamPicker({
  lobby,
  maxTeamSize,
  value,
  onChange,
}: QuizshowTeamPickerProps) {
  const { t } = useTranslation();
  const groupName = useId();
  const takenShapes = new Set(lobby.teams.map((team) => team.colorKey));
  // The draft outlives the choice, so the form keeps its content while it folds away.
  const [draft, setDraft] = useState({
    name: "",
    colorKey: firstFreeShape(takenShapes),
  });
  const isStartingTeam = value !== null && "newTeam" in value;
  const isTeamLimitReached =
    lobby.teams.length >= QUIZSHOW_LIMITS.teamsPerSessionMax;

  return (
    <fieldset className={styles.group}>
      <legend className={styles.groupLegend}>
        {t("quizshow:player.teamTitle")}
      </legend>
      <ul className={styles.choiceList}>
        <AnimatePresence initial={false}>
          {lobby.teams.map((team) => {
            const isFull =
              maxTeamSize !== null && team.memberCount >= maxTeamSize;
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
                      {isFull
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
              ? firstFreeShape(takenShapes)
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
          <FormField label={t("quizshow:player.teamNameLabel")}>
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
