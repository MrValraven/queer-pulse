import { useId, useMemo, useRef, useState } from "react";
import { Button, Modal, tabPanelProps } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { StudioSyncedLyricView } from "../../api/studio.adapters";
import { StudioTablist } from "../../StudioTablist";
import { StudioLrcPastePane } from "./StudioLrcPastePane";
import { parseLrc, toLrc } from "./studioLrc";
import { StudioTapAlongPane } from "./StudioTapAlongPane";
import { tapLimitProblemOf, useTapAlong } from "./useTapAlong";
import type { TimingAudioSource } from "./useTimingAudio";
import styles from "./StudioLyricTiming.module.css";

type TimingMode = "tap" | "paste";
const MODES: readonly { id: TimingMode; labelKey: string }[] = [
  { id: "tap", labelKey: "studio:lyricTiming.mode.tap" },
  { id: "paste", labelKey: "studio:lyricTiming.mode.paste" },
];

/** Paste LRC or tap along (spec 8.4). `lyricLines` are the plain lyrics'
 *  non-empty lines; with none, only Paste LRC can time anything. */
export function StudioLyricTimingDialog({
  lyricLines,
  initial,
  audioSource,
  onSave,
  onClose,
}: {
  lyricLines: readonly string[];
  initial: readonly StudioSyncedLyricView[] | null;
  audioSource: TimingAudioSource;
  onSave: (lines: StudioSyncedLyricView[]) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const tabsId = useId();
  const stampButtonRef = useRef<HTMLButtonElement>(null);
  const [mode, setMode] = useState<TimingMode>(
    lyricLines.length > 0 ? "tap" : "paste",
  );
  const [lrcText, setLrcText] = useState(() => (initial ? toLrc(initial) : ""));
  const [isBlockedNoteShown, setIsBlockedNoteShown] = useState(false);
  const parsed = useMemo(() => parseLrc(lrcText), [lrcText]);
  const tap = useTapAlong(lyricLines, initial);
  const limitProblem = useMemo(
    () => tapLimitProblemOf(lyricLines),
    [lyricLines],
  );
  const draft =
    mode === "tap"
      ? limitProblem
        ? null
        : tap.toLines()
      : parsed.lines.length > 0 && !parsed.isOverLimit
        ? parsed.lines
        : null;
  const blockedKey =
    mode === "tap"
      ? "studio:lyricTiming.needAllLines"
      : "studio:lyricTiming.needLines";

  return (
    <Modal
      wide
      title={t("studio:lyricTiming.dialogTitle")}
      sub={t("studio:lyricTiming.dialogSub")}
      onClose={onClose}
      initialFocusRef={mode === "tap" ? stampButtonRef : undefined}
      footer={
        <div className={styles.footer}>
          <p className={styles.warning} role="status">
            {isBlockedNoteShown && !draft ? t(blockedKey) : ""}
          </p>
          <Button variant="ghost" onClick={onClose}>
            {t("studio:lyricTiming.cancelCta")}
          </Button>
          <Button
            aria-disabled={!draft || undefined}
            onClick={() => {
              if (draft) onSave(draft);
              else setIsBlockedNoteShown(true);
            }}
          >
            {t("studio:lyricTiming.saveCta")}
          </Button>
        </div>
      }
    >
      <StudioTablist
        tabs={MODES}
        activeId={mode}
        onChange={setMode}
        idPrefix={tabsId}
        label={t("studio:lyricTiming.modesLabel")}
      />
      <div {...tabPanelProps(tabsId, mode)} className={styles.panel}>
        {mode === "paste" ? (
          <StudioLrcPastePane
            text={lrcText}
            onTextChange={setLrcText}
            result={parsed}
          />
        ) : lyricLines.length === 0 ? (
          <p className={styles.hint}>
            {t("studio:lyricTiming.tap.needsLyrics")}
          </p>
        ) : (
          <StudioTapAlongPane
            lyricLines={lyricLines}
            tap={tap}
            audioSource={audioSource}
            stampButtonRef={stampButtonRef}
            limitProblem={limitProblem}
          />
        )}
      </div>
    </Modal>
  );
}
