import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { FiBold, FiItalic, FiLink } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { LinkPrompt } from "./LinkPrompt";
import {
  applyEmphasisTo,
  applyLinkTo,
  applyStrongTo,
  findRichAncestor,
} from "./selectionCommands";
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

// What the Link button used to insert on its own. Kept only so a link created
// before there was an address field reads as "no address yet" rather than
// prefilling the field with a scheme the reader always drops.
const LEGACY_PLACEHOLDER_HREF = "https://";

const TOOL_COUNT = 3;

/** The href already on the selection, when it sits inside a link — so
 * reopening the field edits that link instead of starting from blank. */
function hrefAtRange(range: Range): string {
  const node = range.commonAncestorContainer;
  const element = node instanceof HTMLElement ? node : node.parentElement;
  const href = element?.closest("a")?.getAttribute("href") ?? "";
  return href === LEGACY_PLACEHOLDER_HREF ? "" : href;
}

/**
 * A floating selection toolbar (Emphasis / Strong / Link), ported from the
 * design prototype's `SelectionTools`. Tracks `document`'s `selectionchange`
 * and positions itself above the selection's bounding rect whenever the
 * selection is non-collapsed and lives inside `scopeRef`.
 *
 * FE-CNT-09: every tool runs on `click`, which Enter/Space fire on a focused
 * button, and the three buttons form a roving-tabindex toolbar (Arrow
 * Left/Right, Home/End) per the ARIA toolbar pattern. Mousedown is still
 * `preventDefault`ed so a pointer click never collapses the selection, and the
 * selection itself is kept as a cloned Range so a command still has something
 * to act on once Tab has moved focus off the contentEditable.
 *
 * Link asks for a real address (`LinkPrompt`) before calling `createLink`.
 * It used to insert a bare `https://` placeholder, which `sanitizeArticleHtml`
 * unwraps on read — so every link a writer added vanished on publish.
 */
export function SelectionToolbar({ scopeRef }: SelectionToolbarProps) {
  const { t } = useTranslation();
  const [position, setPosition] = useState<ToolbarPosition | null>(null);
  const [linkRange, setLinkRange] = useState<Range | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const toolRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // The selection the toolbar is currently offering tools for. Cloned because
  // the live Range is invalidated the moment focus moves (Tab to a button, or
  // the link address field taking focus).
  const selectionRangeRef = useRef<Range | null>(null);

  // Latest-value ref so the once-registered selection listener can see whether
  // the address field is open without re-registering: focusing that field
  // changes the document selection, which would otherwise close the toolbar
  // out from under it.
  const isLinkPromptOpenRef = useRef(false);
  useEffect(() => {
    isLinkPromptOpenRef.current = linkRange !== null;
  });

  useEffect(() => {
    function handleSelectionChange() {
      if (isLinkPromptOpenRef.current) return;
      // Tabbing into the toolbar drops the editable's selection in some
      // browsers; the toolbar must survive its own focus (FE-CNT-09).
      if (toolbarRef.current?.contains(document.activeElement)) return;
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
      // The headline and standfirst are plain text by contract (see
      // `plainText.ts`): they report `textContent`, so formatting applied
      // there would vanish on the next keystroke. Offer no tools on them.
      const richElement = findRichAncestor(range.commonAncestorContainer);
      if (richElement?.dataset.plainText === "true") {
        setPosition(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setPosition(null);
        return;
      }
      selectionRangeRef.current = range.cloneRange();
      setPosition({ x: rect.left + rect.width / 2, y: rect.top });
    }
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [scopeRef]);

  // Roving focus, and ONLY once the user is already inside the toolbar: the
  // toolbar appearing must never pull focus out of the text they are editing.
  useEffect(() => {
    if (linkRange) return;
    if (!toolbarRef.current?.contains(document.activeElement)) return;
    toolRefs.current[activeIndex]?.focus({ preventScroll: true });
  }, [activeIndex, linkRange]);

  if (!position) return null;

  function moveActive(delta: number) {
    setActiveIndex((current) => (current + delta + TOOL_COUNT) % TOOL_COUNT);
  }

  function handleToolbarKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (linkRange) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(TOOL_COUNT - 1);
    }
  }

  function openLinkPrompt() {
    if (!selectionRangeRef.current) return;
    // The live range is lost the moment the address field takes focus, so the
    // stored clone is what `createLink` is restored against.
    setLinkRange(selectionRangeRef.current.cloneRange());
  }

  function applyLink(href: string) {
    applyLinkTo(linkRange, href);
    setLinkRange(null);
  }

  const tools = [
    {
      key: "emphasis",
      icon: <FiItalic aria-hidden />,
      label: t("magazine:write.selection.emphasis"),
      run: () => applyEmphasisTo(selectionRangeRef.current),
    },
    {
      key: "strong",
      icon: <FiBold aria-hidden />,
      label: t("magazine:write.selection.strong"),
      run: () => applyStrongTo(selectionRangeRef.current),
    },
    {
      key: "link",
      icon: <FiLink aria-hidden />,
      label: t("magazine:write.selection.link"),
      run: openLinkPrompt,
    },
  ];

  return (
    <div
      ref={toolbarRef}
      className={styles.seltool}
      style={{ left: position.x, top: position.y }}
      // Only a toolbar while it holds the format buttons: with the address
      // field open it is a labelled group around a form, which is not what a
      // screen reader should announce as a toolbar.
      role={linkRange ? "group" : "toolbar"}
      aria-label={t("magazine:write.selection.toolbarAria")}
      onKeyDown={handleToolbarKeyDown}
      // Prevents the mousedown's default action (which would move focus and
      // collapse the selection) so the commands below still have a selection
      // to act on when the click handlers run.
      onMouseDown={(event) => event.preventDefault()}
    >
      {linkRange ? (
        <LinkPrompt
          initialHref={hrefAtRange(linkRange)}
          onApply={applyLink}
          onCancel={() => setLinkRange(null)}
        />
      ) : (
        tools.map((tool, index) => (
          <Button
            key={tool.key}
            variant="ghost-dark"
            size="sm"
            ref={(element) => {
              toolRefs.current[index] = element;
            }}
            type="button"
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={tool.run}
            onFocus={() => setActiveIndex(index)}
          >
            {tool.icon}
            {tool.label}
          </Button>
        ))
      )}
    </div>
  );
}
