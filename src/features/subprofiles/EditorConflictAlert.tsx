import { useEffect, useId, useRef, useState } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { PendingChangesList } from "./PendingChangesList";
import { SavebarSummaryToggle } from "./EditorSavebarSummary";
import styles from "./EditorConflictAlert.module.css";

/** The savebar this alert sits in. Save turns off when the conflict lands,
 *  which can drop focus from the button the member just pressed. */
const SAVEBAR_SELECTOR = ".savebar";

/**
 * ENG-451: the inline alert the savebar shows once a save was refused because
 * someone else (a co-owner, or this member in another tab) saved the persona
 * after this editor loaded it. It says what happened, that Reload loads their
 * version, and that the member's unsaved changes here go with it. Reload is
 * the only way on, so when the alert appears (the bar drops its Save row for
 * it, taking the pressed button along), or the bar's contents change, while
 * focus was in the savebar (or already dropped to the page), focus moves to
 * Reload. A failed Reload leaves the editor as
 * it was and adds a line saying so. Renders nothing while there is no
 * conflict, so each savebar layout can simply include it.
 *
 * While conflicted it is the whole savebar at every width: the title, one
 * short line on what Reload does, then a row with the "{count} unsaved"
 * toggle and Reload. The itemized list opens under that row, capped, so the
 * bar stays a small strip over the form the member may want to copy from.
 */
export function EditorConflictAlert() {
  const { t } = useTranslation();
  const {
    hasEditConflict,
    dirty,
    pending,
    reloadLatest,
    isReloading,
    hasReloadFailed,
  } = useSubprofileEditorContext();
  const reloadButtonRef = useRef<HTMLButtonElement>(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const listId = useId();

  useEffect(() => {
    if (!hasEditConflict) return;
    const activeElement = document.activeElement;
    const isFocusInSavebar =
      !activeElement ||
      activeElement === document.body ||
      activeElement.closest(SAVEBAR_SELECTOR) !== null;
    if (isFocusInSavebar) reloadButtonRef.current?.focus();
  }, [hasEditConflict, dirty]);

  if (!hasEditConflict) return null;

  // The itemized list is what the member copies from before Reload clears it,
  // so it stays one tap away without taking the bar's height by default.
  const hasPendingList = dirty && pending.length > 0;

  return (
    <>
      <div className={styles.alert}>
        {/* Only the words are live: the controls below would otherwise be
            read out again whenever the unsaved count moves. */}
        <div className={styles.message} role="alert">
          <FiAlertTriangle className={styles.icon} aria-hidden />
          <p className={styles.title}>{t("subprofiles:editConflict.title")}</p>
          <p className={styles.body}>{t("subprofiles:editConflict.body")}</p>
          {hasReloadFailed && (
            <p className={styles.failed}>
              {t("subprofiles:editConflict.reloadFailed")}
            </p>
          )}
        </div>
        <div className={styles.actions}>
          {hasPendingList && (
            <SavebarSummaryToggle
              count={pending.length}
              isOpen={isListOpen}
              listId={listId}
              onToggle={() => setIsListOpen((isOpen) => !isOpen)}
            />
          )}
          <Button
            ref={reloadButtonRef}
            variant="primary"
            size="sm"
            className={styles.reload}
            // Stays enabled while the refetch runs, so focus never drops to
            // the page; a second press meanwhile is ignored.
            onClick={() => {
              if (!isReloading) reloadLatest();
            }}
            aria-busy={isReloading || undefined}
          >
            <FiRefreshCw aria-hidden />
            {isReloading
              ? t("subprofiles:editConflict.reloading")
              : t("subprofiles:editConflict.reload")}
          </Button>
        </div>
      </div>
      {hasPendingList && (
        <div id={listId} className="savebar-phone-list" hidden={!isListOpen}>
          <PendingChangesList pending={pending} />
        </div>
      )}
    </>
  );
}
