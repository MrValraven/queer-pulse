import { FiArrowRight, FiAward, FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  ACCESSIBILITY_QUESTIONS,
  type AccessibilityAnswerMap,
} from "../marketing/listBusiness/listingAccessibility.data";
import { gatheringPath } from "./data";
import styles from "./CreateGatheringPage.module.css";

/**
 * The published-gathering celebration screen shown once the create wizard's
 * real `createEvent` mutation resolves. Split out of the wizard shell so the
 * shell component stays under the 200-line limit.
 */
export function CreateGatheringSuccess({
  accessibilityAnswers,
  /** Slug the backend assigned (null in demo — the CTA falls back to the board). */
  createdSlug,
}: {
  accessibilityAnswers: AccessibilityAnswerMap;
  createdSlug: string | null;
}) {
  const { t } = useTranslation();
  // Only what the host confirmed is echoed back here. The nos and the
  // unanswered questions are on the gathering's own page, where somebody
  // deciding whether they can get through the door will read them.
  const confirmed = ACCESSIBILITY_QUESTIONS.filter(
    (question) => accessibilityAnswers[question.slug] === "yes",
  );
  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <FiAward />
      </div>
      <div className={styles.successTitle}>
        <Translation
          i18nKey="gatherings:create.success.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.successSub}>{t("gatherings:create.success.body")}</p>
      {confirmed.length > 0 && (
        <div className={styles.successAccess}>
          <span className={styles.successAccessLbl}>
            {t("gatherings:create.success.accessLabel")}
          </span>
          <div className={styles.successAccessTags}>
            {confirmed.map((question) => (
              <span key={question.slug} className={styles.successAccessTag}>
                <FiCheck aria-hidden /> {t(question.labelKey)}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className={styles.successActions}>
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
    </div>
  );
}
