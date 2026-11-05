import { Fragment } from "react";
import { FiArrowDown, FiArrowUp, FiCommand, FiDelete } from "react-icons/fi";
import { Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowDarkDialog } from "../builder/useQuizshowDarkDialog";
import {
  STUDIO_HINT_SHORTCUT_IDS,
  STUDIO_SHORTCUTS,
  type StudioShortcut,
  type StudioShortcutKey,
} from "./quizshowStudioShortcuts.data";
import lobbyStyles from "../builder/QuizshowLobby.module.css";
import styles from "./QuizshowStudio.module.css";

/** Apple keyboards print the command key as a symbol; everyone else presses Ctrl. */
function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

/** One key cap. The arrows and Delete draw an icon and say their name to screen readers. */
function QuizshowStudioKey({
  shortcutKey,
}: {
  shortcutKey: StudioShortcutKey;
}) {
  const { t } = useTranslation();
  switch (shortcutKey.kind) {
    case "text":
      return <kbd className={styles.key}>{shortcutKey.text}</kbd>;
    case "command":
      return isApplePlatform() ? (
        <kbd className={styles.key}>
          <FiCommand aria-hidden />
          <span className={styles.visuallyHidden}>
            {t("quizshow:studio.shortcuts.keyCommand")}
          </span>
        </kbd>
      ) : (
        <kbd className={styles.key}>
          {t("quizshow:studio.shortcuts.keyCtrl")}
        </kbd>
      );
    case "delete":
      return (
        <kbd className={styles.key}>
          <FiDelete aria-hidden />
          <span className={styles.visuallyHidden}>
            {t("quizshow:studio.shortcuts.keyDelete")}
          </span>
        </kbd>
      );
    default: {
      const isUp = shortcutKey.kind === "arrowUp";
      const Icon = isUp ? FiArrowUp : FiArrowDown;
      return (
        <kbd className={styles.key}>
          <Icon aria-hidden />
          <span className={styles.visuallyHidden}>
            {t(
              isUp
                ? "quizshow:studio.shortcuts.keyArrowUp"
                : "quizshow:studio.shortcuts.keyArrowDown",
            )}
          </span>
        </kbd>
      );
    }
  }
}

/** A shortcut's keys: pressed together, or (for the arrows) either one. */
function QuizshowStudioKeys({ shortcut }: { shortcut: StudioShortcut }) {
  return (
    <span className={styles.keys}>
      {shortcut.keys.map((shortcutKey, keyIndex) => (
        <Fragment key={`${shortcut.id}-${keyIndex}`}>
          <QuizshowStudioKey shortcutKey={shortcutKey} />
        </Fragment>
      ))}
    </span>
  );
}

/** The `?` sheet: every studio shortcut. Dark, like the studio behind it. */
export function QuizshowStudioShortcutsSheet({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const darkDialogRef = useQuizshowDarkDialog();
  return (
    <Modal
      title={t("quizshow:studio.shortcuts.title")}
      sub={t("quizshow:studio.shortcuts.sub")}
      className={lobbyStyles.stageDialog}
      onClose={onClose}
    >
      <dl className={styles.shortcutList} ref={darkDialogRef}>
        {STUDIO_SHORTCUTS.map((shortcut) => (
          <div key={shortcut.id} className={styles.shortcutRow}>
            <dt className={styles.shortcutName}>{t(shortcut.labelKey)}</dt>
            <dd className={styles.shortcutKeys}>
              <QuizshowStudioKeys shortcut={shortcut} />
            </dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}

/** The one-line strip under the canvas with the main shortcuts (wide screens, where there is a keyboard). */
export function QuizshowStudioHintStrip() {
  const { t } = useTranslation();
  const hints = STUDIO_SHORTCUTS.filter((shortcut) =>
    STUDIO_HINT_SHORTCUT_IDS.includes(shortcut.id),
  );
  return (
    <ul
      className={styles.hints}
      aria-label={t("quizshow:studio.shortcuts.title")}
    >
      {hints.map((shortcut) => (
        <li key={shortcut.id} className={styles.hint} data-hint={shortcut.id}>
          <QuizshowStudioKeys shortcut={shortcut} />
          <span>{t(shortcut.labelKey)}</span>
        </li>
      ))}
    </ul>
  );
}
