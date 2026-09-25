import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ComposeBodyToolbar } from "../forum/compose/ComposeBodyChrome";
import {
  applyComposeMarkdownCommand,
  COMPOSE_LINK_HREF_STUB,
  type ComposeMarkdownCommandId,
  type ComposeMarkdownPlaceholders,
} from "../forum/compose/composeMarkdownCommands";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinRefinedField } from "./SkinRefinedField";
import { useAutoGrowFallback } from "./useAutoGrowTextarea";
import {
  refinedSurfaceClassName,
  useRefinedPlaceholder,
} from "./refinedFieldSurface";
import {
  haveSameParagraphs,
  joinParagraphs,
  splitParagraphs,
} from "./skinParagraphsText";
import refinedStyles from "./SkinRefinedList.module.css";

/**
 * The field's own text, held locally because cutting it into paragraphs and
 * joining them again is lossy: a blank line typed ahead of a new paragraph,
 * or three newlines in a row, would vanish under the caret. Each edit sends
 * the paragraphs to the editor. The text is reseeded from the editor only
 * when the stored paragraphs change to something this text does not already
 * hold (a discard or a reset from outside). The stored value is tracked in
 * state and compared during render (the React "derived state" idiom), so no
 * effect runs and no stale frame paints.
 */
function useParagraphsText(editor: SubprofileSkinBlocksEditor, path: string) {
  const stored = editor.getValue(path);
  const [text, setText] = useState(() => joinParagraphs(stored));
  const [seenStored, setSeenStored] = useState(stored);
  if (seenStored !== stored) {
    setSeenStored(stored);
    const storedParagraphs = splitParagraphs(joinParagraphs(stored));
    if (!haveSameParagraphs(storedParagraphs, splitParagraphs(text))) {
      setText(joinParagraphs(stored));
    }
  }
  const changeText = (next: string) => {
    setText(next);
    editor.setValue(path, splitParagraphs(next));
  };
  return { text, changeText };
}

/**
 * A `paragraphs` control (the therapist's approach) as one markdown-lite
 * field with the forum composer's formatting toolbar and its Cmd or Ctrl
 * with B and I shortcuts. A blank line starts a new paragraph; the stored
 * value stays one string per paragraph. The hint under the field says so.
 */
export function SkinParagraphsControl({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const { t } = useTranslation();
  const { text, changeText } = useParagraphsText(editor, control.path);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const placeholder = useRefinedPlaceholder(control.placeholderKey);
  useAutoGrowFallback(textareaRef, text);
  // Where the caret belongs once the new text has rendered. A command cannot
  // set it directly: its value has not reached the DOM when it runs.
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(
    null,
  );

  useEffect(() => {
    const pending = pendingSelectionRef.current;
    const textarea = textareaRef.current;
    if (!pending || !textarea) return;
    pendingSelectionRef.current = null;
    textarea.focus();
    textarea.setSelectionRange(pending.start, pending.end);
  }, [text]);

  const placeholders: ComposeMarkdownPlaceholders = {
    text: t("forum:composePage.body.placeholderText"),
    heading: t("forum:composePage.body.placeholderHeading"),
    linkText: t("forum:composePage.body.placeholderLinkText"),
    linkHref: COMPOSE_LINK_HREF_STUB,
  };

  function runCommand(commandId: ComposeMarkdownCommandId) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const next = applyComposeMarkdownCommand(
      commandId,
      {
        value: textarea.value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
      },
      placeholders,
    );
    pendingSelectionRef.current = {
      start: next.selectionStart,
      end: next.selectionEnd,
    };
    changeText(next.value);
  }

  function handleShortcut(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!event.metaKey && !event.ctrlKey) return;
    const key = event.key.toLowerCase();
    if (key !== "b" && key !== "i") return;
    event.preventDefault();
    runCommand(key === "b" ? "bold" : "italic");
  }

  const label = t(control.labelKey);
  const isEmpty = text.trim() === "";

  return (
    <SkinRefinedField
      label={label}
      isLabelHidden={isLabelHidden}
      helper={control.helperKey ? t(control.helperKey) : undefined}
      helperTone={control.helperTone}
      footer={t("subprofiles:skinList.paragraphsHint")}
    >
      {(field) => (
        <>
          <div className={refinedStyles.paragraphToolbar}>
            <ComposeBodyToolbar isDisabled={false} onCommand={runCommand} />
          </div>
          <textarea
            ref={textareaRef}
            id={field.controlId}
            aria-label={label}
            aria-describedby={
              [field.describedBy, field.footerId].filter(Boolean).join(" ") ||
              undefined
            }
            className={`${refinedSurfaceClassName({ isMultiline: true, isEmpty })} ${refinedStyles.paragraphText}`}
            rows={6}
            value={text}
            placeholder={placeholder}
            onChange={(event) => changeText(event.target.value)}
            onKeyDown={handleShortcut}
          />
        </>
      )}
    </SkinRefinedField>
  );
}
