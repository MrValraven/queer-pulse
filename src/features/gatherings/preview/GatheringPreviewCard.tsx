import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../../shared/hooks/usePrefersReducedMotion";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "../../../shared/lib/cx";
import { replayAnimationClass } from "../createGatheringChapters";
import { gatheringOccurrences } from "../gatheringOccurrences";
import type { GatheringForm } from "../useGatheringForm";
import {
  PREVIEW_BUMP_DURATION_MS,
  type PreviewMode,
} from "./gatheringPreview.data";
import { previewSchedule, previewSignature } from "./gatheringPreviewReading";
import { PreviewAttendeesBlock } from "./PreviewAttendeesBlock";
import {
  PreviewCover,
  PreviewDateBlock,
  PreviewMetaRow,
  PreviewTagRows,
  PreviewTopRow,
} from "./PreviewCardSections";
import { PreviewHostRow } from "./PreviewHostRow";
import styles from "./GatheringPreviewPanel.module.css";

/**
 * A small lift each time something the card shows changes, so the host sees
 * the card answer their typing. A bump already running plays to its end, so
 * fast typing reads as one gentle pulse. Reduced motion keeps the card still
 * (the stylesheet also turns the animation off there).
 */
function usePreviewBump(signature: string) {
  const cardRef = useRef<HTMLElement>(null);
  const previousSignatureRef = useRef(signature);
  const isReducedMotion = usePrefersReducedMotion();
  useEffect(() => {
    if (previousSignatureRef.current === signature) return;
    previousSignatureRef.current = signature;
    const card = cardRef.current;
    const bumpClassName = styles.bump;
    if (!card || !bumpClassName || isReducedMotion) return;
    if (card.classList.contains(bumpClassName)) return;
    replayAnimationClass(card, bumpClassName, PREVIEW_BUMP_DURATION_MS);
  }, [signature, isReducedMotion]);
  return cardRef;
}

/**
 * The gathering card as the board will show it, filled from the form as the
 * host writes. `mode="attendees"` adds what confirmed attendees also see.
 *
 * The card is a readable summary of the form, with no live region, so a
 * screen reader user can browse it on demand without it announcing every
 * keystroke.
 */
export function GatheringPreviewCard({
  form,
  mode,
  id,
}: {
  form: GatheringForm;
  mode: PreviewMode;
  id?: string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const occurrences = gatheringOccurrences(form);
  const startAt = occurrences[0] ?? null;
  const schedule = previewSchedule(form, startAt, fmt, t);
  const cardRef = usePreviewBump(previewSignature(form));
  const title = form.title.trim();
  const description = form.description.trim();
  return (
    <article
      ref={cardRef}
      id={id}
      className={styles.card}
      aria-label={t("gatherings:create.v2.preview.cardLabel")}
    >
      <PreviewCover form={form} />
      <PreviewTopRow form={form} />
      <PreviewDateBlock schedule={schedule} />
      <h3 className={cx(styles.title, !title && styles.titleEmpty)}>
        {title || t("gatherings:create.v2.preview.titlePlaceholder")}
      </h3>
      {description && <p className={styles.description}>{description}</p>}
      <PreviewMetaRow form={form} />
      <PreviewTagRows form={form} occurrenceCount={occurrences.length} />
      <PreviewHostRow form={form} />
      {mode === "attendees" && (
        <PreviewAttendeesBlock
          form={form}
          startAt={startAt}
          occurrenceCount={occurrences.length}
        />
      )}
    </article>
  );
}
