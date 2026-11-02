import { useId } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button, Collapse } from "../../../shared/components/ui";
import type { TFunction } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PLEDGE_LINK_LABEL_KEYS } from "../createGathering.data";
import { PledgeCheckbox } from "../CreateGatheringPublishParts";
import { ADD_MONTH_SECTION_IDS } from "./addMonth.data";
import type { AddMonthBlock } from "./addMonthState";
import { EVENT_BATCH_FAILURE_KEYS } from "./eventBatchErrors";
import styles from "./AddMonthPublish.module.css";

/** The two pledges in the plural, since one press publishes every date.
 *  Index-aligned with the wizard's `PLEDGE_LINK_LABEL_KEYS`, so the Code of
 *  Care pledge keeps its link. */
const ADD_MONTH_PLEDGE_TEXT_KEYS: readonly [string, string] = [
  "gatherings:addMonth.publish.pledges.codeOfCare",
  "gatherings:addMonth.publish.pledges.accessibility",
];

/** DOM ids of the two pledges, index-aligned with
 *  `ADD_MONTH_PLEDGE_TEXT_KEYS`, so a press on the blocked button can move
 *  focus to the first open pledge. */
export const ADD_MONTH_PLEDGE_ANCHORS: readonly [string, string] = [
  "add-month-pledge-0",
  "add-month-pledge-1",
];

/** DOM id of the Publish heading, for the page's `aria-labelledby`. */
export const ADD_MONTH_PUBLISH_HEADING_ID = `${ADD_MONTH_SECTION_IDS.publish}-heading`;

/** The reason line for each block. A month over the size limit reads the
 *  same key as the 413 failure panel, so both name the cause in one sentence. */
const BLOCK_REASON_KEYS: Record<AddMonthBlock["reason"], string> = {
  noTemplate: "gatherings:addMonth.publish.block.noTemplate",
  templateLoading: "gatherings:addMonth.publish.block.templateLoading",
  noDates: "gatherings:addMonth.publish.block.noDates",
  sharedInvalid: "gatherings:addMonth.publish.block.sharedInvalid",
  rowsInvalid: "gatherings:addMonth.publish.block.rowsInvalid",
  tooLarge: EVENT_BATCH_FAILURE_KEYS.tooLarge,
  pledgesOpen: "gatherings:addMonth.publish.block.pledgesOpen",
};

function blockReasonText(block: AddMonthBlock, t: TFunction): string {
  if (block.reason === "rowsInvalid") {
    return t(BLOCK_REASON_KEYS.rowsInvalid, { count: block.invalidRowCount });
  }
  return t(BLOCK_REASON_KEYS[block.reason]);
}

interface AddMonthPublishSectionProps {
  /** How many dates the button publishes. */
  count: number;
  pledges: [boolean, boolean];
  onTogglePledge: (index: 0 | 1) => void;
  /** Why publishing is held back, or null when the month is ready. */
  block: AddMonthBlock | null;
  isPublishing: boolean;
  onPublish: () => void;
  /** A press while blocked, so the page can scroll to the first problem. */
  onBlockedPress: () => void;
}

/**
 * The last section of the page: the two pledges, the Publish button and the
 * line that says why it is held back. A blocked button stays focusable
 * (`aria-disabled`), so a press can still reach `onBlockedPress`.
 */
export function AddMonthPublishSection({
  count,
  pledges,
  onTogglePledge,
  block,
  isPublishing,
  onPublish,
  onBlockedPress,
}: AddMonthPublishSectionProps) {
  const { t } = useTranslation();
  const reasonId = useId();
  const pledgesLabelId = useId();
  const isBlocked = block !== null;
  const reasonText = block ? blockReasonText(block, t) : null;

  const handlePress = () => {
    if (isPublishing) return;
    if (isBlocked) {
      onBlockedPress();
      return;
    }
    onPublish();
  };

  return (
    <div className={styles.publish}>
      <h2 id={ADD_MONTH_PUBLISH_HEADING_ID} className={styles.heading}>
        {t("gatherings:addMonth.publish.heading")}
      </h2>
      <div
        className={styles.pledges}
        role="group"
        aria-labelledby={pledgesLabelId}
      >
        <div id={pledgesLabelId} className={styles.pledgesLabel}>
          {t("gatherings:create.v2.ready.pledgesLabel")}
        </div>
        {ADD_MONTH_PLEDGE_TEXT_KEYS.map((textKey, index) => {
          const pledgeIndex = index === 0 ? 0 : 1;
          return (
            <PledgeCheckbox
              key={textKey}
              anchorId={ADD_MONTH_PLEDGE_ANCHORS[pledgeIndex]}
              textKey={textKey}
              linkLabelKey={PLEDGE_LINK_LABEL_KEYS[index] ?? null}
              isChecked={pledges[pledgeIndex]}
              onToggle={() => onTogglePledge(pledgeIndex)}
            />
          );
        })}
      </div>
      <Button
        size="lg"
        className={styles.publishButton}
        aria-disabled={isBlocked || isPublishing ? "true" : undefined}
        aria-busy={isPublishing ? "true" : undefined}
        aria-describedby={isBlocked ? reasonId : undefined}
        onClick={handlePress}
      >
        {t(
          isPublishing
            ? "gatherings:addMonth.publish.publishing"
            : "gatherings:addMonth.publish.button",
          { count },
        )}
      </Button>
      <div id={reasonId} aria-live="polite">
        <Collapse isOpen={reasonText !== null}>
          <p className={styles.reason}>
            <FiAlertCircle className={styles.reasonIcon} aria-hidden />
            <span>{reasonText}</span>
          </p>
        </Collapse>
      </div>
      <p className={styles.allTogether}>
        {t("gatherings:addMonth.publish.allTogether")}
      </p>
    </div>
  );
}
