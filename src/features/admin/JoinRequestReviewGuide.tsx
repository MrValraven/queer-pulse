import { useId, useState } from "react";
import { FiBookOpen, FiChevronDown } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./JoinRequestReviewGuide.module.css";

const STORAGE_KEY = "qp.admin.joinRequestGuide.open";
const STEP_NUMBERS = [1, 2, 3, 4, 5] as const;

/** A remembered choice wins. With none stored the guide starts closed, so the
 *  requests themselves are the first thing a reviewer sees. Blocked storage
 *  (private window, cleared site data) reads as closed. */
function readIsOpen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeIsOpen(isOpen: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(isOpen));
  } catch {
    // Blocked storage: the panel starts closed again next visit.
  }
}

/**
 * "How to review someone nobody here knows": the five-step checklist and the
 * never-a-reason list from the review rubric (v1.1), above the pending queue.
 * A disclosure button over a `Collapse`, so opening and closing glide in
 * height (a native <details> hides its content the instant it closes, so it
 * cannot animate shut). Closed by default, and the reviewer's choice is
 * remembered per device.
 */
export function JoinRequestReviewGuide() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(readIsOpen);
  const panelId = useId();
  const toggle = () => {
    const isNowOpen = !isOpen;
    setIsOpen(isNowOpen);
    writeIsOpen(isNowOpen);
  };
  return (
    <section className={styles.guide}>
      <button
        type="button"
        className={styles.summary}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
      >
        <FiBookOpen aria-hidden className={styles.summaryIcon} />
        <span className={styles.summaryText}>
          {t("admin:members.verify.guide.summary")}
        </span>
        <FiChevronDown
          aria-hidden
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        />
      </button>
      <Collapse isOpen={isOpen}>
        <div id={panelId}>
          <ol className={styles.steps}>
            {STEP_NUMBERS.map((stepNumber) => (
              <li key={stepNumber} className={styles.step}>
                <span className={styles.stepNumber}>{stepNumber}</span>
                <p className={styles.stepText}>
                  <strong className={styles.stepTitle}>
                    {t(`admin:members.verify.guide.step${stepNumber}Title`)}
                  </strong>{" "}
                  {t(`admin:members.verify.guide.step${stepNumber}Body`)}
                </p>
              </li>
            ))}
          </ol>
          <div className={styles.never}>
            <p className={styles.neverTitle}>
              {t("admin:members.verify.guide.neverTitle")}
            </p>
            <p className={styles.neverBody}>
              {t("admin:members.verify.guide.neverBody")}
            </p>
          </div>
          <p className={styles.rubric}>
            {t("admin:members.verify.guide.rubricVersion")}
          </p>
        </div>
      </Collapse>
    </section>
  );
}
