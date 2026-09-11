import { useEffect, useId, useRef } from "react";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ACCESSIBILITY_QUESTIONS } from "../marketing/listBusiness/listingAccessibility.data";
import { gatheringPath } from "./data";
import { gatheringOccurrences } from "./gatheringOccurrences";
import { GatheringPreviewPanel } from "./preview/GatheringPreviewPanel";
import { ShareKitRow } from "./shareKit/ShareKitRow";
import type { GatheringForm } from "./useGatheringForm";
import styles from "./CreateGatheringSuccess.module.css";

/**
 * The published screen, shown once the create wizard's `createEvent` resolves:
 * a plum success panel with the title, a lead that counts a series' dates,
 * the gathering's card, the share kit, the accessibility the host confirmed,
 * and the way on to the board or the gathering's own page.
 */
export function CreateGatheringSuccess({
  form,
  /** Slug the backend assigned. Null in demo, where the share kit stays
   *  hidden and the page CTA falls back to the board. */
  createdSlug,
  /** Every saved date's slug in series order (`[createdSlug]` for a single
   *  gathering). Empty in demo. The calendar file links each date to its own
   *  page from it. */
  occurrenceSlugs,
}: {
  /** The published form, for the share kit and the preview card. */
  form: GatheringForm;
  createdSlug: string | null;
  occurrenceSlugs: string[];
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const accessLabelId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  // The publish button that held focus is gone with the wizard. Focus moves
  // to the heading so a screen reader starts reading from the announcement.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);
  const dateCount = gatheringOccurrences(form).length;
  // Only what the host confirmed is echoed back here. The nos and the
  // unanswered questions are on the gathering's own page, where somebody
  // deciding whether they can get through the door will read them.
  const confirmedQuestions = ACCESSIBILITY_QUESTIONS.filter(
    (question) => form.accessibilityAnswers[question.slug] === "yes",
  );
  return (
    <section className={styles.success} aria-labelledby={headingId}>
      <span className={styles.icon} aria-hidden>
        <FiCheck />
      </span>
      <h1
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className={styles.title}
      >
        <Translation
          i18nKey="gatherings:create.success.title"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={styles.lead}>
        {dateCount > 1
          ? t("gatherings:create.v2.success.leadSeries", { dateCount })
          : t("gatherings:create.v2.success.lead")}
      </p>
      <div className={styles.previewSlot}>
        <GatheringPreviewPanel form={form} variant="success" />
      </div>
      {createdSlug && (
        <ShareKitRow
          form={form}
          slug={createdSlug}
          occurrenceSlugs={occurrenceSlugs}
        />
      )}
      {confirmedQuestions.length > 0 && (
        <div className={styles.access}>
          <p id={accessLabelId} className={styles.accessLabel}>
            {t("gatherings:create.success.accessLabel")}
          </p>
          <ul className={styles.accessTags} aria-labelledby={accessLabelId}>
            {confirmedQuestions.map((question) => (
              <li key={question.slug} className={styles.accessTag}>
                <FiCheck aria-hidden /> {t(question.labelKey)}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className={styles.actions}>
        <Button to={routes.gatherings} variant="ghost-dark">
          {t("gatherings:create.success.viewCta")} <FiArrowRight aria-hidden />
        </Button>
        <Button
          to={createdSlug ? gatheringPath(createdSlug) : routes.gatherings}
          variant="primary"
        >
          {t("gatherings:create.success.eventCta")} <FiArrowRight aria-hidden />
        </Button>
      </div>
    </section>
  );
}
