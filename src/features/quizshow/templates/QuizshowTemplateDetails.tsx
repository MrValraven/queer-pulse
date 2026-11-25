import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button, Collapse, FormField } from "../../../shared/components/ui";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowTemplateCardField,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowBilingualInput } from "../builder/QuizshowBilingualInput";
import { usedLanguagesOf } from "../builder/quizshowValidation";
import editorStyles from "../builder/QuizshowQuestionEditor.module.css";
import type { QuizshowTemplateMeta } from "./quizshowTemplateResponse";
import { QuizshowTemplateStatusLine } from "./QuizshowTemplateStatusLine";
import type { QuizshowTemplateDraft } from "./useQuizshowTemplateDraft";
import type { QuizshowTemplatePublishing } from "./useQuizshowTemplatePublish";
import { STUDIO_NATIVE_UNDO_ATTRIBUTE } from "../shared/quizshowNativeUndo";
import styles from "./QuizshowTemplateDetails.module.css";

/** The card and staff notes are outside the draft history, so Cmd/Ctrl+Z keeps the browser's own undo here. */
const NATIVE_UNDO_PROPS = { [STUDIO_NATIVE_UNDO_ATTRIBUTE]: "" };

/**
 * C2.5: each language of the "What changed" note holds 0 to 300 characters
 * once trimmed, counted in code points as the server counts them. The
 * contract mirror has no limit constant for it.
 */
const TEMPLATE_CHANGE_NOTE_MAX = 300;

/** Code points, as the server's limit counts them (an emoji is one). */
function codePointCountOf(text: string): number {
  return Array.from(text).length;
}

/** The text cut to the change note's limit in code points; as typed when it fits. */
function clippedToChangeNoteMax(text: string): string {
  const codePoints = Array.from(text);
  if (codePoints.length <= TEMPLATE_CHANGE_NOTE_MAX) return text;
  return codePoints.slice(0, TEMPLATE_CHANGE_NOTE_MAX).join("");
}

/**
 * One language of the "What changed" note. The textarea's maxLength is
 * recomputed from the code points left, so the browser itself blocks typing
 * at the limit (caret and IME stay where they are) and cuts only a pasted
 * text. A value arriving over the limit is cut as a safety net. After a cut,
 * a polite line says why, until the note changes again.
 */
function QuizshowChangeNoteField({
  language,
  text,
  hintId,
  onChange,
}: {
  language: QuizshowLanguage;
  text: string;
  hintId: string;
  onChange: (text: string) => void;
}) {
  const { t } = useTranslation();
  const noticeId = useId();
  // The note as it stood after the last cut; the line shows while it still does.
  const [cutAtText, setCutAtText] = useState<string | null>(null);
  // Set by a paste the limit cuts, read by the change event that follows it.
  const isPasteCutRef = useRef(false);
  const count = codePointCountOf(text);
  const remainingCodePoints = Math.max(0, TEMPLATE_CHANGE_NOTE_MAX - count);
  const isCutShown = cutAtText === text;
  return (
    <div>
      <FormField
        className={editorStyles.languageField}
        label={t(`quizshow:language.tag.${language}`)}
        labelAside={`${count}/${TEMPLATE_CHANGE_NOTE_MAX}`}
      >
        <textarea
          rows={3}
          value={text}
          // UTF-16 units: each code point left takes at least one.
          maxLength={text.length + remainingCodePoints}
          aria-describedby={isCutShown ? `${hintId} ${noticeId}` : hintId}
          onKeyDown={() => {
            isPasteCutRef.current = false;
          }}
          onPaste={(event) => {
            const field = event.currentTarget;
            const pasted = event.clipboardData.getData("text");
            const pastedResult =
              text.slice(0, field.selectionStart) +
              pasted +
              text.slice(field.selectionEnd);
            const isCut =
              codePointCountOf(pastedResult) > TEMPLATE_CHANGE_NOTE_MAX;
            isPasteCutRef.current = isCut;
            // A paste the limit blocks whole fires no change of its own.
            if (isCut) setCutAtText(text);
          }}
          onChange={(event) => {
            const typed = event.target.value;
            const kept = clippedToChangeNoteMax(typed);
            if (isPasteCutRef.current || kept !== typed) setCutAtText(kept);
            isPasteCutRef.current = false;
            onChange(kept);
          }}
        />
      </FormField>
      <div aria-live="polite">
        <Collapse isOpen={isCutShown}>
          <p id={noticeId} className={styles.changeNoteCut}>
            {t("quizshow:templates.changeNote.tooLong", {
              max: TEMPLATE_CHANGE_NOTE_MAX,
            })}
          </p>
        </Collapse>
      </div>
    </div>
  );
}

/**
 * "What changed" (C6.25): one field per language the quiz uses, laid out as
 * QuizshowBilingualInput lays its fields. That input counts UTF-16 units, so
 * this one counts code points, as the server does.
 */
function QuizshowChangeNoteInput({
  value,
  languages,
  onChange,
}: {
  value: QuizshowText;
  languages: QuizshowLanguageMode;
  onChange: (value: QuizshowText) => void;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const hintId = useId();
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className={editorStyles.bilingual}
    >
      <span id={labelId} className={editorStyles.groupLabel}>
        {t("quizshow:templates.changeNote.label")}
      </span>
      <span id={hintId} className={editorStyles.hint}>
        {t("quizshow:templates.changeNote.hint")}
      </span>
      {usedLanguagesOf(languages).map((language) => (
        <QuizshowChangeNoteField
          key={language}
          language={language}
          text={value[language]}
          hintId={hintId}
          onChange={(text) => onChange({ ...value, [language]: text })}
        />
      ))}
    </div>
  );
}

/** The languages a card part is shown missing in, from the shown fields. */
function missingLanguagesOf(
  fields: readonly QuizshowTemplateCardField[],
  part: "title" | "description",
): QuizshowLanguage[] {
  return fields.flatMap((field) => {
    const [fieldPart, language] = field.split(".") as [
      string,
      QuizshowLanguage,
    ];
    return fieldPart === part ? [language] : [];
  });
}

/**
 * Keeps the last non-null key, so a line folding away still reads its copy
 * while it animates out.
 */
function useLastKey(key: string | null): string | null {
  const [lastKey, setLastKey] = useState(key);
  if (key !== null && key !== lastKey) setLastKey(key);
  return key ?? lastKey;
}

/** The card fields a blocked Publish marks missing, in card order. */
const MISSING_CARD_FIELD_SELECTOR =
  'input[aria-invalid="true"], textarea[aria-invalid="true"]';

/**
 * After a blocked Publish tap, moves focus to the first card field shown
 * missing and scrolls it into view. The fields carry a scroll margin that
 * clears the sticky admin header. Focus never scrolls by itself: the scroll
 * waits a frame and follows the page's own `scroll-behavior` (smooth, outside
 * reduced motion). Returns the request to call on a blocked tap.
 */
function useFirstMissingFieldFocus(
  panelRef: RefObject<HTMLElement | null>,
): () => void {
  const [focusRequestCount, setFocusRequestCount] = useState(0);
  useEffect(() => {
    if (focusRequestCount === 0) return;
    const firstMissingField = panelRef.current?.querySelector<HTMLElement>(
      MISSING_CARD_FIELD_SELECTOR,
    );
    if (!firstMissingField) return;
    firstMissingField.focus({ preventScroll: true });
    const frame = requestAnimationFrame(() =>
      firstMissingField.scrollIntoView({ block: "nearest" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [focusRequestCount, panelRef]);
  return () => setFocusRequestCount((count) => count + 1);
}

/** Publish or Unpublish, the reason a Publish is blocked, and the last refusal. */
function QuizshowTemplatePublishActions({
  meta,
  publishing,
  onBlockedPublish,
}: {
  meta: QuizshowTemplateMeta;
  publishing: QuizshowTemplatePublishing;
  /** Called on a Publish tap that the blocked reason stops. */
  onBlockedPublish: () => void;
}) {
  const { t } = useTranslation();
  const reasonId = useId();
  const isPublished = meta.status === "published";
  const { blockedReasonKey, errorKey, isPending } = publishing;
  // Blocked only with a visible reason; a pending write reads as busy, and
  // the handlers already ignore a tap while it runs.
  const hasReason = !isPublished && blockedReasonKey !== null;
  // The alert repeats nothing the reason line already says.
  const isErrorShown = errorKey !== null && errorKey !== blockedReasonKey;
  const shownReasonKey = useLastKey(hasReason ? blockedReasonKey : null);

  return (
    <div className={styles.actions}>
      <Button
        variant={isPublished ? "ghost" : "primary"}
        aria-disabled={hasReason}
        aria-busy={isPending ? true : undefined}
        aria-describedby={hasReason ? reasonId : undefined}
        onClick={() => {
          if (isPublished) {
            publishing.unpublish();
            return;
          }
          if (hasReason && !isPending) onBlockedPublish();
          publishing.publish();
        }}
      >
        {t(
          isPublished
            ? "quizshow:templates.unpublish"
            : "quizshow:templates.publish",
        )}
      </Button>
      <Collapse isOpen={hasReason}>
        <p id={reasonId} className={styles.reason}>
          {shownReasonKey !== null && t(shownReasonKey)}
        </p>
      </Collapse>
      <QuizshowTemplatePublishAlert errorKey={isErrorShown ? errorKey : null} />
    </div>
  );
}

/** The last publish refusal, named; it folds away once the next attempt clears it. */
function QuizshowTemplatePublishAlert({
  errorKey,
}: {
  errorKey: string | null;
}) {
  const { t } = useTranslation();
  const shownErrorKey = useLastKey(errorKey);
  return (
    <Collapse isOpen={errorKey !== null}>
      <p className={styles.alert} role="alert">
        <FiAlertCircle aria-hidden fill="none" className={styles.alertIcon} />
        {shownErrorKey !== null && t(shownErrorKey)}
      </p>
    </Collapse>
  );
}

/**
 * "Last published {date}" under the status line. It shows once a save while
 * published moved the latest publish to a later day than the status line
 * names; on the same day it would only repeat that date.
 */
function QuizshowTemplateLastPublished({
  meta,
}: {
  meta: QuizshowTemplateMeta;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const dayOf = (timestamp: string | null) =>
    timestamp === null
      ? null
      : format.date(new Date(timestamp), { dateStyle: "medium" });
  const lastPublishedDay = dayOf(meta.lastPublishedAt);
  const isShown =
    meta.status === "published" &&
    lastPublishedDay !== null &&
    lastPublishedDay !== dayOf(meta.publishedAt);
  const shownDay = useLastKey(isShown ? lastPublishedDay : null);
  return (
    <Collapse isOpen={isShown}>
      <p className={styles.lastPublished}>
        {shownDay !== null &&
          t("quizshow:templates.lastPublished", { date: shownDay })}
      </p>
    </Collapse>
  );
}

/** The template's host card, staff notes, change note, status and publish controls, above the quiz. */
export function QuizshowTemplateDetails({
  templateDraft,
  meta,
  languages,
  publishing,
  isFlat = false,
}: {
  templateDraft: QuizshowTemplateDraft;
  meta: QuizshowTemplateMeta;
  languages: QuizshowLanguageMode;
  publishing: QuizshowTemplatePublishing;
  /**
   * Inside the Pulse Live studio inspector, whose section already names it:
   * a plain group of fields, with no card, no header and no landmark, and
   * the publish status line without Publish (the studio's top bar has it).
   */
  isFlat?: boolean;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const focusFirstMissingField = useFirstMissingFieldFocus(panelRef);
  const { card, staffNotes } = templateDraft;
  const { shownMissingFields } = publishing;
  const staffNotesMax = QUIZSHOW_LIMITS.templateStaffNotesMax;

  const content = (
    <>
      <QuizshowBilingualInput
        label={t("quizshow:templates.details.cardTitle")}
        value={card.title}
        languages={languages}
        maxLength={QUIZSHOW_LIMITS.templateCardTitleMax}
        missingLanguages={missingLanguagesOf(shownMissingFields, "title")}
        errorText={t("quizshow:templates.details.cardTitleMissing")}
        onChange={templateDraft.setCardTitle}
      />
      <QuizshowBilingualInput
        label={t("quizshow:templates.details.cardDescription")}
        value={card.description}
        languages={languages}
        maxLength={QUIZSHOW_LIMITS.templateCardDescriptionMax}
        isMultiline
        missingLanguages={missingLanguagesOf(shownMissingFields, "description")}
        errorText={t("quizshow:templates.details.cardDescriptionMissing")}
        onChange={templateDraft.setCardDescription}
      />
      <FormField
        label={t("quizshow:templates.details.staffNotes")}
        labelAside={`${staffNotes.length}/${staffNotesMax}`}
        helper={t("quizshow:templates.details.staffNotesHint")}
      >
        <textarea
          rows={5}
          className={styles.staffNotes}
          value={staffNotes}
          maxLength={staffNotesMax}
          onChange={(event) => templateDraft.setStaffNotes(event.target.value)}
        />
      </FormField>
      <QuizshowChangeNoteInput
        value={templateDraft.changeNote}
        languages={languages}
        onChange={templateDraft.setChangeNote}
      />
      <div className={styles.statusRow}>
        <div className={styles.statusStack}>
          <QuizshowTemplateStatusLine meta={meta} />
          <QuizshowTemplateLastPublished meta={meta} />
        </div>
        {/* The studio's top bar holds Publish and its reason, so the flat group keeps the status and the last refusal. */}
        {isFlat ? (
          <QuizshowTemplatePublishAlert errorKey={publishing.errorKey} />
        ) : (
          <QuizshowTemplatePublishActions
            meta={meta}
            publishing={publishing}
            onBlockedPublish={focusFirstMissingField}
          />
        )}
      </div>
    </>
  );
  if (isFlat) {
    return (
      <div
        ref={(node) => {
          panelRef.current = node;
        }}
        className={styles.flat}
        {...NATIVE_UNDO_PROPS}
      >
        {content}
      </div>
    );
  }
  return (
    <section
      ref={panelRef}
      aria-labelledby={headingId}
      className={styles.panel}
      {...NATIVE_UNDO_PROPS}
    >
      <header className={styles.header}>
        <h3 id={headingId} className={styles.heading}>
          {t("quizshow:templates.details.heading")}
        </h3>
        <p className={styles.sub}>{t("quizshow:templates.details.sub")}</p>
      </header>
      {content}
    </section>
  );
}
