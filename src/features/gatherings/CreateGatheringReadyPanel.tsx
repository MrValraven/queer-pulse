import { useId, type KeyboardEvent } from "react";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import { CreateGatheringReadback } from "./CreateGatheringReadback";
import {
  GATE_ANCHOR,
  PLEDGE_LINK_LABEL_KEYS,
  PLEDGE_TEXT_KEYS,
  READY_PANEL_ANCHOR,
  confirmAnchor,
} from "./createGathering.data";
import type { ReadinessItem } from "./createGatheringChapters";
import type { GatheringForm } from "./useGatheringForm";
import styles from "./CreateGatheringShell.module.css";

export interface CreateGatheringReadyPanelProps {
  form: GatheringForm;
  /** From `readinessItems(form)`. */
  items: ReadinessItem[];
  /** Every required row met and both pledges ticked. */
  isReady: boolean;
  isPublishing: boolean;
  /** An unmet row was pressed: open its chapter and jump to its field. */
  onJumpToItem: (item: ReadinessItem) => void;
  /** The publish button was pressed. It stays focusable while not ready, so
   *  the page answers the press by sending the host to what is missing. */
  onPublish: () => void;
}

/** "Ready to publish?": the readiness rows, the host's answers read back, the
 *  two pledges and the publish button with its hint line. */
export function CreateGatheringReadyPanel({
  form,
  items,
  isReady,
  isPublishing,
  onJumpToItem,
  onPublish,
}: CreateGatheringReadyPanelProps) {
  const { t } = useTranslation();
  const idBase = useId();
  const requiredItems = items.filter((item) => !item.isOptional);
  const metRequiredCount = requiredItems.filter((item) => item.isMet).length;
  const missingDetailCount = requiredItems.length - metRequiredCount;
  const missingPledgeCount = form.checks.filter(
    (isChecked) => !isChecked,
  ).length;
  const accessibilityItem = items.find(
    (item) => item.anchor === GATE_ANCHOR.accessibility,
  );
  const hint = isReady
    ? t("gatherings:create.v2.ready.hintReady")
    : [
        missingDetailCount > 0 &&
          t("gatherings:create.v2.ready.hintDetails", {
            count: missingDetailCount,
          }),
        missingPledgeCount > 0 &&
          t("gatherings:create.v2.ready.hintConfirms", {
            count: missingPledgeCount,
          }),
      ]
        .filter(Boolean)
        .join(" · ");

  return (
    <section
      id={READY_PANEL_ANCHOR}
      className={styles.ready}
      aria-labelledby={`${idBase}-title`}
      tabIndex={-1}
    >
      <h2 id={`${idBase}-title`} className={styles.readyTitle}>
        <span>
          <Translation
            i18nKey="gatherings:create.v2.ready.title"
            components={{ em: <em /> }}
          />
        </span>
        <span className={styles.readyCount}>
          {t("gatherings:create.v2.ready.count", {
            met: metRequiredCount,
            total: requiredItems.length,
          })}
        </span>
      </h2>
      <ul className={styles.readyList}>
        {items.map((item) => (
          <li key={item.key}>
            <ReadinessRow item={item} onJump={() => onJumpToItem(item)} />
          </li>
        ))}
      </ul>
      <CreateGatheringReadback
        form={form}
        onJumpToAccess={() => {
          if (accessibilityItem) onJumpToItem(accessibilityItem);
        }}
      />
      <div
        className={styles.confirms}
        role="group"
        aria-labelledby={`${idBase}-pledges`}
      >
        <div id={`${idBase}-pledges`} className={styles.confirmsLabel}>
          {t("gatherings:create.v2.ready.pledgesLabel")}
        </div>
        {PLEDGE_TEXT_KEYS.map((textKey, index) => (
          <PledgeCheckbox
            key={textKey}
            anchorId={confirmAnchor(index)}
            textKey={textKey}
            linkLabelKey={PLEDGE_LINK_LABEL_KEYS[index] ?? null}
            isChecked={form.checks[index] ?? false}
            onToggle={() => form.toggleCheck(index)}
          />
        ))}
      </div>
      <Button
        className={styles.publishButton}
        aria-disabled={!isReady || isPublishing}
        aria-describedby={`${idBase}-hint`}
        onClick={onPublish}
      >
        {isPublishing ? (
          t("gatherings:create.v2.ready.publishing")
        ) : (
          <>
            {t("gatherings:create.nav.publish")} <FiArrowRight aria-hidden />
          </>
        )}
      </Button>
      <p id={`${idBase}-hint`} className={styles.publishHint}>
        {hint}
      </p>
    </section>
  );
}

/** One readiness row: a plain line once met, a button to the field while
 *  unmet. */
function ReadinessRow({
  item,
  onJump,
}: {
  item: ReadinessItem;
  onJump: () => void;
}) {
  const { t } = useTranslation();
  const content = (
    <>
      <span className={styles.readyDot} aria-hidden>
        <FiCheck />
      </span>
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
function PledgeCheckbox({
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
