import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GATE_ANCHOR } from "./createGathering.data";
import {
  AccessReviewGroup,
  CareReviewGroup,
  WhoReviewGroup,
  type ReviewGroupProps,
} from "./CreateGatheringReviewGroups";
import {
  ReviewGroup,
  ReviewRow,
  ReviewRows,
} from "./CreateGatheringReviewParts";
import { hasAnyDetail } from "./gatheringCatalog";
import { gatheringOccurrences } from "./gatheringOccurrences";
import { GatheringGoodToKnowRows } from "./GatheringGoodToKnow";
import {
  isOnlineGathering,
  previewKind,
  previewPlace,
} from "./preview/gatheringPreviewReading";
import {
  reviewRepeatText,
  reviewWhenText,
  unmetItemFor,
} from "./reviewRecapReadings";
import styles from "./CreateGatheringReview.module.css";

export interface CreateGatheringReviewRecapProps extends ReviewGroupProps {
  /** "N questions not answered yet": open Access at its questions. */
  onJumpToAccess: () => void;
}

/** Everything the host set, one group per chapter, each with a way back. */
export function CreateGatheringReviewRecap({
  onJumpToAccess,
  ...groupProps
}: CreateGatheringReviewRecapProps) {
  return (
    <div className={styles.recap}>
      <WhatReviewGroup {...groupProps} />
      <WhenWhereReviewGroup {...groupProps} />
      <WhoReviewGroup {...groupProps} />
      <AccessReviewGroup {...groupProps} onJumpToAccess={onJumpToAccess} />
      <CareReviewGroup {...groupProps} />
    </div>
  );
}

/** The jump a required row offers while publishing waits on its field, or
 *  undefined once the field is met. */
function neededJump(
  { readinessItems, onJumpToItem }: ReviewGroupProps,
  anchors: readonly string[],
): (() => void) | undefined {
  const unmetItem = unmetItemFor(readinessItems, anchors);
  return unmetItem ? () => onJumpToItem(unmetItem) : undefined;
}

/** Format, title, description and cover, then the format's own "Good to
 *  know" answers in the sentences the gathering page will show. */
function WhatReviewGroup(props: ReviewGroupProps) {
  const { form, onEditChapter } = props;
  const { t } = useTranslation();
  const formatDetails = form.submittedFormatDetails;
  return (
    <ReviewGroup
      title={t("gatherings:create.v2.review.group.what")}
      chapterId="what"
      onEditChapter={onEditChapter}
    >
      <ReviewRows>
        <ReviewRow
          label={t("gatherings:create.v2.review.row.format")}
          value={previewKind(form, t).label ?? ""}
          onJumpToNeeded={neededJump(props, [
            GATE_ANCHOR.type,
            GATE_ANCHOR.format,
          ])}
        />
        <ReviewRow
          label={t("gatherings:create.step1.titleLabel")}
          value={form.title}
          onJumpToNeeded={neededJump(props, [GATE_ANCHOR.title])}
        />
        <ReviewRow
          label={t("gatherings:create.v2.review.row.description")}
          value={form.description}
          isMultiline
        />
        <ReviewRow
          label={t("gatherings:create.v2.review.row.cover")}
          value={
            form.coverImageUrl
              ? t("gatherings:create.v2.review.value.added")
              : ""
          }
        />
      </ReviewRows>
      {formatDetails && hasAnyDetail(formatDetails) && (
        <div className={styles.goodToKnow}>
          <p className={styles.subLabel}>
            {t("gatherings:catalog.goodToKnow.title")}
          </p>
          <GatheringGoodToKnowRows details={formatDetails} />
        </div>
      )}
    </ReviewGroup>
  );
}

/** Date and time, the repeat schedule, and where it happens. */
function WhenWhereReviewGroup(props: ReviewGroupProps) {
  const { form, onEditChapter } = props;
  const { t } = useTranslation();
  const fmt = useFormat();
  const occurrences = gatheringOccurrences(form);
  const startAt = occurrences[0] ?? null;
  return (
    <ReviewGroup
      title={t("gatherings:create.v2.review.group.whenWhere")}
      chapterId="whenWhere"
      onEditChapter={onEditChapter}
    >
      <ReviewRows>
        <ReviewRow
          label={t("gatherings:create.v2.review.row.when")}
          value={reviewWhenText(form, startAt, fmt, t)}
          onJumpToNeeded={neededJump(props, [GATE_ANCHOR.date])}
        />
        <ReviewRow
          label={t("gatherings:create.v2.review.row.repeats")}
          value={reviewRepeatText(form, occurrences.length, t)}
          onJumpToNeeded={neededJump(props, [GATE_ANCHOR.recurrence])}
        />
        <ReviewRow
          label={t("gatherings:create.v2.review.row.where")}
          value={previewPlace(form, t) ?? ""}
        />
        {isOnlineGathering(form) && (
          <ReviewRow
            label={t("gatherings:create.v2.review.row.joinLink")}
            value={form.onlineUrl}
            onJumpToNeeded={neededJump(props, [GATE_ANCHOR.joinLink])}
          />
        )}
      </ReviewRows>
    </ReviewGroup>
  );
}
