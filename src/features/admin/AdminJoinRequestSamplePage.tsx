import { useMemo, useState } from "react";
import { useAuth } from "../../app/providers/authContext";
import {
  Button,
  FadeIn,
  FormField,
  Select,
  SkeletonLine,
} from "../../shared/components/ui";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SAMPLE_SIZES, useJoinRequestSample } from "./api/useJoinRequestSample";
import type { JoinRequestView } from "./api/useJoinRequests";
import { JoinRequestSampleCard } from "./JoinRequestSampleCard";
import queueStyles from "./AdminMembersPage.module.css";
import styles from "./JoinRequestSample.module.css";

/** The "no filter" value of the reviewer picker. Not a reviewer id, and not an
 *  empty string, which `Select` would read as nothing chosen. */
const EVERY_REVIEWER = "all";

/**
 * The reviewers whose decisions are in the current draw, in the order they
 * first appear, each labelled the same way the card labels them: "You" for the
 * signed-in reviewer, then the resolved name, then the id-derived reference for
 * a row that arrived without one.
 *
 * Rows with no reviewer on them contribute no option: there is no such person
 * to read a run of calls from.
 */
function reviewersInDraw(
  items: JoinRequestView[],
  currentUserId: string | null,
  t: TFunction,
): { value: string; label: string }[] {
  const labelByReviewerId = new Map<string, string>();
  for (const item of items) {
    if (!item.reviewedBy || labelByReviewerId.has(item.reviewedBy)) continue;
    labelByReviewerId.set(
      item.reviewedBy,
      item.reviewedBy === currentUserId
        ? t("admin:members.sample.reviewerYou")
        : (item.reviewedByName ??
            t("admin:members.sample.reviewerOther", {
              reference: item.reviewedBy.slice(0, 8),
            })),
    );
  }
  return [...labelByReviewerId].map(([value, label]) => ({ value, label }));
}

/**
 * Quality sample: a random handful of already-decided invite requests, so the
 * people working the queue can read each other's calls and check the bar is
 * being applied the same way by everyone.
 *
 * READ-ONLY, and deliberately so. It pulls `GET /admin/join-requests/sample`
 * and renders it; there is no decision action anywhere on this surface, so
 * nothing sampled can be overturned from here. It records no second signoff
 * either: it exists to give two reviewers the same rows to talk about, beside
 * the review guidelines.
 *
 * The size picker only offers sizes inside the 1-50 the server's
 * `SampleJoinRequestsQuery` allows, and "show a different sample" is a new draw
 * rather than a refetch of the same one (see `useJoinRequestSample`).
 *
 * The reviewer picker narrows the SAME draw rather than asking for a new one:
 * spotting a different reading of the guidelines is easier when one person's
 * calls sit together. It names reviewers and nothing else: no counts, no
 * ranking, no throughput. It only appears once a draw actually holds calls from
 * more than one person.
 */
export function AdminJoinRequestSamplePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const [size, setSize] = useState<number>(10);
  const [rerollToken, setRerollToken] = useState(0);
  const [reviewerId, setReviewerId] = useState<string>(EVERY_REVIEWER);
  const { data, isLoading, isFetching, isError } = useJoinRequestSample(
    size,
    rerollToken,
  );
  const items = useMemo(() => data ?? [], [data]);

  const sizeOptions = SAMPLE_SIZES.map((option) => ({
    value: String(option),
    label: t("admin:members.sample.sizeOption", { count: option }),
  }));

  const reviewerOptions = useMemo(
    () => reviewersInDraw(items, currentUserId, t),
    [items, currentUserId, t],
  );
  // A new draw can leave the picked reviewer out of it. Rather than silently
  // resetting the filter (which would look like it never applied), the choice
  // stands and the empty state below says what happened.
  const isReviewerFiltered =
    reviewerId !== EVERY_REVIEWER && reviewerOptions.length > 1;
  const visibleItems = isReviewerFiltered
    ? items.filter((item) => item.reviewedBy === reviewerId)
    : items;

  return (
    <div>
      <p className={queueStyles.queueIntro}>
        {t("admin:members.sample.intro")}
      </p>
      <p className={queueStyles.queueIntroEm}>
        <em>{t("admin:members.sample.explainer")}</em>
      </p>
      <p className={styles.note}>{t("admin:members.sample.readOnlyNote")}</p>

      <div className={styles.controls}>
        <FormField
          label={t("admin:members.sample.sizeLabel")}
          className={styles.sizeField}
        >
          <Select
            multiple={false}
            value={String(size)}
            onChange={(value) => {
              setSize(Number(value));
              setRerollToken((token) => token + 1);
            }}
            options={sizeOptions}
            searchable={false}
            size="md"
          />
        </FormField>
        {reviewerOptions.length > 1 && (
          <FormField
            label={t("admin:members.sample.reviewerFilterLabel")}
            className={styles.reviewerField}
          >
            <Select
              multiple={false}
              value={reviewerId}
              // `Select` can hand back null when a choice is cleared; the
              // filter has no "nothing chosen" state, so that reads as
              // everyone.
              onChange={(value) => setReviewerId(value ?? EVERY_REVIEWER)}
              options={[
                {
                  value: EVERY_REVIEWER,
                  label: t("admin:members.sample.reviewerFilterAll"),
                },
                ...reviewerOptions,
              ]}
              searchable={false}
              size="md"
            />
          </FormField>
        )}
        <Button
          variant="ghost"
          size="md"
          onClick={() => setRerollToken((token) => token + 1)}
          disabled={isFetching}
        >
          {t("admin:members.sample.resampleCta")}
        </Button>
      </div>

      {reviewerOptions.length > 1 && (
        <p className={styles.note}>
          {t("admin:members.sample.reviewerFilterHint")}
        </p>
      )}

      {isLoading ? (
        <div className={queueStyles.queueGrid}>
          {[0, 1, 2].map((placeholder) => (
            <div className={queueStyles.queueCard} key={placeholder}>
              <SkeletonLine width="55%" height={18} />
              <SkeletonLine width="80%" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className={queueStyles.queueIntro} role="status">
          {t("admin:members.sample.loadError")}
        </p>
      ) : items.length === 0 ? (
        <p className={queueStyles.queueIntro}>
          {t("admin:members.sample.empty")}
        </p>
      ) : visibleItems.length === 0 ? (
        <p className={queueStyles.queueIntro} role="status">
          {t("admin:members.sample.reviewerFilterEmpty")}
        </p>
      ) : (
        <div className={queueStyles.queueGrid}>
          {visibleItems.map((item, index) => (
            <FadeIn key={item.id} delay={index * 60}>
              <JoinRequestSampleCard
                item={item}
                currentUserId={currentUserId}
              />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
