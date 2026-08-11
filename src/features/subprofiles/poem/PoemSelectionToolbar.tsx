import { useEffect, useState, type MouseEvent, type RefObject } from "react";
import { FiBold, FiItalic } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./PoemSelectionToolbar.module.css";

export interface PoemSelectionToolbarProps {
  /** The poem editor surface to watch; the toolbar only shows for a
   *  non-collapsed selection anchored inside it. */
  scopeRef: RefObject<HTMLElement | null>;
}

interface ToolbarPosition {
  x: number;
  y: number;
}

function findRichAncestor(node: Node | null): HTMLElement | null {
  let current: HTMLElement | null =
    node instanceof HTMLElement ? node : (node?.parentElement ?? null);
  while (current && current.getAttribute("data-rich") !== "true") {
    current = current.parentElement;
  }
  return current;
}

/** Rename every `<oldTagName>` inside `root` to `<newTagName>` (execCommand
 *  emits `<i>`/`<b>`; poem HTML must carry semantic `<em>`/`<strong>`). */
function replaceTag(root: HTMLElement, oldTagName: string, newTagName: string) {
  root.querySelectorAll(oldTagName).forEach((element) => {
    const replacement = document.createElement(newTagName);
    replacement.innerHTML = element.innerHTML;
    element.replaceWith(replacement);
  });
}

/**
 * Floating italic/bold toolbar for the poem editor. Tracks
 * `selectionchange`; appears above a non-collapsed selection inside
 * `scopeRef`. No link button (poems allow emphasis only). Sibling of the
 * magazine `SelectionToolbar`, kept separate to leave magazine untouched.
 */
export function PoemSelectionToolbar({ scopeRef }: PoemSelectionToolbarProps) {
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
    const richElement = findRichAncestor(
      document.getSelection()?.anchorNode ?? null,
    );
    if (richElement) replaceTag(richElement, "i", "em");
    afterCommand();
  }

  function applyStrong(event: MouseEvent) {
    event.preventDefault();
    document.execCommand("bold");
    const richElement = findRichAncestor(
      document.getSelection()?.anchorNode ?? null,
    );
    if (richElement) replaceTag(richElement, "b", "strong");
    afterCommand();
  }

  return (
    <div
      className={styles.toolbar}
      style={{ left: position.x, top: position.y }}
      role="toolbar"
      aria-label={t("subprofiles:poem.editor.toolbarAria")}
      onMouseDown={(event) => event.preventDefault()}
    >
      <button type="button" onMouseDown={applyEmphasis}>
        <FiItalic aria-hidden />
        {t("subprofiles:poem.editor.italic")}
      </button>
      <button type="button" onMouseDown={applyStrong}>
        <FiBold aria-hidden />
        {t("subprofiles:poem.editor.bold")}
      </button>
    </div>
  );
}
