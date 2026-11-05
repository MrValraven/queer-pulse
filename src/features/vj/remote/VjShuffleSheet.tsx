import { useId, useRef, useState } from "react";
import { Button, Collapse, Modal } from "../../../shared/components/ui";
import {
  VJ_LIMITS,
  VJ_SHUFFLE_BEAT_COUNTS,
  VJ_SHUFFLE_INTERVAL_KINDS,
  vjShuffleIntervalMs,
  type VjShuffle,
  type VjShuffleIntervalKind,
} from "../../../shared/contracts/vj";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowDarkDialog } from "../../quizshow/builder/useQuizshowDarkDialog";
import type { VjCommandOutcome } from "../live/vjStageCommands";
import type { useVjCommandRunner } from "./useVjCommandRunner";
import { VjSheetAlert } from "./VjSheetAlert";
import { VjTapTempoButton } from "./VjTapTempoButton";
import styles from "./VjSheets.module.css";

type VjRun = ReturnType<typeof useVjCommandRunner>["run"];

/** Never a real interval signature, so the next render re-reads the stage's interval. */
const RESYNC_SIGNATURE = "";

const KIND_LABEL_KEY: Record<VjShuffleIntervalKind, string> = {
  seconds: "vj:shuffle.seconds",
  beats: "vj:shuffle.beats",
};

/** One decimal at most: 7.74 gives 7.7, 8 gives 8. */
function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

/** A typed tempo as a number from 60 to 200 with one decimal, or null when it is outside or unreadable. */
function parseVjBpm(text: string): number | null {
  const normalized = text.trim().replace(",", ".");
  if (normalized.length === 0) return null;
  const bpm = Number(normalized);
  if (!Number.isFinite(bpm)) return null;
  if (bpm < VJ_LIMITS.bpmMin || bpm > VJ_LIMITS.bpmMax) return null;
  return roundToTenth(bpm);
}

interface VjShuffleDraft {
  kind: VjShuffleIntervalKind;
  seconds: number;
  beats: number;
}

function draftOf(shuffle: VjShuffle): VjShuffleDraft {
  const isSeconds = shuffle.intervalKind === "seconds";
  return {
    kind: shuffle.intervalKind,
    seconds: isSeconds
      ? shuffle.intervalValue
      : VJ_LIMITS.shuffleSecondsDefault,
    beats: isSeconds ? VJ_LIMITS.shuffleBeatsDefault : shuffle.intervalValue,
  };
}

function intervalValueOf(draft: VjShuffleDraft): number {
  return draft.kind === "seconds" ? draft.seconds : draft.beats;
}

/** Seconds or beats: the pair, the seconds slider or the beat chips with their length in seconds. */
function VjShuffleInterval({
  draft,
  bpm,
  isHeld,
  onDraft,
  onCommit,
}: {
  draft: VjShuffleDraft;
  bpm: number;
  isHeld: boolean;
  onDraft: (draft: VjShuffleDraft) => void;
  onCommit: (draft: VjShuffleDraft) => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const sliderId = useId();
  const beatsSeconds = roundToTenth(
    vjShuffleIntervalMs({
      isOn: true,
      intervalKind: "beats",
      intervalValue: draft.beats,
      bpm,
    }) / 1000,
  );
  const commitSeconds = () => {
    if (!isHeld) onCommit(draft);
  };
  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h4 id={titleId} className={styles.sectionTitle}>
        {t("vj:shuffle.every")}
      </h4>
      <div className={styles.pair} role="group" aria-labelledby={titleId}>
        {VJ_SHUFFLE_INTERVAL_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            className={styles.chip}
            aria-pressed={draft.kind === kind}
            aria-disabled={isHeld}
            onClick={() => {
              if (!isHeld && draft.kind !== kind) onCommit({ ...draft, kind });
            }}
          >
            {t(KIND_LABEL_KEY[kind])}
          </button>
        ))}
      </div>
      <Collapse isOpen={draft.kind === "seconds"}>
        <div className={styles.sliderRow}>
          <input
            id={sliderId}
            type="range"
            className={styles.slider}
            min={VJ_LIMITS.shuffleSecondsMin}
            max={VJ_LIMITS.shuffleSecondsMax}
            step={1}
            value={draft.seconds}
            aria-label={t("vj:shuffle.seconds")}
            aria-valuetext={t("vj:shuffle.secondsValue", {
              count: draft.seconds,
            })}
            aria-disabled={isHeld}
            onChange={(event) => {
              if (!isHeld) {
                onDraft({ ...draft, seconds: Number(event.target.value) });
              }
            }}
            onPointerUp={commitSeconds}
            onKeyUp={commitSeconds}
            onBlur={commitSeconds}
          />
          <output htmlFor={sliderId} className={styles.sliderValue}>
            {t("vj:shuffle.secondsValue", { count: draft.seconds })}
          </output>
        </div>
      </Collapse>
      <Collapse isOpen={draft.kind === "beats"}>
        <div className={styles.section}>
          <div className={styles.chips} role="group" aria-labelledby={titleId}>
            {VJ_SHUFFLE_BEAT_COUNTS.map((beatCount) => (
              <button
                key={beatCount}
                type="button"
                className={styles.chip}
                aria-pressed={draft.beats === beatCount}
                aria-disabled={isHeld}
                onClick={() => {
                  if (!isHeld && draft.beats !== beatCount) {
                    onCommit({ ...draft, beats: beatCount });
                  }
                }}
              >
                {t("vj:shuffle.beatsValue", { count: beatCount })}
              </button>
            ))}
          </div>
          <p className={styles.hint}>
            {t("vj:shuffle.beatsInSeconds", {
              beats: draft.beats,
              bpm,
              seconds: beatsSeconds,
            })}
          </p>
        </div>
      </Collapse>
    </section>
  );
}

/** The tempo: a number field from 60 to 200 and tap tempo. */
function VjShuffleTempo({
  bpm,
  isHeld,
  onBpm,
}: {
  bpm: number;
  isHeld: boolean;
  onBpm: (bpm: number) => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const inputId = useId();
  const errorId = useId();
  const [draft, setDraft] = useState(String(bpm));
  const [isOutOfRange, setIsOutOfRange] = useState(false);
  const [syncedBpm, setSyncedBpm] = useState(bpm);

  // A tempo set elsewhere (another remote, or this one's echo) shows here.
  if (syncedBpm !== bpm) {
    setSyncedBpm(bpm);
    setDraft(String(bpm));
    setIsOutOfRange(false);
  }

  const commit = () => {
    const parsed = parseVjBpm(draft);
    if (parsed === null) {
      setIsOutOfRange(true);
      return;
    }
    setIsOutOfRange(false);
    setDraft(String(parsed));
    if (!isHeld && parsed !== bpm) onBpm(parsed);
  };

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h4 id={titleId} className={styles.sectionTitle}>
        {t("vj:shuffle.tempo")}
      </h4>
      <div className={styles.tempoRow}>
        <form
          className={styles.tempoField}
          onSubmit={(event) => {
            event.preventDefault();
            commit();
          }}
        >
          <label htmlFor={inputId} className={styles.hint}>
            {t("vj:shuffle.bpmLabel")}
          </label>
          <input
            id={inputId}
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            className={styles.input}
            value={draft}
            aria-invalid={isOutOfRange}
            aria-describedby={isOutOfRange ? errorId : undefined}
            onChange={(event) => {
              setDraft(event.target.value);
              setIsOutOfRange(false);
            }}
            onBlur={commit}
          />
        </form>
        <VjTapTempoButton
          isBlocked={isHeld}
          onTempo={(tappedBpm) => {
            setDraft(String(tappedBpm));
            setIsOutOfRange(false);
            onBpm(tappedBpm);
          }}
        />
      </div>
      <Collapse isOpen={isOutOfRange}>
        <p id={errorId} role="alert" className={styles.alert}>
          {t("vj:shuffle.bpmOutOfRange")}
        </p>
      </Collapse>
      <p className={styles.hint}>{t("vj:shuffle.tapHint")}</p>
    </section>
  );
}

/**
 * The Shuffle sheet: Start or Stop shuffle, the interval in seconds or beats,
 * and the tempo (typed or tapped).
 */
export function VjShuffleSheet({
  shuffle,
  run,
  isBlocked,
  onClose,
}: {
  shuffle: VjShuffle;
  run: VjRun;
  isBlocked: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const darkDialogRef = useQuizshowDarkDialog();
  const [draft, setDraft] = useState(() => draftOf(shuffle));
  const intervalSignature = `${shuffle.intervalKind}:${shuffle.intervalValue}`;
  const [syncedSignature, setSyncedSignature] = useState(intervalSignature);
  /** The last interval sent, and the stage interval it was sent over. */
  const lastSentRef = useRef<{
    overSignature: string;
    kind: VjShuffleIntervalKind;
    value: number;
  } | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  // Another remote or the echo changed the interval, or a send was refused:
  // the picker follows the stage and keeps the value it holds for the other kind.
  if (syncedSignature !== intervalSignature) {
    setSyncedSignature(intervalSignature);
    setDraft((current) =>
      shuffle.intervalKind === "seconds"
        ? { ...current, kind: "seconds", seconds: shuffle.intervalValue }
        : { ...current, kind: "beats", beats: shuffle.intervalValue },
    );
  }

  const noteOutcome = (outcome: VjCommandOutcome) => {
    setErrorKey(outcome.ok ? null : outcome.errorKey);
  };

  /** Sends the picked interval once: nothing when the stage already holds
   *  it, or when the same value is still on its way. */
  const sendInterval = (nextDraft: VjShuffleDraft) => {
    setDraft(nextDraft);
    const value = intervalValueOf(nextDraft);
    const isStageValue =
      nextDraft.kind === shuffle.intervalKind &&
      value === shuffle.intervalValue;
    const lastSent = lastSentRef.current;
    const isAlreadySent =
      lastSent !== null &&
      lastSent.overSignature === intervalSignature &&
      lastSent.kind === nextDraft.kind &&
      lastSent.value === value;
    if (isStageValue || isAlreadySent) return;
    lastSentRef.current = {
      overSignature: intervalSignature,
      kind: nextDraft.kind,
      value,
    };
    void run("setShuffle", {
      intervalKind: nextDraft.kind,
      intervalValue: value,
    }).then((outcome) => {
      noteOutcome(outcome);
      if (outcome.ok) return;
      // Refused or lost: the picker goes back to what the stage holds, and
      // the same choice can be sent again.
      lastSentRef.current = null;
      setSyncedSignature(RESYNC_SIGNATURE);
    });
  };

  const toggleShuffle = async () => {
    if (isBlocked || isSwitching) return;
    setIsSwitching(true);
    const outcome = await run(
      "setShuffle",
      shuffle.isOn
        ? { isOn: false }
        : {
            isOn: true,
            intervalKind: draft.kind,
            intervalValue: intervalValueOf(draft),
          },
    );
    setIsSwitching(false);
    noteOutcome(outcome);
  };

  return (
    <Modal
      title={t("vj:shuffle.title")}
      className={styles.sheet}
      onClose={onClose}
      footer={
        <div className={styles.footer}>
          <Button variant="stage-ghost" onClick={onClose}>
            {t("vj:shuffle.close")}
          </Button>
        </div>
      }
    >
      <div className={styles.body} ref={darkDialogRef}>
        <div className={styles.actions}>
          <Button
            variant={shuffle.isOn ? "stage-ghost" : "stage"}
            className={styles.actionButton}
            aria-disabled={isBlocked || isSwitching}
            onClick={() => void toggleShuffle()}
          >
            {t(shuffle.isOn ? "vj:shuffle.stop" : "vj:shuffle.start")}
          </Button>
          <div role="status">
            <Collapse isOpen={shuffle.isOn}>
              <p className={styles.hint}>{t("vj:shuffle.isOn")}</p>
            </Collapse>
          </div>
        </div>
        <VjShuffleInterval
          draft={draft}
          bpm={shuffle.bpm}
          isHeld={isBlocked}
          onDraft={setDraft}
          onCommit={sendInterval}
        />
        <VjShuffleTempo
          bpm={shuffle.bpm}
          isHeld={isBlocked}
          onBpm={(bpm) => {
            void run("setShuffle", { bpm }).then(noteOutcome);
          }}
        />
        <VjSheetAlert errorKey={errorKey} />
      </div>
    </Modal>
  );
}
