import { useEffect, useState, type MouseEvent, type RefObject } from "react";
import { FiBold, FiItalic, FiLink } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./SelectionToolbar.module.css";

export interface SelectionToolbarProps {
  /** The editing surface to watch. The toolbar only appears when the
   * current selection is both non-collapsed AND anchored somewhere inside
   * this element (e.g. the article document, not some unrelated part of the
   * page that also happens to have a text selection). */
  scopeRef: RefObject<HTMLElement | null>;
}

interface ToolbarPosition {
  x: number;
  y: number;
}

// A real "edit this link" UI is future work (Phase 3 ships plain formatting
// only) — createLink needs *some* href to act on, so this is a deliberate
// placeholder the writer can select and retype inside the rendered block.
const PLACEHOLDER_LINK_HREF = "https://";

function findRichAncestor(node: Node | null): HTMLElement | null {
  let current: HTMLElement | null =
    node instanceof HTMLElement ? node : node?.parentElement ?? null;
  while (current && current.getAttribute("data-rich") !== "true") {
    current = current.parentElement;
  }
  return current;
}

/** Renames every `<oldTagName>` inside `root` to `<newTagName>`, preserving
 * children and attributes. `document.execCommand('italic'/'bold')` inserts
 * `<i>`/`<b>`, but the article's typed HTML is meant to carry semantic
 * `<em>`/`<strong>` (readers, exports, and any future rich-text migration
 * all assume that), so every command normalizes its output immediately. */
function replaceTag(root: HTMLElement, oldTagName: string, newTagName: string) {
  root.querySelectorAll(oldTagName).forEach((element) => {
    const replacement = document.createElement(newTagName);
    replacement.innerHTML = element.innerHTML;
    Array.from(element.attributes).forEach((attribute) => {
      replacement.setAttribute(attribute.name, attribute.value);
    });
    element.replaceWith(replacement);
  });
}

/**
 * A floating selection toolbar (Emphasis / Strong / Link), ported from the
 * design prototype's `SelectionTools`. Tracks `document`'s `selectionchange`
 * and positions itself above the selection's bounding rect whenever the
 * selection is non-collapsed and lives inside `scopeRef`.
 *
 * NOTE: `document.execCommand` is a deprecated web-platform API, but for an
 * arbitrary contentEditable selection it's still the only way to toggle
 * inline formatting without shipping a full rich-text engine. This is a
 * deliberate, scoped port of the prototype's approach for Phase 3 — swapping
 * it for something like ProseMirror/Lexical is a future upgrade, not a gap
 * in this task. Every command is followed by re-dispatching a native
 * `input` event on the affected block so `RichText`'s `onChange` (which only
 * listens for `input`) re-reads the mutated innerHTML.
 */
export function SelectionToolbar({ scopeRef }: SelectionToolbarProps) {
  const { t } = useTranslation();
  const [position, setPosition] = useState<ToolbarPosition | null>(null);

  useEffect(() => {
    function handleSelectionChange() {
      const scope = scopeRef.current;
      const selection = document.getSelection();
      if (
        !scope ||
        !selection ||
        selection.isCollapsed ||
        selection.rangeCount === 0
      ) {
        setPosition(null);
        return;
      }
      const range = selection.getRangeAt(0);
      if (!scope.contains(range.commonAncestorContainer)) {
        setPosition(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setPosition(null);
        return;
      }
      setPosition({ x: rect.left + rect.width / 2, y: rect.top });
    }
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [scopeRef]);

  if (!position) return null;

  function afterCommand() {
    const selection = document.getSelection();
    const richElement = findRichAncestor(selection?.anchorNode ?? null);
    richElement?.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function applyEmphasis(event: MouseEvent) {
    event.preventDefault();
    document.execCommand("italic");
    const richElement = findRichAncestor(document.getSelection()?.anchorNode ?? null);
    if (richElement) replaceTag(richElement, "i", "em");
    afterCommand();
  }

  function applyStrong(event: MouseEvent) {
    event.preventDefault();
    document.execCommand("bold");
    const richElement = findRichAncestor(document.getSelection()?.anchorNode ?? null);
    if (richElement) replaceTag(richElement, "b", "strong");
    afterCommand();
  }

  function applyLink(event: MouseEvent) {
    event.preventDefault();
    document.execCommand("createLink", false, PLACEHOLDER_LINK_HREF);
    afterCommand();
  }

  return (
    <div
      className={styles.seltool}
      style={{ left: position.x, top: position.y }}
      role="toolbar"
      aria-label={t("magazine:write.selection.toolbarAria")}
      // Prevents the mousedown's default action (which would move focus and
      // collapse the selection) so execCommand still has a selection to act
      // on when the click handlers below run.
      onMouseDown={(event) => event.preventDefault()}
    >
      <button type="button" onMouseDown={applyEmphasis}>
        <FiItalic aria-hidden />
        {t("magazine:write.selection.emphasis")}
      </button>
      <button type="button" onMouseDown={applyStrong}>
        <FiBold aria-hidden />
        {t("magazine:write.selection.strong")}
      </button>
      <button type="button" onMouseDown={applyLink}>
        <FiLink aria-hidden />
        {t("magazine:write.selection.link")}
      </button>
    </div>
  );
}
