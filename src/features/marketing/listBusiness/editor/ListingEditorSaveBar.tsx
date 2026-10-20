import { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useMediaQuery } from "../../../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { CreatorDraftSaveStatus } from "../../../creatorDrafts/api/useCreatorDraftAutosave";
import { CreatorDraftNotice } from "../../../creatorDrafts/CreatorDraftNotice";
import { creatorDraftSaveStatusText } from "../../../creatorDrafts/creatorDraftSaveStatusText";
import type { MissingField } from "../listBusiness.data";
import { MissingFieldsBar } from "../MissingFieldsBar";
import styles from "./ListingEditor.module.css";

const CLOCK_REFRESH_MS = 30_000;
/** Below this width the team note leaves the sticky bar to keep it compact. */
const NARROW_QUERY = "(max-width: 600px)";

/** The clock "Saved N min ago" reads, re-read every 30 s while saved. */
function useSavedClock(status: CreatorDraftSaveStatus): number {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const savedAt = status.kind === "saved" ? status.savedAt : null;
  const [seenSavedAt, setSeenSavedAt] = useState(savedAt);
  if (savedAt !== seenSavedAt) {
    // A fresh save restarts the clock at its own save time in the same render
    // pass, so its age starts at zero and never from the last interval tick.
    setSeenSavedAt(savedAt);
    if (savedAt !== null) setNowMs(Date.parse(savedAt));
  }
  const isSaved = savedAt !== null;
  useEffect(() => {
    if (!isSaved) return undefined;
    const intervalId = window.setInterval(
      () => setNowMs(Date.now()),
      CLOCK_REFRESH_MS,
    );
    return () => window.clearInterval(intervalId);
  }, [isSaved]);
  return nowMs;
}

/**
 * The editor's action bar: what is still needed, where the draft of the edit
 * stands, a preview of the real page, and save.
 *
 * Sticks to the bottom of the viewport while the form scrolls, so saving is
 * in reach from any field on the page. One quiet line says our team can see
 * the draft: below the row on wide screens, and in the normal flow just above
 * the bar on narrow ones so the bar stays compact.
 */
export function ListingEditorSaveBar({
  missing,
  isDirty,
  isSaving,
  draftStatus,
  onPreview,
  onSave,
}: {
  missing: MissingField[];
  isDirty: boolean;
  isSaving: boolean;
  /** The server draft's save state; idle falls back to the unsaved line. */
  draftStatus: CreatorDraftSaveStatus;
  onPreview: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  const nowMs = useSavedClock(draftStatus);
  const isNarrow = useMediaQuery(NARROW_QUERY);
  const isBlocked = missing.length > 0;
  const draftStateText = creatorDraftSaveStatusText(draftStatus, nowMs, t);

  return (
    <>
      <CreatorDraftNotice
        messageKey="marketing:creatorDraftNote.body"
        isShown={isNarrow}
        className={styles.saveBarNoteFlow}
      />
      <div className={styles.saveBar}>
        <MissingFieldsBar missing={missing} className={styles.saveBarMissing} />
        <div className={styles.saveBarRow}>
          <span className={styles.saveBarState} aria-live="polite">
            {draftStateText ??
              t(
                isDirty
                  ? "marketing:listBusiness.editor.unsavedChanges"
                  : "marketing:listBusiness.editor.noChanges",
              )}
          </span>
          <div className={styles.saveBarActions}>
            <Button variant="ghost" onClick={onPreview}>
              <FiEye aria-hidden />{" "}
              {t("marketing:listBusiness.editor.previewCta")}
            </Button>
            <Button
              variant="primary"
              onClick={onSave}
              disabled={!isDirty || isBlocked || isSaving}
              title={
                isBlocked
                  ? t("marketing:listBusiness.paneActions.blockedTitle")
                  : undefined
              }
            >
              {t("marketing:listBusiness.edit.saveCta")}
            </Button>
          </div>
        </div>
        <CreatorDraftNotice
          messageKey="marketing:creatorDraftNote.body"
          isShown={!isNarrow}
          className={styles.saveBarNote}
        />
      </div>
    </>
  );
}
