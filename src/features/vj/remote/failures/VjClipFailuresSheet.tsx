import { useRef, type JSX, type Ref } from "react";
import { AnimatePresence } from "motion/react";
import { Collapse } from "../../../../shared/components/ui";
import { CollapseListItem } from "../../../../shared/components/ui/CollapseListItem";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VjSheetFrame } from "../kit/VjSheetFrame";
import sheetStyles from "../VjSheets.module.css";
import { vjFailureReasonKeyOf, type VjFailedClip } from "./vjClipFailures";
import styles from "./VjClipFailures.module.css";

/** One failed clip: its thumbnail, its title and the reason with the fix. */
function VjClipFailureRow({
  failedClip,
  isFocused,
  rowRef,
}: {
  failedClip: VjFailedClip;
  isFocused: boolean;
  rowRef?: Ref<HTMLDivElement>;
}): JSX.Element {
  const { t } = useTranslation();
  const { clip, failure } = failedClip;
  return (
    <div
      ref={rowRef}
      className={styles.row}
      tabIndex={isFocused ? -1 : undefined}
      data-focused={isFocused ? "true" : undefined}
      data-vj-failed-clip={clip.id}
    >
      <img
        className={styles.rowThumbnail}
        src={clip.thumbnailUrl}
        alt=""
        width={clip.width}
        height={clip.height}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <div className={styles.rowText}>
        <p className={styles.rowTitle}>{clip.title}</p>
        <p className={styles.rowReason} data-vj-failure-reason="">
          {t(vjFailureReasonKeyOf(failure))}
        </p>
      </div>
    </div>
  );
}

export interface VjClipFailuresSheetProps {
  failedClips: readonly VjFailedClip[];
  /** The clip whose badge opened the sheet: its row takes the focus. */
  focusClipId: string | null;
  onClose: () => void;
}

/**
 * Clips that couldn't load: every clip of the shown pack a screen could not
 * load, in pack order, each with the reason and what to do about it. Opened
 * from a tile's badge, the sheet lands on that clip's row. Rows fold away as
 * the screens recover the clips, and a line says so once none is left.
 */
export function VjClipFailuresSheet({
  failedClips,
  focusClipId,
  onClose,
}: VjClipFailuresSheetProps): JSX.Element {
  const { t } = useTranslation();
  // Left empty (no badge, or the clip recovered), the first control takes focus.
  const focusRowRef = useRef<HTMLDivElement>(null);
  const title = t("vj:remote.failures.title");

  return (
    <VjSheetFrame
      title={title}
      closeLabel={t("vj:remote.failures.close")}
      onClose={onClose}
      initialFocusRef={focusRowRef}
    >
      <p className={sheetStyles.hint}>{t("vj:remote.failures.intro")}</p>
      {/* One flex item for the empty line and the list, so the body's gap
          sits once under the intro while the empty line is folded away. */}
      <div data-vj-failure-list-group="">
        <div role="status">
          <Collapse isOpen={failedClips.length === 0}>
            <p className={styles.emptyLine}>{t("vj:remote.failures.empty")}</p>
          </Collapse>
        </div>
        <ul className={styles.list} aria-label={title}>
          <AnimatePresence initial={false}>
            {failedClips.map((failedClip) => {
              const isFocused = failedClip.clip.id === focusClipId;
              return (
                <CollapseListItem key={failedClip.clip.id}>
                  <VjClipFailureRow
                    failedClip={failedClip}
                    isFocused={isFocused}
                    rowRef={isFocused ? focusRowRef : undefined}
                  />
                </CollapseListItem>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </VjSheetFrame>
  );
}
