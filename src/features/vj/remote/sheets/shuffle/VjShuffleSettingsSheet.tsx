import { useId, useRef, useState } from "react";
import { FiSkipForward } from "react-icons/fi";
import { Button, Collapse } from "../../../../../shared/components/ui";
import {
  VJ_LIMITS,
  VJ_SHUFFLE_BEAT_COUNTS,
  VJ_SHUFFLE_INTERVAL_KINDS,
  VJ_SHUFFLE_SOURCES,
  vjShuffleIntervalMs,
  type VjClipDTO,
  type VjShuffle,
  type VjShuffleIntervalKind,
  type VjShuffleSource,
  type VjTempo,
} from "../../../../../shared/contracts/vj";
import type { TranslateOptions } from "../../../../../shared/i18n/types";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type {
  VjCommandOutcome,
  VjStageCommands,
} from "../../../live/vjStageCommands";
import { VJ_SOCKET_REASON_KEY } from "../../../vjErrors";
import { VjSheetFrame } from "../../kit/VjSheetFrame";
import type { useVjCommandRunner } from "../../useVjCommandRunner";
import { VjSheetAlert } from "../../VjSheetAlert";
import { VjShuffleExclusions } from "./VjShuffleExclusions";
import styles from "./VjShuffleSheetV2.module.css";

export type VjRun = ReturnType<typeof useVjCommandRunner>["run"];

/** Never a real interval signature, so the next render re-reads the stage's interval. */
const RESYNC_SIGNATURE = "";

const KIND_LABEL_KEY: Record<VjShuffleIntervalKind, string> = {
  seconds: "vj:shuffle.seconds",
  beats: "vj:shuffle.beats",
};

const SOURCE_LABEL_KEY: Record<VjShuffleSource, string> = {
  pack: "vj:shuffle.sourcePack",
  favorites: "vj:shuffle.sourceFavorites",
};

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

/** One decimal at most: 7.74 gives 7.7, 8 gives 8. */
function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * The interval picker's draft: it follows the stage (another remote, the
 * echo, a refusal) and sends a picked interval once, skipping a value the
 * stage already holds or one still on its way.
 */
function useVjShuffleIntervalDraft(
  shuffle: VjShuffle,
  send: (
    patch: Pick<VjShuffle, "intervalKind" | "intervalValue">,
  ) => Promise<VjCommandOutcome>,
) {
  const [draft, setDraft] = useState(() => draftOf(shuffle));
  const intervalSignature = `${shuffle.intervalKind}:${shuffle.intervalValue}`;
  const [syncedSignature, setSyncedSignature] = useState(intervalSignature);
  const lastSentRef = useRef<{
    overSignature: string;
    kind: VjShuffleIntervalKind;
    value: number;
  } | null>(null);

  // The picker keeps the value it holds for the other kind.
  if (syncedSignature !== intervalSignature) {
    setSyncedSignature(intervalSignature);
    setDraft((current) =>
      shuffle.intervalKind === "seconds"
        ? { ...current, kind: "seconds", seconds: shuffle.intervalValue }
        : { ...current, kind: "beats", beats: shuffle.intervalValue },
    );
  }

  const commit = (nextDraft: VjShuffleDraft) => {
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
    void send({ intervalKind: nextDraft.kind, intervalValue: value }).then(
      (outcome) => {
        if (outcome.ok) return;
        // Refused or lost: back to what the stage holds, sendable again.
        lastSentRef.current = null;
        setSyncedSignature(RESYNC_SIGNATURE);
      },
    );
  };

  return { draft, setDraft, commit };
}

/** Change clip every: the Seconds and Beats pair, then the slider or the
 *  beat chips with their length in seconds at the dock's tempo. */
function VjShuffleInterval({
  shuffle,
  tempo,
  draft,
  isHeld,
  onDraft,
  onCommit,
}: {
  shuffle: VjShuffle;
  tempo: VjTempo;
  draft: VjShuffleDraft;
  isHeld: boolean;
  onDraft: (draft: VjShuffleDraft) => void;
  onCommit: (draft: VjShuffleDraft) => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const sliderId = useId();
  const beatsSeconds = roundToTenth(
    vjShuffleIntervalMs(
      { ...shuffle, intervalKind: "beats", intervalValue: draft.beats },
      tempo,
    ) / 1000,
  );
  const commitSeconds = () => {
    if (!isHeld) onCommit(draft);
  };
  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.sectionTitle}>
        {t("vj:shuffle.every")}
      </h3>
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
          <p className={styles.hint} data-vj-shuffle-beats-seconds="">
            {t("vj:shuffle.beatsInSeconds", {
              beats: draft.beats,
              bpm: tempo.bpm,
              seconds: beatsSeconds,
            })}
          </p>
          <p className={styles.hint}>
            {t("vj:shuffle.tempoFromDock", { bpm: tempo.bpm })}
          </p>
        </div>
      </Collapse>
    </section>
  );
}

/** Play from: the pack or its favorites. Favorites holds itself, and says
 *  why, while the pack has none (or no pack is active). */
function VjShuffleSourcePicker({
  source,
  packClips,
  activePackId,
  isHeld,
  onPick,
}: {
  source: VjShuffleSource;
  packClips: readonly VjClipDTO[];
  activePackId: string | null;
  isHeld: boolean;
  onPick: (source: VjShuffleSource) => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const hintId = useId();
  const hasFavorites = packClips.some((clip) => clip.isFavorite);
  const favoritesHintKey =
    activePackId === null
      ? VJ_SOCKET_REASON_KEY.vj_no_active_pack
      : hasFavorites
        ? null
        : "vj:shuffle.noFavorites";
  const [shownHintKey, setShownHintKey] = useState(favoritesHintKey);
  if (favoritesHintKey !== null && favoritesHintKey !== shownHintKey) {
    setShownHintKey(favoritesHintKey);
  }
  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.sectionTitle}>
        {t("vj:shuffle.source")}
      </h3>
      <div className={styles.pair} role="group" aria-labelledby={titleId}>
        {VJ_SHUFFLE_SOURCES.map((option) => {
          const isUnavailable =
            option === "favorites" && favoritesHintKey !== null;
          const isOptionHeld = isHeld || isUnavailable;
          return (
            <button
              key={option}
              type="button"
              className={styles.chip}
              aria-pressed={source === option}
              aria-disabled={isOptionHeld}
              aria-describedby={isUnavailable ? hintId : undefined}
              onClick={() => {
                if (!isOptionHeld && source !== option) onPick(option);
              }}
            >
              {t(SOURCE_LABEL_KEY[option])}
            </button>
          );
        })}
      </div>
      <Collapse isOpen={favoritesHintKey !== null}>
        <p id={hintId} className={styles.hint}>
          {shownHintKey === null ? "" : t(shownHintKey)}
        </p>
      </Collapse>
    </section>
  );
}

/** Next up: the lead screen's shuffle pick, and Skip to play it now. */
function VjShuffleNextUp({
  nextClipId,
  packClips,
  isHeld,
  onSkip,
}: {
  nextClipId: string | null;
  packClips: readonly VjClipDTO[];
  isHeld: boolean;
  onSkip: (clipId: string) => void;
}) {
  const { t } = useTranslation();
  const [shownClipId, setShownClipId] = useState(nextClipId);
  if (nextClipId !== null && nextClipId !== shownClipId) {
    setShownClipId(nextClipId);
  }
  const shownClip = packClips.find((clip) => clip.id === shownClipId) ?? null;
  return (
    <Collapse isOpen={nextClipId !== null}>
      <div className={styles.nextUp} data-vj-shuffle-next-up="">
        <Collapse isOpen={shownClip !== null}>
          <p className={styles.nextLine}>
            <span className={styles.nextLabel}>{t("vj:mirror.next")}</span>
            <span className={styles.nextTitle}>
              {t("vj:mirror.nextShuffle", { title: shownClip?.title ?? "" })}
            </span>
          </p>
        </Collapse>
        <Button
          variant="stage-ghost"
          className={styles.actionButton}
          aria-disabled={isHeld}
          onClick={() => {
            if (!isHeld && nextClipId !== null) onSkip(nextClipId);
          }}
        >
          <FiSkipForward aria-hidden fill="none" />
          {t("vj:mirror.skip")}
        </Button>
      </div>
    </Collapse>
  );
}

interface VjSheetAlertLine {
  key: string | null;
  values?: TranslateOptions;
}

export interface VjShuffleSettingsSheetProps {
  /** `stage.latestState.shuffle`. */
  shuffle: VjShuffle;
  /** `stage.latestState.tempo`: beats count at the dock's tempo. */
  tempo: VjTempo;
  /** The active pack's clips, in pack order. */
  packClips: readonly VjClipDTO[];
  /** `stage.latestState.activePackId`: leaving clips out needs one. */
  activePackId: string | null;
  /** The lead screen's `VjScreenStatus.nextClipId`; null while shuffle is off. */
  leadNextClipId: string | null;
  run: VjRun;
  isBlocked: boolean;
  onClose: () => void;
}

/**
 * The Shuffle sheet: Start or Stop shuffle, what plays next and Skip, the
 * interval in seconds or beats, the source (pack or favorites) and the clips
 * left out. Every send goes through `run` and a refusal names its reason.
 */
export function VjShuffleSettingsSheet({
  shuffle,
  tempo,
  packClips,
  activePackId,
  leadNextClipId,
  run,
  isBlocked,
  onClose,
}: VjShuffleSettingsSheetProps) {
  const { t } = useTranslation();
  const [isSwitching, setIsSwitching] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [alertLine, setAlertLine] = useState<VjSheetAlertLine>({ key: null });

  const noteOutcome = (outcome: VjCommandOutcome) => {
    setAlertLine(
      outcome.ok
        ? { key: null }
        : { key: outcome.errorKey, values: { ...outcome.errorValues } },
    );
    return outcome;
  };

  const sendShuffle = (patch: Parameters<VjStageCommands["setShuffle"]>[0]) =>
    run("setShuffle", patch).then(noteOutcome);

  const interval = useVjShuffleIntervalDraft(shuffle, sendShuffle);

  const toggleShuffle = async () => {
    if (isBlocked || isSwitching) return;
    setIsSwitching(true);
    await sendShuffle(
      shuffle.isOn
        ? { isOn: false }
        : {
            isOn: true,
            intervalKind: interval.draft.kind,
            intervalValue: intervalValueOf(interval.draft),
          },
    );
    setIsSwitching(false);
  };

  const skipToClip = async (clipId: string) => {
    if (isBlocked || isSkipping) return;
    setIsSkipping(true);
    noteOutcome(await run("goClip", clipId));
    setIsSkipping(false);
  };

  return (
    <VjSheetFrame
      title={t("vj:shuffle.title")}
      intro={t("vj:shuffle.intro")}
      closeLabel={t("vj:shuffle.close")}
      onClose={onClose}
    >
      <div className={styles.sheetBody} data-vj-shuffle-sheet="">
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
          <VjShuffleNextUp
            nextClipId={shuffle.isOn ? leadNextClipId : null}
            packClips={packClips}
            isHeld={isBlocked || isSkipping}
            onSkip={(clipId) => void skipToClip(clipId)}
          />
        </div>
        <VjSheetAlert errorKey={alertLine.key} values={alertLine.values} />
        <VjShuffleInterval
          shuffle={shuffle}
          tempo={tempo}
          draft={interval.draft}
          isHeld={isBlocked}
          onDraft={interval.setDraft}
          onCommit={interval.commit}
        />
        <VjShuffleSourcePicker
          source={shuffle.source}
          packClips={packClips}
          activePackId={activePackId}
          isHeld={isBlocked}
          onPick={(source) => void sendShuffle({ source })}
        />
        <VjShuffleExclusions
          packClips={packClips}
          excludedClipIds={shuffle.excludedClipIds}
          activePackId={activePackId}
          isBlocked={isBlocked}
          onSend={(excludedClipIds) => sendShuffle({ excludedClipIds })}
        />
      </div>
    </VjSheetFrame>
  );
}
