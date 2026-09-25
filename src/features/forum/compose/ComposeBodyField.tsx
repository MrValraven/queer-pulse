import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { FiAlignLeft } from "react-icons/fi";
import { Collapse, SegmentedControl } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { MentionTextarea } from "../../../shared/mentions/MentionTextarea";
import { COMPOSE_KIND_FALLBACK, composeKindById } from "./composeKinds.data";
import {
  applyComposeMarkdownCommand,
  COMPOSE_LINK_HREF_STUB,
  type ComposeMarkdownCommandId,
  type ComposeMarkdownPlaceholders,
} from "./composeMarkdownCommands";
import {
  ComposeBodyFooter,
  ComposeBodyPreview,
  ComposeBodyToolbar,
} from "./ComposeBodyChrome";
import type { PostKind } from "./composeThread.types";
import styles from "./ComposeBodyField.module.css";

// ── The opening post ────────────────────────────────────────────────────────
// A formatting toolbar, the body itself, and a preview rendered by the SAME
// `<MarkdownLite>` the published thread uses, so what a member sees here is
// what everyone else will read.
//
// The input is `MentionTextarea` rather than a bare textarea: `@member`,
// `#topic` and `c/community` already autocomplete everywhere else in the app,
// and a composer that hand-rolled a second one would drift from it.
//
// Every toolbar command is a pure function in `composeMarkdownCommands.ts`.
// This component only reads the live selection off the DOM, hands it over, and
// puts the caret back where the command asked for it.

/** Which of the write/preview segments is showing. View state of this field
 *  alone, so it is local rather than part of the draft. */
type BodyMode = "write" | "preview";

export interface ComposeBodyFieldProps {
  /** The draft body, in markdown-lite. */
  body: string;
  /** Wire to `setters.setBody`. */
  onBodyChange: (body: string) => void;
  /** Chooses the placeholder and the outline the scaffold pill drops in. */
  kind: PostKind | null;
  /** Words of prose in the body, from `useComposeThreadPage`. */
  wordCount: number;
  /** Lets the page move focus here when Enter leaves the title. */
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  /** The photo picker button, rendered at the left of the body footer. */
  attachSlot?: ReactNode;
}

export function ComposeBodyField({
  body,
  onBodyChange,
  kind,
  wordCount,
  textareaRef,
  attachSlot,
}: ComposeBodyFieldProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<BodyMode>("write");
  // Both panes stay mounted so Write | Preview can crossfade. Once the member
  // is back on Write, the hidden preview keeps the text it last showed, so it
  // fades out unchanged and does not re-render on every keystroke.
  const [lastPreviewedBody, setLastPreviewedBody] = useState(body);
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = textareaRef ?? internalRef;
  // Where the caret belongs once the parent has re-rendered with the new body.
  // A command cannot set it directly: the value it produced has not reached the
  // DOM yet at the moment it runs.
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(
    null,
  );

  useEffect(() => {
    const pending = pendingSelectionRef.current;
    const node = ref.current;
    if (!pending || !node) return;
    pendingSelectionRef.current = null;
    node.focus();
    node.setSelectionRange(pending.start, pending.end);
  }, [body, ref]);

  const chosenKind = composeKindById(kind);
  const placeholderKey =
    chosenKind?.bodyPlaceholderKey ?? COMPOSE_KIND_FALLBACK.bodyPlaceholderKey;
  const scaffoldKey = chosenKind?.scaffoldKey ?? null;
  const isWriting = mode === "write";
  const canOfferScaffold = !!scaffoldKey && !body.trim() && isWriting;
  const previewBody = isWriting ? lastPreviewedBody : body;
  const writePaneClassName = isWriting ? styles.pane : styles.paneHidden;
  const previewPaneClassName = isWriting ? styles.paneHidden : styles.pane;

  const placeholders: ComposeMarkdownPlaceholders = {
    text: t("forum:composePage.body.placeholderText"),
    heading: t("forum:composePage.body.placeholderHeading"),
    linkText: t("forum:composePage.body.placeholderLinkText"),
    linkHref: COMPOSE_LINK_HREF_STUB,
  };

  function runCommand(commandId: ComposeMarkdownCommandId) {
    const node = ref.current;
    if (!node) return;
    const next = applyComposeMarkdownCommand(
      commandId,
      {
        value: node.value,
        selectionStart: node.selectionStart,
        selectionEnd: node.selectionEnd,
      },
      placeholders,
    );
    pendingSelectionRef.current = {
      start: next.selectionStart,
      end: next.selectionEnd,
    };
    onBodyChange(next.value);
  }

  function handleShortcut(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!event.metaKey && !event.ctrlKey) return;
    const key = event.key.toLowerCase();
    if (key !== "b" && key !== "i") return;
    event.preventDefault();
    runCommand(key === "b" ? "bold" : "italic");
  }

  function insertScaffold() {
    if (!scaffoldKey) return;
    const scaffold = t(scaffoldKey);
    // Land the caret on the first blank line under the opening heading, which
    // is where the member starts writing.
    const firstGap = scaffold.indexOf("\n\n");
    const caret = firstGap === -1 ? scaffold.length : firstGap + 2;
    pendingSelectionRef.current = { start: caret, end: caret };
    onBodyChange(scaffold);
  }

  return (
    <div className={styles.bodyField}>
      <div className={styles.toolsRow}>
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
            if (next === "write") setLastPreviewedBody(body);
            setMode(next as BodyMode);
          }}
        />
      </div>

      <div className={styles.panes}>
        <div className={writePaneClassName} inert={!isWriting}>
          <MentionTextarea
            textareaRef={ref}
            wrapClassName={styles.bodyWrap}
            className={styles.bodyInput}
            value={body}
            onChange={onBodyChange}
            onKeyDown={handleShortcut}
            placeholder={t(placeholderKey)}
            aria-label={t("forum:composePage.body.ariaLabel")}
          />
        </div>
        <div className={previewPaneClassName} inert={isWriting}>
          <ComposeBodyPreview text={previewBody} />
        </div>
      </div>

      <Collapse isOpen={canOfferScaffold}>
        <button
          type="button"
          className={styles.scaffold}
          onClick={insertScaffold}
        >
          <FiAlignLeft className={styles.scaffoldIcon} aria-hidden />
          {t("forum:composePage.body.scaffold")}
        </button>
      </Collapse>

      <ComposeBodyFooter attachSlot={attachSlot} wordCount={wordCount} />
    </div>
  );
}
