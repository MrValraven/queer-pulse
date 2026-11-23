import {
  memo,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { Collapse, SegmentedControl } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MarkdownLite } from "../../shared/markdown";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import { ComposeBodyToolbar } from "../forum/compose/ComposeBodyChrome";
import {
  applyComposeMarkdownCommand,
  COMPOSE_LINK_HREF_STUB,
  type ComposeMarkdownCommandId,
} from "../forum/compose/composeMarkdownCommands";
import styles from "./CommunityComposerBody.module.css";

// ── The community post body ─────────────────────────────────────────────────
// The forum's new-post editor, sized for a feed: the same formatting toolbar
// and markdown-lite commands, an @mention field that grows with its text, and
// a Write | Preview switch whose preview is the same `MarkdownLite` a posted
// community body renders with. At rest it is one quiet line; the toolbar
// unfolds above it once the member starts writing.

type BodyMode = "write" | "preview";

export interface CommunityComposerBodyProps {
  value: string;
  onChange: (next: string) => void;
  /** Cmd/Ctrl + Enter calls this when the field has text. */
  onSubmit?: () => void;
  /** The real textarea, for focus requests and the Studio share preview. */
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  /** The calling surface's look for the field (font, focus ring). */
  textareaClassName?: string;
  placeholder?: string;
  ariaLabel: string;
  /** Keep the toolbar showing even while the field is empty and idle. */
  isToolbarAlwaysShown?: boolean;
}

export function CommunityComposerBody({
  value,
  onChange,
  onSubmit,
  textareaRef,
  textareaClassName,
  placeholder,
  ariaLabel,
  isToolbarAlwaysShown = false,
}: CommunityComposerBodyProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<BodyMode>("write");
  // Both panes stay mounted so Write | Preview can crossfade; the hidden
  // preview keeps the text it last showed so it never re-renders per keystroke.
  const [lastPreviewedValue, setLastPreviewedValue] = useState(value);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);
  const toolsRowRef = useRef<HTMLDivElement | null>(null);
  // Where the caret belongs once the parent re-renders with the new value.
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(
    null,
  );

  // A shared post empties the field: the next draft starts back on Write.
  if (value !== previousValue) {
    setPreviousValue(value);
    if (!value && mode === "preview") setMode("write");
  }

  const isWriting = mode === "write";
  const hasText = value.trim().length > 0;
  const isToolbarOpen =
    isToolbarAlwaysShown || isFocusWithin || hasText || !isWriting;
  const previewValue = isWriting ? lastPreviewedValue : value;

  // A pointer press on the toolbar keeps the caret in the field (Safari never
  // focuses a clicked button), so an empty draft's toolbar stays open under
  // the button being pressed. A native listener, since the row is layout.
  useEffect(() => {
    const row = toolsRowRef.current;
    if (!row) return;
    const keepFieldFocus = (event: MouseEvent) => event.preventDefault();
    row.addEventListener("mousedown", keepFieldFocus);
    return () => row.removeEventListener("mousedown", keepFieldFocus);
  }, [isToolbarOpen]);

  useEffect(() => {
    const pending = pendingSelectionRef.current;
    const node = textareaRef.current;
    if (!pending || !node) return;
    pendingSelectionRef.current = null;
    node.focus();
    node.setSelectionRange(pending.start, pending.end);
  }, [value, textareaRef]);

  function runCommand(commandId: ComposeMarkdownCommandId) {
    const node = textareaRef.current;
    if (!node) return;
    const next = applyComposeMarkdownCommand(
      commandId,
      {
        value: node.value,
        selectionStart: node.selectionStart,
        selectionEnd: node.selectionEnd,
      },
      {
        text: t("forum:composePage.body.placeholderText"),
        heading: t("forum:composePage.body.placeholderHeading"),
        linkText: t("forum:composePage.body.placeholderLinkText"),
        linkHref: COMPOSE_LINK_HREF_STUB,
      },
    );
    pendingSelectionRef.current = {
      start: next.selectionStart,
      end: next.selectionEnd,
    };
    onChange(next.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!event.metaKey && !event.ctrlKey) return;
    const key = event.key.toLowerCase();
    if (key === "enter" && onSubmit) {
      event.preventDefault();
      if (hasText) onSubmit();
      return;
    }
    if (key !== "b" && key !== "i") return;
    event.preventDefault();
    runCommand(key === "b" ? "bold" : "italic");
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget))
      return;
    setIsFocusWithin(false);
  }

  return (
    <div
      className={styles.body}
      onFocus={() => setIsFocusWithin(true)}
      onBlur={handleBlur}
    >
      <Collapse isOpen={isToolbarOpen}>
        <div className={styles.toolsRow} ref={toolsRowRef}>
          <ComposeBodyToolbar isDisabled={!isWriting} onCommand={runCommand} />
          <SegmentedControl
            className={styles.modeSwitch}
            label={t("forum:composePage.mode.groupLabel")}
            options={[
              { value: "write", label: t("forum:composePage.mode.write") },
              { value: "preview", label: t("forum:composePage.mode.preview") },
            ]}
            value={mode}
            onChange={(next) => {
              if (next === "write") setLastPreviewedValue(value);
              setMode(next as BodyMode);
            }}
          />
        </div>
      </Collapse>

      <div className={styles.panes}>
        <div
          className={isWriting ? styles.pane : styles.paneHidden}
          inert={!isWriting}
        >
          <MentionTextarea
            textareaRef={textareaRef}
            className={[styles.input, textareaClassName]
              .filter(Boolean)
              .join(" ")}
            rows={1}
            autoGrow
            shouldSubmitOnModifierEnter={onSubmit !== undefined}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={ariaLabel}
          />
        </div>
        <div
          className={isWriting ? styles.paneHidden : styles.pane}
          inert={isWriting}
        >
          <CommunityComposerPreview text={previewValue} />
        </div>
      </div>
    </div>
  );
}

/** The rendered body, memoised on its text so the hidden pane idles while the
 *  member types. Same renderer as the published post. */
const CommunityComposerPreview = memo(function CommunityComposerPreview({
  text,
}: {
  text: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.preview}>
      {text.trim() ? (
        <MarkdownLite text={text} />
      ) : (
        <p className={styles.previewEmpty}>
          {t("forum:composePage.body.previewEmpty")}
        </p>
      )}
    </div>
  );
});
