import { useId, useState } from "react";
import { FiChevronDown, FiMinus, FiPlus } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { Select } from "../../../shared/components/ui/Select";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowHostState,
} from "../../../shared/contracts/quizshow";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowRemoteErrorLine } from "./QuizshowRemoteControls";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import remoteStyles from "./QuizshowRemote.module.css";
import styles from "./QuizshowRemoteRescore.module.css";

const AMOUNT_STEP = 100;
const AMOUNT_DEFAULT = 100;
const AMOUNT_MINIMUM = 1;

type AdjustDirection = "give" | "take";

function clampAmount(amount: number): number {
  const whole = Math.round(amount);
  return Math.min(
    QUIZSHOW_LIMITS.adjustPointsMax,
    Math.max(AMOUNT_MINIMUM, whole),
  );
}

/** Solo play adjusts a player, teams play a team (C6.4 `host:adjustPoints`). */
function entrantOptionsOf(session: QuizshowHostState) {
  if (session.playMode === "teams") {
    return session.lobby.teams.map((team) => ({
      value: team.teamId,
      label: team.name,
    }));
  }
  return session.lobby.players.map((player) => ({
    value: player.playerId,
    label: player.screenName,
  }));
}

/** The amount, a stepper of 100s with a field for any whole number up to the limit. */
function AmountStepper({
  amount,
  onChange,
}: {
  amount: number;
  onChange: (amount: number) => void;
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const [typedText, setTypedText] = useState<string | null>(null);
  return (
    <div className={styles.amountField}>
      <label htmlFor={inputId} className={remoteStyles.label}>
        {t("quizshow:remote.rescore.amount")}
      </label>
      <div className={styles.stepper}>
        <IconButton
          tone="dark"
          aria-label={t("quizshow:remote.rescore.amountDown", {
            step: AMOUNT_STEP,
          })}
          aria-disabled={amount <= AMOUNT_MINIMUM}
          onClick={() => onChange(clampAmount(amount - AMOUNT_STEP))}
        >
          <FiMinus aria-hidden="true" fill="none" />
        </IconButton>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          className={`${remoteStyles.input} ${styles.amountInput}`}
          min={AMOUNT_MINIMUM}
          max={QUIZSHOW_LIMITS.adjustPointsMax}
          // Any whole number types in; the buttons move in 100s.
          step={1}
          value={typedText ?? String(amount)}
          onChange={(event) => {
            setTypedText(event.target.value);
            const parsed = Number(event.target.value);
            if (event.target.value !== "" && Number.isFinite(parsed)) {
              onChange(clampAmount(parsed));
            }
          }}
          onBlur={() => setTypedText(null)}
        />
        <IconButton
          tone="dark"
          aria-label={t("quizshow:remote.rescore.amountUp", {
            step: AMOUNT_STEP,
          })}
          aria-disabled={amount >= QUIZSHOW_LIMITS.adjustPointsMax}
          onClick={() => onChange(clampAmount(amount + AMOUNT_STEP))}
        >
          <FiPlus aria-hidden="true" fill="none" />
        </IconButton>
      </div>
    </div>
  );
}

/**
 * Give or take points (item 5), folded behind its title so it stays out of
 * the way. Give and Take each send through their own command hook, so one
 * pending tap never holds the other button. Every tap carries a fresh
 * request id: a retry of the same tap applies once, a second tap applies again.
 */
export function QuizshowRemoteAdjustPoints({
  controller,
  session,
}: {
  controller: QuizshowSessionController;
  session: QuizshowHostState;
}) {
  const { t } = useTranslation();
  const panelId = useId();
  const pickerLabelId = useId();
  const titleId = useId();
  const pickHintId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [pickedEntrantId, setPickedEntrantId] = useState<string | null>(null);
  const [amount, setAmount] = useState(AMOUNT_DEFAULT);
  const [lastDirection, setLastDirection] = useState<AdjustDirection>("give");
  const giveCommand = useQuizshowHostCommand(controller);
  const takeCommand = useQuizshowHostCommand(controller);
  const commands = { give: giveCommand, take: takeCommand };
  const options = entrantOptionsOf(session);
  // A player or team that left the game drops the pick.
  const entrantId = options.some((option) => option.value === pickedEntrantId)
    ? pickedEntrantId
    : null;
  const isTeams = session.playMode === "teams";
  const isEntrantMissing = entrantId === null;

  const send = (direction: AdjustDirection) => {
    const command = commands[direction];
    if (entrantId === null || command.isPending("host:adjustPoints")) return;
    setLastDirection(direction);
    void command.run("host:adjustPoints", {
      entrantId,
      delta: direction === "give" ? amount : -amount,
      requestId: crypto.randomUUID(),
    });
  };

  return (
    <section className={remoteStyles.section} aria-labelledby={titleId}>
      <Button
        variant="stage-ghost"
        size="md"
        className={styles.disclosure}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <span id={titleId}>{t("quizshow:remote.rescore.adjustTitle")}</span>
        <FiChevronDown
          aria-hidden="true"
          fill="none"
          className={styles.disclosureIcon}
          data-is-open={isOpen}
        />
      </Button>
      <div id={panelId}>
        <Collapse isOpen={isOpen}>
          <div className={styles.adjustBody}>
            <div className={remoteStyles.field}>
              <span id={pickerLabelId} className={remoteStyles.label}>
                {t(
                  isTeams
                    ? "quizshow:remote.teamsTitle"
                    : "quizshow:remote.playersTitle",
                )}
              </span>
              <Select
                value={entrantId}
                onChange={setPickedEntrantId}
                options={options}
                labelledBy={pickerLabelId}
                searchable={options.length > 8}
              />
            </div>
            <AmountStepper amount={amount} onChange={setAmount} />
            <Collapse isOpen={isEntrantMissing}>
              <p id={pickHintId} className={remoteStyles.hint}>
                {t(
                  isTeams
                    ? "quizshow:remote.rescore.pickTeamFirst"
                    : "quizshow:remote.rescore.pickPlayerFirst",
                )}
              </p>
            </Collapse>
            <div className={styles.actions}>
              {(["give", "take"] as const).map((direction) => (
                <Button
                  key={direction}
                  variant="stage-ghost"
                  size="md"
                  aria-disabled={
                    isEntrantMissing ||
                    commands[direction].isPending("host:adjustPoints")
                  }
                  aria-describedby={isEntrantMissing ? pickHintId : undefined}
                  onClick={() => send(direction)}
                >
                  {t(
                    direction === "give"
                      ? "quizshow:remote.rescore.give"
                      : "quizshow:remote.rescore.take",
                  )}
                </Button>
              ))}
            </div>
            <QuizshowRemoteErrorLine
              errorKey={commands[lastDirection].lastErrorKey}
            />
          </div>
        </Collapse>
      </div>
    </section>
  );
}
