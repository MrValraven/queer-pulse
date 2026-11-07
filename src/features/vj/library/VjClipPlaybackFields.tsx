import { AnimatePresence, m } from "motion/react";
import { useId } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { VJ_LOOP_MODES, VJ_SPEEDS } from "../../../shared/contracts/vj";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import {
  Button,
  Collapse,
  SegmentedControl,
} from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { VjReasonLine } from "../VjReasonLine";
import type { VjClipPlaybackDraft } from "./useVjClipPlaybackDraft";
import { VjLoopScrubber } from "./VjLoopScrubber";
import clipStyles from "./VjClips.module.css";
import styles from "./VjClipPlayback.module.css";

const EASE = [0.22, 0.68, 0.16, 1] as const;

function useFade() {
  const { reducedMotion } = useMotionPrefs();
  return reducedMotion ? { duration: 0 } : { duration: 0.15, ease: EASE };
}

/** Edit clip's playback section: the speed the projector starts the clip
 *  at, how it loops, and (for a video) the part of it that loops. */
export function VjClipPlaybackFields({
  clip,
  draft,
}: {
  clip: VjClipDTO;
  draft: VjClipPlaybackDraft;
}) {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <section
      className={`${clipStyles.dialogSection} ${styles.section}`}
      aria-labelledby={headingId}
    >
      <h3 id={headingId} className={clipStyles.sectionHeading}>
        {t("vj:playback.heading")}
      </h3>
      <VjClipSpeedField draft={draft} />
      <VjClipLoopModeField draft={draft} />
      {clip.mediaKind === "gif" ? (
        <p className={clipStyles.sectionNote}>{t("vj:playback.gifLoopNote")}</p>
      ) : (
        <VjClipLoopPointsField clip={clip} draft={draft} />
      )}
    </section>
  );
}

function VjClipSpeedField({ draft }: { draft: VjClipPlaybackDraft }) {
  const { t } = useTranslation();
  const format = useFormat();
  const labelId = useId();

  return (
    <div className={styles.field}>
      <span id={labelId} className={clipStyles.fieldLabel}>
        {t("vj:playback.speedLabel")}
      </span>
      <div className={styles.speedRow}>
        <SegmentedControl
          className={styles.speedControl}
          labelledBy={labelId}
          value={String(draft.speed)}
          onChange={draft.chooseSpeed}
          options={VJ_SPEEDS.map((speed) => ({
            value: String(speed),
            label: t("vj:playback.speedValue", { speed: format.number(speed) }),
          }))}
        />
      </div>
      <p className={clipStyles.fitHint}>{t("vj:playback.speedHint")}</p>
      <VjReasonLine error={draft.speedError} />
    </div>
  );
}

function VjClipLoopModeField({ draft }: { draft: VjClipPlaybackDraft }) {
  const { t } = useTranslation();
  const fade = useFade();
  const labelId = useId();

  return (
    <div className={styles.field}>
      <span id={labelId} className={clipStyles.fieldLabel}>
        {t("vj:playback.loopModeLabel")}
      </span>
      <SegmentedControl
        className={styles.tray}
        labelledBy={labelId}
        value={draft.loopMode}
        onChange={draft.chooseLoopMode}
        options={VJ_LOOP_MODES.map((mode) => ({
          value: mode,
          label: t(`vj:playback.loopMode.${mode}`),
        }))}
      />
      <AnimatePresence mode="wait" initial={false}>
        <m.p
          key={draft.loopMode}
          className={clipStyles.fitHint}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
        >
          {t(`vj:playback.loopModeHint.${draft.loopMode}`)}
        </m.p>
      </AnimatePresence>
      <VjReasonLine error={draft.loopModeError} />
    </div>
  );
}

function VjClipLoopPointsField({
  clip,
  draft,
}: {
  clip: VjClipDTO;
  draft: VjClipPlaybackDraft;
}) {
  const { t } = useTranslation();
  const fade = useFade();
  const labelId = useId();
  const hintId = useId();
  const { span } = draft;
  if (span === null || clip.durationMs === null) return null;
  const hasStoredPoints = clip.loopInMs !== null || clip.loopOutMs !== null;
  const isBusy = draft.isSavingLoop || undefined;

  return (
    <div className={styles.field} role="group" aria-labelledby={labelId}>
      <span id={labelId} className={clipStyles.fieldLabel}>
        {t("vj:playback.loopLabel")}
      </span>
      <VjLoopScrubber
        durationMs={clip.durationMs}
        span={span}
        onMove={draft.moveHandle}
        onRelease={draft.releaseHandle}
        describedBy={hintId}
      />
      <p id={hintId} className={clipStyles.fitHint}>
        {t("vj:playback.loopHint")}
      </p>
      <Collapse isOpen={draft.isLoopChanged || hasStoredPoints}>
        <div className={styles.loopActions}>
          <AnimatePresence initial={false} mode="popLayout">
            {hasStoredPoints && (
              <m.span
                key="whole"
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  aria-disabled={isBusy}
                  onClick={draft.saveWholeClip}
                >
                  {t("vj:playback.wholeClip")}
                </Button>
              </m.span>
            )}
            {draft.isLoopChanged && (
              <m.span
                key="save"
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
              >
                <Button
                  size="sm"
                  aria-disabled={isBusy}
                  onClick={draft.saveLoop}
                >
                  {t("vj:playback.saveLoop")}
                </Button>
              </m.span>
            )}
          </AnimatePresence>
        </div>
      </Collapse>
      <VjReasonLine error={draft.loopError} />
    </div>
  );
}
