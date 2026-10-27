import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button, Collapse, FormField } from "../../../shared/components/ui";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowTemplateCardField,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowBilingualInput } from "../builder/QuizshowBilingualInput";
import type { QuizshowTemplateMeta } from "./quizshowTemplateResponse";
import { QuizshowTemplateStatusLine } from "./QuizshowTemplateStatusLine";
import type { QuizshowTemplateDraft } from "./useQuizshowTemplateDraft";
import type { QuizshowTemplatePublishing } from "./useQuizshowTemplatePublish";
import styles from "./QuizshowTemplateDetails.module.css";

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
  const shownErrorKey = useLastKey(isErrorShown ? errorKey : null);

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
      <Collapse isOpen={isErrorShown}>
        <p className={styles.alert} role="alert">
          <FiAlertCircle aria-hidden fill="none" className={styles.alertIcon} />
          {shownErrorKey !== null && t(shownErrorKey)}
        </p>
      </Collapse>
    </div>
  );
}

/** The template's host card, staff notes, status and publish controls, above the quiz. */
export function QuizshowTemplateDetails({
  templateDraft,
  meta,
  languages,
  publishing,
}: {
  templateDraft: QuizshowTemplateDraft;
  meta: QuizshowTemplateMeta;
  languages: QuizshowLanguageMode;
  publishing: QuizshowTemplatePublishing;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const focusFirstMissingField = useFirstMissingFieldFocus(panelRef);
  const { card, staffNotes } = templateDraft;
  const { shownMissingFields } = publishing;
  const staffNotesMax = QUIZSHOW_LIMITS.templateStaffNotesMax;

  return (
    <section
      ref={panelRef}
      aria-labelledby={headingId}
      className={styles.panel}
    >
      <header className={styles.header}>
        <h3 id={headingId} className={styles.heading}>
          {t("quizshow:templates.details.heading")}
        </h3>
        <p className={styles.sub}>{t("quizshow:templates.details.sub")}</p>
      </header>
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
      <div className={styles.statusRow}>
        <QuizshowTemplateStatusLine meta={meta} />
        <QuizshowTemplatePublishActions
          meta={meta}
          publishing={publishing}
          onBlockedPublish={focusFirstMissingField}
        />
      </div>
    </section>
  );
}
