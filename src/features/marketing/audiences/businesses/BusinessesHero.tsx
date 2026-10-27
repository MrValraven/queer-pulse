import { useMemo } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { DirectoryReviewCard } from "../../DirectoryReviewCard";
import { AudienceHeroCopy } from "../shared/AudienceHeroCopy";
import type { AudienceMemberAction } from "../shared/audiences.data";
import { ShowcaseFrame } from "../shared/ShowcaseFrame";
import {
  buildSampleBusiness,
  buildSampleThread,
  SAMPLE_BUSINESS_NAME,
} from "./businessesSample.data";
import { SampleBusinessCard } from "./SampleBusinessCard";
import { SampleMailboxThread } from "./SampleMailboxThread";
import styles from "./BusinessesHero.module.css";

/**
 * The businesses hero: a striped awning over the copy column and a shop
 * window of real directory pieces with sample content. The card hangs like a
 * shop sign, the review with the owner's reply sits below it, and the
 * business inbox leans in from the side. On phones the card leads, the
 * review follows, and the thread stays off the small screen.
 */
export function BusinessesHero({
  memberActions,
}: {
  memberActions: readonly AudienceMemberAction[];
}) {
  const { t } = useTranslation();
  const place = useMemo(() => buildSampleBusiness(t, "place", new Date()), [t]);
  const thread = useMemo(() => buildSampleThread(t), [t]);
  const review = place.reviews[0];

  return (
    <div className={styles.hero}>
      <div className={styles.awning} aria-hidden="true" />
      <div className={styles.inner}>
        <AudienceHeroCopy
          audience="businesses"
          eyebrow={t("forBusinesses:hero.eyebrow")}
          titleKey="forBusinesses:hero.title"
          lede={t("forBusinesses:hero.lede")}
          memberActions={memberActions}
          className={styles.copy}
        />
        <div className={styles.window}>
          <ShowcaseFrame
            label={t("forBusinesses:hero.frame.card", {
              name: SAMPLE_BUSINESS_NAME,
            })}
            className={`${styles.frame} ${styles.cardFrame}`}
          >
            <SampleBusinessCard place={place} />
          </ShowcaseFrame>
          {review && (
            <ShowcaseFrame
              label={t("forBusinesses:hero.frame.review")}
              className={`${styles.frame} ${styles.reviewFrame}`}
            >
              <div className={styles.reviewStage}>
                <DirectoryReviewCard
                  review={review}
                  slug={place.slug}
                  placeName={place.name}
                  preview
                />
              </div>
            </ShowcaseFrame>
          )}
          <ShowcaseFrame
            label={t("forBusinesses:hero.frame.thread")}
            className={`${styles.frame} ${styles.threadFrame}`}
          >
            <SampleMailboxThread
              businessName={SAMPLE_BUSINESS_NAME}
              messages={thread}
            />
          </ShowcaseFrame>
        </div>
      </div>
    </div>
  );
}
