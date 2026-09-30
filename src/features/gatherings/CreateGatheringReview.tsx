import { useId } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  GATE_ANCHOR,
  PLEDGE_LINK_LABEL_KEYS,
  PLEDGE_TEXT_KEYS,
  confirmAnchor,
} from "./createGathering.data";
import type {
  PublishReadiness,
  ReadinessItem,
} from "./createGatheringChapters";
import { PledgeCheckbox, ReadinessRow } from "./CreateGatheringPublishParts";
import { CreateGatheringReviewRecap } from "./CreateGatheringReviewRecap";
import type { GatheringForm } from "./useGatheringForm";
import shellStyles from "./CreateGatheringShell.module.css";
import styles from "./CreateGatheringReview.module.css";

export interface CreateGatheringReviewProps {
  form: GatheringForm;
  /** From `publishReadiness(form)`. */
  readiness: PublishReadiness;
  isPublishing: boolean;
  /** A group's Edit: open that chapter with focus on its head. */
  onEditChapter: (chapterIndex: number) => void;
  /** An unmet row was pressed: open its chapter and jump to its field. */
  onJumpToItem: (item: ReadinessItem) => void;
  /** The publish button was pressed. It stays focusable while not ready, so
   *  the page answers the press by sending the host to what is missing. */
  onPublish: () => void;
}

/**
 * The review chapter's body: everything the host set, grouped by chapter;
 * what publishing still needs; the two pledges; and Publish with its hint.
 */
export function CreateGatheringReview({
  form,
  readiness,
  isPublishing,
  onEditChapter,
  onJumpToItem,
  onPublish,
}: CreateGatheringReviewProps) {
  const { t } = useTranslation();
  const idBase = useId();
  const { items, requiredItems, metRequiredCount, isReady } = readiness;
  const unmetRequiredItems = requiredItems.filter((item) => !item.isMet);
  const missingPledgeCount = form.checks.filter(
    (isChecked) => !isChecked,
  ).length;
  const accessibilityItem = items.find(
    (item) => item.anchor === GATE_ANCHOR.accessibility,
  );
  const hint = isReady
    ? t("gatherings:create.v2.ready.hintReady")
    : [
        unmetRequiredItems.length > 0 &&
          t("gatherings:create.v2.ready.hintDetails", {
            count: requiredItems.length - metRequiredCount,
          }),
        missingPledgeCount > 0 &&
          t("gatherings:create.v2.ready.hintConfirms", {
            count: missingPledgeCount,
          }),
      ]
        .filter(Boolean)
        .join(" · ");

  return (
    <div className={styles.review}>
      <CreateGatheringReviewRecap
        form={form}
        readinessItems={items}
        onEditChapter={onEditChapter}
        onJumpToItem={onJumpToItem}
        onJumpToAccess={() => {
          if (accessibilityItem) onJumpToItem(accessibilityItem);
        }}
      />
      {unmetRequiredItems.length > 0 && (
        <div
          className={styles.missingItems}
          role="group"
          aria-labelledby={`${idBase}-missing`}
        >
          <p id={`${idBase}-missing`} className={shellStyles.confirmsLabel}>
            {t("gatherings:create.v2.review.missingLabel")}
          </p>
          <ul className={shellStyles.readyList}>
            {unmetRequiredItems.map((item) => (
              <li key={item.key}>
                <ReadinessRow item={item} onJump={() => onJumpToItem(item)} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <div
        className={shellStyles.confirms}
        role="group"
        aria-labelledby={`${idBase}-pledges`}
      >
        <div id={`${idBase}-pledges`} className={shellStyles.confirmsLabel}>
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
      <div className={styles.publish}>
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
      </div>
    </div>
  );
}
