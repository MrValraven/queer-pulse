import { useId } from "react";
import { Modal, Button, Toggle } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  setDeskLetterShortcutsEnabled,
  useDeskLetterShortcutsEnabled,
} from "./deskLetterShortcuts";
import { SHORTCUTS } from "./deskModals.data";
import styles from "./DeskModals.module.css";

/**
 * The desk's keyboard reference, opened with `?`. It also holds the switch
 * that turns the single-key shortcuts off (WCAG 2.1.4), since this sheet is
 * where someone looking at the keys decides whether they want them, and `?`
 * keeps opening it while the rest are off. The list is a `<dl>`: each key is
 * a term and what it does is its description, so a screen reader announces
 * them as pairs.
 */
export function DeskShortcutsSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const isLetterShortcutsEnabled = useDeskLetterShortcutsEnabled();
  const switchId = useId();

  return (
    <Modal
      title={t("magazine:desk.modals.shortcuts.title")}
      onClose={onClose}
      footer={
        <div className={styles.actions}>
          <Button variant="primary" onClick={onClose}>
            {t("magazine:desk.modals.shortcuts.gotIt")}
          </Button>
        </div>
      }
    >
      <div className={styles.shortcutSwitch}>
        <label htmlFor={switchId} className={styles.shortcutSwitchText}>
          <span className={styles.shortcutSwitchTitle}>
            {t("magazine:desk.modals.shortcuts.singleKeySwitch")}
          </span>
          <span className={styles.shortcutSwitchHint}>
            {t("magazine:desk.modals.shortcuts.singleKeySwitchHint")}
          </span>
        </label>
        {/* No `label` prop: the shared `Toggle` would turn it into an
            `aria-label` and hide the hint. The `<label htmlFor>` above names
            the switch with its title and its hint, so both are read out. */}
        <Toggle
          id={switchId}
          checked={isLetterShortcutsEnabled}
          onChange={setDeskLetterShortcutsEnabled}
        />
      </div>
      <dl className={styles.kbdList}>
        {SHORTCUTS.map((shortcut) => {
          const isOff = !isLetterShortcutsEnabled && !shortcut.isAlwaysOn;
          return (
            <div
              key={shortcut.keys}
              className={styles.kbdRow}
              data-off={isOff || undefined}
            >
              <dt className={styles.kbdTerm}>
                <kbd className={styles.kbd}>{shortcut.keys}</kbd>
              </dt>
              <dd className={styles.kbdDesc}>
                {t(shortcut.labelKey)}
                {isOff && (
                  <span className="visuallyHidden">
                    {" "}
                    {t("magazine:desk.modals.shortcuts.offSuffix")}
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </Modal>
  );
}
