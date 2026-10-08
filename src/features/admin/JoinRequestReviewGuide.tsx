import { useState } from "react";
import { FiBookOpen, FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./JoinRequestReviewGuide.module.css";

const STORAGE_KEY = "qp.admin.joinRequestGuide.open";
const STEP_NUMBERS = [1, 2, 3, 4, 5] as const;

const WIDE_SCREEN_QUERY = "(min-width: 600px)";

/** A remembered choice wins. With none stored, open on screens at least 600px
 *  wide and start closed on narrower ones. A missing matchMedia reads as wide
 *  (the test setup stubs it as narrow instead), and blocked storage (private
 *  window, cleared site data) reads as open. */
function readIsOpen(): boolean {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (storedValue === "true") return true;
    if (storedValue === "false") return false;
  } catch {
    return true;
  }
  try {
    if (typeof window.matchMedia !== "function") return true;
    return window.matchMedia(WIDE_SCREEN_QUERY).matches;
  } catch {
    return true;
  }
}

function writeIsOpen(isOpen: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(isOpen));
  } catch {
    // Blocked storage: the panel simply opens again next visit.
  }
}

/**
 * "How to review someone nobody here knows": the five-step checklist and the
 * never-a-reason list from the review rubric (v1.1), above the pending queue.
 * A native <details> so keyboard and screen-reader behaviour come for free;
 * open by default on screens at least 600px wide, and the reviewer's choice is
 * remembered per device.
 */
export function JoinRequestReviewGuide() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(readIsOpen);
  return (
    <details
      className={styles.guide}
      open={isOpen}
      onToggle={(event) => {
        const isNowOpen = event.currentTarget.open;
        if (isNowOpen === isOpen) return;
        setIsOpen(isNowOpen);
        writeIsOpen(isNowOpen);
      }}
    >
      <summary className={styles.summary}>
        <FiBookOpen aria-hidden className={styles.summaryIcon} />
        <span className={styles.summaryText}>
          {t("admin:members.verify.guide.summary")}
        </span>
        <FiChevronDown aria-hidden className={styles.chevron} />
      </summary>
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
    </details>
  );
}
