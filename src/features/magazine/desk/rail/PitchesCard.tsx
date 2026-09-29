import { FiInbox } from "react-icons/fi";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatRelative } from "../../../../shared/lib/date";
import type { Pitch } from "../../data/desk.data";
import { formattedCountValues } from "../deskHeaderCopy";
import { RailCard } from "./RailCard";
import styles from "./rail.module.css";

/** How many pitches the rail previews before "Triage all" takes over. */
const PREVIEW_PITCH_COUNT = 3;

export interface PitchesCardProps {
  /** Pitches awaiting a verdict, newest first (`usePitches` order). */
  pitches: Pitch[];
  onOpenPitch: (pitch: Pitch) => void;
  onOpenTriage: () => void;
}

/**
 * The newest pitches, so an editor sees what just arrived without leaving the
 * desk. Each row says how long the pitch has waited, through the same
 * relative-time formatter triage uses, so the two read the same age. A row
 * opens triage focused on that pitch; the heading count and the footer open
 * the whole inbox. Commission and pass live in triage, where the pitch's full
 * note is readable, so the rail only previews.
 */
export function PitchesCard({
  pitches,
  onOpenPitch,
  onOpenTriage,
}: PitchesCardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const previewPitches = pitches.slice(0, PREVIEW_PITCH_COUNT);

  return (
    <RailCard
      kind="pitches"
      title={t("magazine:desk.rail.pitches.title")}
      count={pitches.length}
      onCountClick={onOpenTriage}
      countActionLabel={t(
        "magazine:desk.rail.pitches.openTriage",
        formattedCountValues(pitches.length, format.number),
      )}
      countOpensDialog
    >
      {previewPitches.length === 0 ? (
        <p className={styles.emptyNote}>
          {t("magazine:desk.rail.pitches.empty")}
        </p>
      ) : (
        <>
          <ul className={styles.rowList}>
            {previewPitches.map((pitch) => {
              const ageLabel = pitch.receivedAt
                ? formatRelative(pitch.receivedAt, format)
                : "";
              return (
                <li key={pitch.id}>
                  <button
                    type="button"
                    className={styles.rowButton}
                    onClick={() => onOpenPitch(pitch)}
                  >
                    <span className={styles.pitchTitle}>{pitch.title}</span>
                    <span className={styles.pitchMeta}>
                      <span className={styles.pitchByline}>{pitch.byline}</span>
                      {ageLabel ? (
                        <time
                          className={styles.pitchAge}
                          dateTime={pitch.receivedAt}
                        >
                          {ageLabel}
                        </time>
                      ) : null}
                      {pitch.fresh ? (
                        <span className={styles.newVoiceTag}>
                          {t("magazine:desk.rail.pitches.newVoice")}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className={styles.textButton}
            aria-haspopup="dialog"
            onClick={onOpenTriage}
          >
            <FiInbox aria-hidden="true" />
            {t("magazine:desk.rail.pitches.triageAll")}
          </button>
        </>
      )}
    </RailCard>
  );
}
