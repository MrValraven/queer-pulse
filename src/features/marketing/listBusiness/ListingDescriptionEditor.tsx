import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ComposeBodyToolbar } from "../../forum/compose/ComposeBodyChrome";
import {
  applyComposeMarkdownCommand,
  COMPOSE_LINK_HREF_STUB,
  type ComposeMarkdownCommandId,
  type ComposeMarkdownPlaceholders,
} from "../../forum/compose/composeMarkdownCommands";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  haveSameParagraphs,
  joinParagraphs,
  splitParagraphs,
} from "../../subprofiles/skinParagraphsText";
import { useAutoGrowFallback } from "../../subprofiles/useAutoGrowTextarea";
import type { WitLine } from "./listBusiness.data";
import styles from "./ListingDescriptionEditor.module.css";

/** Ceiling on the description field's whole text. The server checks each
 *  paragraph (2000 characters, 20 paragraphs at most) and a refusal lands on
 *  the field through `listing422.ts`. */
export const LISTING_DESCRIPTION_MAX_LENGTH = 8000;

function paragraphsAsText(paragraphs: WitLine[]): string {
  return joinParagraphs(paragraphs.map((paragraph) => paragraph.text));
}

/**
 * The field's own text, held locally because cutting it into paragraphs and
 * joining them again is lossy: a blank line typed ahead of a new paragraph
 * would vanish under the caret. Each edit sends the text to the form, which
 * stores it as paragraphs. The text is reseeded only when the stored
 * paragraphs change to something this text does not already hold (a draft
 * restored or discarded from outside). Same idiom as `SkinParagraphsControl`.
 */
function useDescriptionText(
  paragraphs: WitLine[],
  onChange: (text: string) => void,
) {
  const [text, setText] = useState(() => paragraphsAsText(paragraphs));
  const [seenParagraphs, setSeenParagraphs] = useState(paragraphs);
  if (seenParagraphs !== paragraphs) {
    setSeenParagraphs(paragraphs);
    const storedText = paragraphsAsText(paragraphs);
    if (!haveSameParagraphs(splitParagraphs(storedText), splitParagraphs(text)))
      setText(storedText);
  }
  const changeText = (next: string) => {
    setText(next);
    onChange(next);
  };
  return { text, changeText };
}

/**
 * The listing description as one markdown-lite field: the forum composer's
 * formatting toolbar, an auto-growing textarea with Cmd or Ctrl with B and I
 * shortcuts, and a hint that a blank line starts a new paragraph, drawn as one
 * control. It opts into FormField's wiring, so the label names the textarea
 * and the helper describes it alongside the hint.
 */
export function ListingDescriptionEditor({
  paragraphs,
  placeholder,
  onChange,
  ...wiring
}: {
  paragraphs: WitLine[];
  placeholder: string;
  onChange: (text: string) => void;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
}) {
  const { t } = useTranslation();
  const hintId = useId();
  const { text, changeText } = useDescriptionText(paragraphs, onChange);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
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

  const describedBy = [wiring["aria-describedby"], hintId]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.box}>
      <div className={styles.toolbar}>
        <ComposeBodyToolbar isDisabled={false} onCommand={runCommand} />
      </div>
      <textarea
        {...wiring}
        ref={textareaRef}
        aria-describedby={describedBy}
        className={styles.input}
        rows={6}
        maxLength={LISTING_DESCRIPTION_MAX_LENGTH}
        value={text}
        placeholder={placeholder}
        onChange={(event) => changeText(event.target.value)}
        onKeyDown={handleShortcut}
      />
      <p id={hintId} className={styles.hint}>
        {t("marketing:listBusiness.step2.descriptionHint")}
      </p>
    </div>
  );
}
ListingDescriptionEditor.formFieldControl = true;
