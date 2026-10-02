import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { itemDrawerSaveState, type SaveState } from "./itemDrawerSave";
import styles from "./ItemDrawerFooter.module.css";

/** The status line when nothing required is missing. */
const STATUS_KEY: Record<Exclude<SaveState, "blocked">, string> = {
  dirty: "subprofiles:itemDrawer.status.dirty",
  clean: "subprofiles:itemDrawer.status.clean",
};

/** `⌘` on Apple keyboards, `Ctrl` everywhere else. */
function isApplePlatform(): boolean {
  return /mac|iphone|ipad|ipod/i.test(
    typeof navigator === "undefined" ? "" : navigator.userAgent,
  );
}

/**
 * The drawer's footer: a live line saying why Save is (or isn't) ready, then
 * Cancel and Save. Save used to sit enabled with nothing changed and go
 * silently grey with no title, leaving people to guess; now the reason is
 * always on screen beside it. The drawer wires `⌘/Ctrl + Enter` to the same
 * save (`itemDrawerSaveState`); this only shows the hint.
 */
export function ItemDrawerFooter({
  isNew,
  isDirty,
  missingRequiredKey,
  onCancel,
  onSave,
}: {
  isNew: boolean;
  isDirty: boolean;
  /** The "add a … to save" line when a required field is empty, else null. */
  missingRequiredKey: string | null;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  const saveState = itemDrawerSaveState({
    isNew,
    isDirty,
    isMissingRequired: missingRequiredKey !== null,
  });
  const canSave = saveState === "dirty";
  const statusKey =
    missingRequiredKey ??
    (isNew
      ? "subprofiles:itemDrawer.status.new"
      : STATUS_KEY[saveState === "clean" ? "clean" : "dirty"]);
  const shortcut = isApplePlatform() ? "⌘ Enter" : "Ctrl Enter";

  return (
    <div className="drawer-foot">
      <p className={styles.status} data-state={saveState} aria-live="polite">
        <span className={styles.dot} aria-hidden />
        {t(statusKey)}
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onCancel}>
          {t("subprofiles:itemDrawer.cancel")}
        </Button>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={!canSave}
          aria-keyshortcuts="Meta+Enter Control+Enter"
        >
          {t(
            isNew
              ? "subprofiles:itemDrawer.saveNew"
              : "subprofiles:itemDrawer.saveChanges",
          )}
          {canSave && (
            <kbd className={styles.shortcut} aria-hidden>
              {shortcut}
            </kbd>
          )}
        </Button>
      </div>
    </div>
  );
}
