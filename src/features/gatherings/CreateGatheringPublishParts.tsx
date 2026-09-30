import type { KeyboardEvent } from "react";
import { FiAlertCircle, FiArrowRight, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import type { ReadinessItem } from "./createGatheringChapters";
import styles from "./CreateGatheringShell.module.css";

/** One readiness row: a plain line with a jade tick once met, a button to
 *  the field while unmet, marked with an alert and an always-visible Go. The
 *  review chapter lists the unmet ones above the pledges. */
export function ReadinessRow({
  item,
  onJump,
}: {
  item: ReadinessItem;
  onJump: () => void;
}) {
  const { t } = useTranslation();
  const content = (
    <>
      {item.isMet ? (
        <span className={styles.readyDot} aria-hidden>
          <FiCheck />
        </span>
      ) : (
        <span className={styles.readyAlert} aria-hidden>
          <FiAlertCircle />
        </span>
      )}
      <span className="visuallyHidden">
        {t(
          item.isMet
            ? "gatherings:create.v2.ready.itemDone"
            : "gatherings:create.v2.ready.itemTodo",
        )}{" "}
      </span>
      <span>
        {t(item.labelKey)}
        {item.isOptional && !item.isMet && (
          <span className={styles.readyOptional}>
            {" "}
            {t("gatherings:create.v2.ready.optional")}
          </span>
        )}
      </span>
    </>
  );
  if (item.isMet) {
    return (
      <span className={cx(styles.readyRow, styles.readyRowMet)}>{content}</span>
    );
  }
  return (
    <button type="button" className={styles.readyRow} onClick={onJump}>
      {content}
      <span className={styles.readyGo} aria-hidden>
        {t("gatherings:create.v2.ready.go")} <FiArrowRight />
      </span>
      <span className="visuallyHidden">
        {" "}
        {t("gatherings:create.v2.ready.jumpHint")}
      </span>
    </button>
  );
}

/**
 * One publish pledge.
 *
 * The `role="checkbox"` element holds the box and the pledge sentence only,
 * since a checkbox's children are presentational. A pledge with a link (the
 * Code of Care) shows it under the sentence as a sibling, so the link keeps
 * its own place in the accessibility tree and in the tab order.
 */
export function PledgeCheckbox({
  anchorId,
  textKey,
  linkLabelKey,
  isChecked,
  onToggle,
}: {
  /** Put on the focusable checkbox, so a jump lands focus on it. */
  anchorId: string;
  textKey: string;
  /** The label of the Code of Care link, or null for a pledge without one. */
  linkLabelKey: string | null;
  isChecked: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  };
  return (
    <div className={styles.pledge}>
      <div
        id={anchorId}
        className={styles.pledgeControl}
        role="checkbox"
        aria-checked={isChecked}
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.pledgeBox} aria-hidden>
          <FiCheck />
        </span>
        <span>{t(textKey)}</span>
      </div>
      {linkLabelKey && (
        <Link to={routes.codeOfConduct} className={styles.pledgeLink}>
          {t(linkLabelKey)}
        </Link>
      )}
    </div>
  );
}
