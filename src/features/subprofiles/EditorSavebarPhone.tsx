import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { PendingChangesList } from "./PendingChangesList";
import { SavebarSummaryToggle } from "./EditorSavebarSummary";

/** Where focus goes when this bar leaves the page (a Save or Discard just
 *  cleaned the editor): the pane switcher's centre button, the one control
 *  that is always on screen at this width (`EditorPaneSwitcher`). */
const FOCUS_FALLBACK_SELECTOR = ".ed-switch-current";

/**
 * The phone savebar: ONE compact row, "{count} unsaved" with a chevron, then
 * Discard, then Save. The toggle opens the itemized list in a panel under the
 * row (the bar is pinned to the bottom, so it grows upward). Preview lives in
 * the pane switcher at this width (`EditorSwitchPreviewButton`), and the idle
 * bar is not rendered at all (`EditorSavebar`), so this only mounts while
 * there is something to save.
 *
 * The list starts collapsed on every mount, and the bar unmounts as soon as
 * the editor is clean, so it can never grow on its own mid-typing.
 */
export function EditorSavebarPhone({
  style,
  blockReasonKey,
}: {
  style: CSSProperties | undefined;
  blockReasonKey: string | null;
}) {
  const { t } = useTranslation();
  const { pending, saving, canSave, saveAll, discardAll } =
    useSubprofileEditorContext();
  const [isListOpen, setIsListOpen] = useState(false);
  const listId = useId();

  // Save and Discard both end with this bar unmounting under the finger that
  // pressed them, which drops keyboard and screen reader focus on <body>.
  // Remember that the owner was working in the bar, and on the way out hand
  // focus to the switcher so the next Tab starts from the top of the editor.
  const hasOwnerUsedBarRef = useRef(false);
  useEffect(
    () => () => {
      if (!hasOwnerUsedBarRef.current) return;
      const activeElement = document.activeElement;
      if (activeElement && activeElement !== document.body) return;
      document
        .querySelector<HTMLElement>(FOCUS_FALLBACK_SELECTOR)
        ?.focus({ preventScroll: true });
    },
    [],
  );
  const markBarUsed = () => {
    hasOwnerUsedBarRef.current = true;
  };

  return (
    <div
      className="savebar savebar-phone"
      style={style}
      onFocus={markBarUsed}
      onPointerDown={markBarUsed}
    >
      {blockReasonKey && (
        <span className="savebar-block" role="status">
          {t(blockReasonKey)}
        </span>
      )}
      <div className="savebar-phone-row">
        <SavebarSummaryToggle
          count={pending.length}
          isOpen={isListOpen}
          listId={listId}
          onToggle={() => setIsListOpen((isOpen) => !isOpen)}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={discardAll}
          disabled={saving}
        >
          {t("subprofiles:pending.compactDiscard")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => void saveAll()}
          disabled={saving || !canSave}
        >
          {saving
            ? t("subprofiles:pending.saving")
            : t("subprofiles:pending.compactSave")}
        </Button>
      </div>
      <div id={listId} className="savebar-phone-list" hidden={!isListOpen}>
        <PendingChangesList pending={pending} />
      </div>
    </div>
  );
}
