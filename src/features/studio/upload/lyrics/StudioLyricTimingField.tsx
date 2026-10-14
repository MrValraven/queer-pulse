import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiClock } from "react-icons/fi";
import { Button, Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { StudioSyncedLyricView } from "../../api/studio.adapters";
import { StudioLyricTimingDialog } from "./StudioLyricTimingDialog";
import { doTimingsMatchLyrics, lyricLinesOf } from "./studioLrc";
import type { TimingAudioSource } from "./useTimingAudio";
import styles from "./StudioLyricTiming.module.css";

export type { TimingAudioSource } from "./useTimingAudio";

/** Under the lyrics field: add, edit or clear the line timings. */
export function StudioLyricTimingField({
  lyrics,
  syncedLyrics,
  audioSource,
  onChange,
  isTimingStale,
}: {
  lyrics: string;
  syncedLyrics: readonly StudioSyncedLyricView[] | null;
  audioSource: TimingAudioSource;
  onChange: (lines: StudioSyncedLyricView[] | null) => void;
  /** The parent's own save rule, when it knows whether the lyrics were
   *  touched (untouched empty lyrics keep their timings on save). */
  isTimingStale?: boolean;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const timedCount =
    syncedLyrics?.filter((line) => line.text.trim()).length ?? 0;
  const hasTimings = timedCount > 0;
  // Cleared lyrics over stored timings also clear the timings on save.
  const isStale =
    isTimingStale ??
    (hasTimings && !doTimingsMatchLyrics(syncedLyrics ?? [], lyrics));
  return (
    <div className={styles.field}>
      <div className={styles.fieldRow}>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
          <FiClock aria-hidden />{" "}
          {hasTimings
            ? t("studio:lyricTiming.editCta")
            : t("studio:lyricTiming.addCta")}
        </Button>
      </div>
      <Collapse isOpen={hasTimings}>
        <div className={styles.fieldRow}>
          <span className={styles.summary}>
            {t("studio:lyricTiming.summary", { count: timedCount })}
          </span>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => onChange(null)}
          >
            {t("studio:lyricTiming.clearCta")}
          </button>
        </div>
      </Collapse>
      <Collapse isOpen={isStale}>
        <p className={styles.warning} role="alert">
          {t("studio:lyricTiming.mismatch")}
        </p>
      </Collapse>
      <AnimatePresence>
        {isOpen && (
          <StudioLyricTimingDialog
            key="timing"
            lyricLines={lyricLinesOf(lyrics)}
            initial={syncedLyrics}
            audioSource={audioSource}
            onSave={(lines) => {
              onChange(lines);
              setIsOpen(false);
            }}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
