import { Fragment } from "react";
import { FiArrowRight, FiPlus } from "react-icons/fi";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import {
  isVjShortcutKeyLabelKey,
  VJ_SHORTCUT_ROWS,
  type VjShortcutRow,
} from "../../input/vjKeymap";
import { VjSheetFrame } from "../../kit/VjSheetFrame";
import styles from "./VjMoreSheet.module.css";

/** One key cap: a named key (Shift, Space) is translated, any other prints as is. */
function VjKeyCap({ keyName }: { keyName: string }) {
  const { t } = useTranslation();
  return (
    <kbd className={styles.keyCap}>
      {isVjShortcutKeyLabelKey(keyName) ? t(keyName) : keyName}
    </kbd>
  );
}

/**
 * The chips of one row: keys pressed together sit apart with a plus, and a
 * range runs from the last chip to `rangeEndKey` with an arrow. The icons are
 * decoration; the row's label says what the keys do.
 */
function VjShortcutKeys({ row }: { row: VjShortcutRow }) {
  return (
    <span className={styles.keys}>
      {row.keys.map((keyName, keyIndex) => (
        <Fragment key={keyName}>
          {keyIndex > 0 ? (
            <FiPlus aria-hidden="true" fill="none" className={styles.joiner} />
          ) : null}
          <VjKeyCap keyName={keyName} />
        </Fragment>
      ))}
      {row.rangeEndKey === undefined ? null : (
        <>
          <FiArrowRight
            aria-hidden="true"
            fill="none"
            className={styles.joiner}
          />
          <VjKeyCap keyName={row.rangeEndKey} />
        </>
      )}
    </span>
  );
}

export interface VjShortcutsSheetProps {
  onClose: () => void;
}

/**
 * Keyboard shortcuts: every `VJ_SHORTCUT_ROWS` line as key chips in the first
 * column and what they do in the second, so the list and the keymap can never
 * disagree.
 */
export function VjShortcutsSheet({ onClose }: VjShortcutsSheetProps) {
  const { t } = useTranslation();
  return (
    <VjSheetFrame
      title={t("vj:keys.title")}
      closeLabel={t("vj:keys.close")}
      onClose={onClose}
    >
      <ul className={styles.shortcutList}>
        {VJ_SHORTCUT_ROWS.map((row) => (
          <li key={row.labelKey} className={styles.shortcutRow}>
            <VjShortcutKeys row={row} />
            <span className={styles.shortcutLabel}>{t(row.labelKey)}</span>
          </li>
        ))}
      </ul>
    </VjSheetFrame>
  );
}
