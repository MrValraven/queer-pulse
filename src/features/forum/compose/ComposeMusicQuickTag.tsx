import { useId } from "react";
import { FiCheck, FiMusic } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { FUNDING_MUSIC_TAG } from "../funding/funding.data";
import styles from "./ComposeMusicQuickTag.module.css";

/**
 * One press files an open call under music, which also lists it on
 * Studio's open calls page (`/studio/calls` reads Funding calls tagged
 * music). A toggle: pressed again, the tag comes off. With the tags full it
 * stays focusable and says so through aria-disabled.
 */
export function ComposeMusicQuickTag({
  tags,
  maxTags,
  onAdd,
  onRemove,
}: {
  tags: string[];
  maxTags: number;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const { t } = useTranslation();
  const hintId = useId();
  const fullHintId = useId();
  const isOn = tags.includes(FUNDING_MUSIC_TAG);
  const isBlocked = !isOn && tags.length >= maxTags;
  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.chip}
        aria-pressed={isOn}
        aria-disabled={isBlocked || undefined}
        aria-describedby={isBlocked ? fullHintId : hintId}
        onClick={() => {
          if (isOn) onRemove(FUNDING_MUSIC_TAG);
          else if (!isBlocked) onAdd(FUNDING_MUSIC_TAG);
        }}
      >
        {isOn ? <FiCheck aria-hidden /> : <FiMusic aria-hidden />}
        {t("forum:funding.compose.musicQuickTag")}
      </button>
      <Collapse isOpen={!isBlocked}>
        <span id={hintId} className={styles.hint}>
          {t("forum:funding.compose.musicQuickTagHint")}
        </span>
      </Collapse>
      <Collapse isOpen={isBlocked}>
        <span id={fullHintId} className={styles.hint}>
          {t("forum:compose.musicTag.fullHint")}
        </span>
      </Collapse>
    </div>
  );
}
