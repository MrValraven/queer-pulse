import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { QUICK_STEP_COUNT, type QuickStep } from "./quickStartCommunity.model";
import { QUICK_STEP_COPY } from "./quickStartCommunity.data";
import pageStyles from "./StartCommunityPage.module.css";
import styles from "./QuickStartCommunity.module.css";

/** Segment numbers 1 to QUICK_STEP_COUNT, one per meter segment. */
const METER_SEGMENTS = Array.from(
  { length: QUICK_STEP_COUNT },
  (_slot, segmentIndex) => segmentIndex + 1,
);

/** The quick flow's compact header: back link, step count, meter and step title. */
export function QuickStartHeader({ quickStep }: { quickStep: QuickStep }) {
  const { t } = useTranslation();
  const copy = QUICK_STEP_COPY[quickStep];
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef(quickStep);
  // A step change moves focus to the new title, so a screen reader announces
  // the step. The first mount keeps the page's normal focus. The page scrolls
  // to the top itself, so the focus call leaves the scroll where it is.
  useEffect(() => {
    if (previousStepRef.current === quickStep) return;
    previousStepRef.current = quickStep;
    titleRef.current?.focus({ preventScroll: true });
  }, [quickStep]);
  return (
    <div className={styles.header}>
      <Link to={routes.communities} className={styles.backLink}>
        <FiArrowLeft aria-hidden /> {t("communities:start.hero.back")}
      </Link>
      <p className={styles.stepOf}>
        {t("communities:start.quick.stepOf", {
          step: quickStep,
          total: QUICK_STEP_COUNT,
        })}
      </p>
      <div className={styles.meter} aria-hidden="true">
        {METER_SEGMENTS.map((segment) => (
          <span
            key={segment}
            className={[
              styles.meterSegment,
              segment <= quickStep && styles.meterSegmentFilled,
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>
      <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
        {t(copy.titleKey)}
      </h1>
      <p className={styles.lead}>{t(copy.leadKey)}</p>
    </div>
  );
}

/** The sticky bottom bar: what is still needed, then Back and Next. */
export function QuickStartFooter({
  quickStep,
  missing,
  onBack,
  onNext,
}: {
  quickStep: QuickStep;
  missing: string[];
  onBack: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const isBlocked = missing.length > 0;
  return (
    <div className={styles.footer}>
      <Collapse isOpen={isBlocked}>
        <div className={[pageStyles.neededBar, styles.neededBar].join(" ")}>
          <FiAlertCircle size={15} aria-hidden />
          <span className={styles.neededLabel}>
            {t("communities:start.actions.stillNeeded")}
          </span>
          <span
            className={[pageStyles.neededChips, styles.neededChips].join(" ")}
          >
            {missing.map((missingKey) => (
              <span
                key={missingKey}
                className={[pageStyles.neededChip, styles.neededChip].join(" ")}
              >
                {t(missingKey)}
              </span>
            ))}
          </span>
        </div>
      </Collapse>
      <div className={styles.footerActions}>
        <Button variant="ghost" className={styles.footerBack} onClick={onBack}>
          {quickStep === 1 ? (
            t("communities:start.cancel")
          ) : (
            <>
              <FiArrowLeft aria-hidden /> {t("communities:start.back")}
            </>
          )}
        </Button>
        <Button
          variant="primary"
          className={styles.footerNext}
          onClick={onNext}
          disabled={isBlocked}
          title={
            isBlocked ? t("communities:start.actions.blockedTitle") : undefined
          }
        >
          {t(QUICK_STEP_COPY[quickStep].nextLabelKey)}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}
