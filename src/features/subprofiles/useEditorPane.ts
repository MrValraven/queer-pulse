import { useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { EditorPaneKey } from "./editorRail.data";

/** Which pane the editor is showing. */
const PANE_PARAM = "pane";
/** Whether the mobile pane picker sheet is open. */
const PICKER_PARAM = "panes";

export interface EditorPaneState {
  activePane: EditorPaneKey;
  /** Ordered pane keys, flattened across the rail groups (prev/next order). */
  paneKeys: EditorPaneKey[];
  /** Switch panes. Pushes history, so Back steps to the previous pane. */
  selectPane: (pane: EditorPaneKey) => void;
  isPickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
}

/**
 * The editor's active pane, held in the URL as `?pane=` rather than in
 * component state — the same idiom the mod-tools console uses for `?mod=`.
 *
 * Three things fall out of that. A pane switch pushes a history entry, so the
 * phone's Back gesture steps back a pane instead of dumping the owner out of
 * the editor mid-edit. A pane survives a refresh. And a pane is linkable.
 *
 * `paneKeys` is the source of truth for what `?pane=` may hold: it comes from
 * the rail groups actually built for THIS persona, whose Content entries depend
 * on `sectionsForKind(kind)`. So a link carrying `?pane=section:shows` opened
 * against a persona with no Shows section falls back to the first pane rather
 * than rendering an empty one.
 *
 * The mobile picker sheet rides the URL too (`?panes=1`, pushed), so Back
 * closes the sheet before it touches the pane history. Picking a pane from the
 * open sheet REPLACES that entry instead of pushing a second one, which keeps
 * one Back press per pane the owner actually visited.
 */
export function useEditorPane(paneKeys: EditorPaneKey[]): EditorPaneState {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // Whether THIS session pushed the open-sheet entry. False when the sheet is
  // open because the owner arrived on a URL that already carried `?panes=1`,
  // where `navigate(-1)` would leave the editor rather than close the sheet.
  const didPushPickerRef = useRef(false);

  const requestedPane = searchParams.get(PANE_PARAM);
  const isKnownPane = (value: string | null): value is EditorPaneKey =>
    value !== null && (paneKeys as string[]).includes(value);
  const activePane = isKnownPane(requestedPane)
    ? requestedPane
    : (paneKeys[0] ?? "identity");

  const isPickerOpen = searchParams.get(PICKER_PARAM) === "1";

  const selectPane = useCallback(
    (pane: EditorPaneKey) => {
      // From the open sheet: swap the sheet's own entry for the pane's, so the
      // owner doesn't press Back twice to undo one choice. From the prev/next
      // arrows (sheet closed): push, so each pane is its own Back step.
      const isReplacingPicker = isPickerOpen;
      if (isReplacingPicker) didPushPickerRef.current = false;
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          next.set(PANE_PARAM, pane);
          next.delete(PICKER_PARAM);
          return next;
        },
        { replace: isReplacingPicker },
      );
    },
    [isPickerOpen, setSearchParams],
  );

  const openPicker = useCallback(() => {
    didPushPickerRef.current = true;
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set(PICKER_PARAM, "1");
      return next;
    });
  }, [setSearchParams]);

  const closePicker = useCallback(() => {
    // Scrim tap, drag-down, Escape and the close button all land here. Undoing
    // our own pushed entry keeps the history clean; a sheet we never pushed is
    // closed by rewriting the URL in place instead.
    if (didPushPickerRef.current) {
      didPushPickerRef.current = false;
      void navigate(-1);
      return;
    }
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete(PICKER_PARAM);
        return next;
      },
      { replace: true },
    );
  }, [navigate, setSearchParams]);

  return {
    activePane,
    paneKeys,
    selectPane,
    isPickerOpen,
    openPicker,
    closePicker,
  };
}
