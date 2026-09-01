import { FiBriefcase, FiEdit3, FiPlus, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  Button,
  EmptyState,
  LoadErrorState,
  Stars,
  Tabs,
  type Tab,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import type { CompanyProfile } from "./companies.data";
import type { Job } from "./jobs.data";
import type { CompanyReviewView } from "./api/companyReviewView";
import { CompanyReviewReply } from "./CompanyReviewReply";
import { ReportSubjectControl } from "../safety/ReportSubjectControl";
import { deadlineText } from "./api/jobs.adapters";
import styles from "./CompanyPage.module.css";

type TabId = "about" | "jobs" | "reviews" | "work";

function AboutPane({ profile }: { profile: CompanyProfile }) {
  return (
    <>
      <div className={styles.prose}>{profile.about}</div>
      <div className={styles.values}>
        {profile.values.map((value) => (
          <div key={value.title} className={styles.val}>
            <h4>{value.title}</h4>
            <p>{value.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function JobsPane({ jobs, postHref }: { jobs: Job[]; postHref: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<FiBriefcase />}
        title={t("economy:company.jobs.empty.title")}
        description={t("economy:company.jobs.empty.description")}
        action={{ label: t("economy:company.jobs.postRole"), to: postHref }}
      />
    );
  }
  return (
    <div className={styles.jobs}>
      <div className={styles.jobsHead}>
        <Button variant="ghost" size="md" to={postHref}>
          <FiPlus aria-hidden /> {t("economy:company.jobs.postRole")}
        </Button>
      </div>
      {jobs.map((job) => (
        <Link
          key={job.slug}
          to={`${routes.jobs}/${job.slug}`}
          className={styles.job}
        >
          <div>
            <h3>{job.title}</h3>
            <div className={styles.jobMeta}>
              <span>{job.type}</span>
              <span>{job.location}</span>
              <span className={styles.jade}>{job.salary}</span>
            </div>
          </div>
          <div className={styles.jobR}>
            <b>
              {t("economy:jobs.card.applyBy", {
                date: deadlineText(job.deadline, t, fmt),
              })}
            </b>
            {job.detail.category}
          </div>
        </Link>
      ))}
    </div>
  );
}

function ReviewsPane({
  profile,
  reviews,
  reviewCount,
  onWrite,
  hasMore,
  onLoadMore,
  isLoadingMore,
  hasError,
  onRetry,
  isOwner,
}: {
  profile: CompanyProfile;
  reviews: CompanyReviewView[];
  reviewCount: number;
  onWrite: () => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasError: boolean;
  onRetry: () => void;
  /** The viewer owns this company, so they may write the employer reply. False
   *  for everyone else and for an unclaimed company, which has no owner. */
  isOwner: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <>
      <div className={styles.revSummary}>
        <div>
          <div className={styles.revScore}>
            <em>{profile.reviewScore}</em>
          </div>
          <div className={styles.revScoreOut}>
            {t("economy:company.reviews.outOf5", { count: reviewCount })}
          </div>
        </div>
        <div className={styles.revBars}>
          {profile.reviewBars.map((bar) => (
            <div key={bar.label} className={styles.revBar}>
              <span>{bar.label}</span>
              <div className={styles.revBarTrack}>
                <span
                  className={styles.revBarFill}
                  style={{ width: `${bar.percent}%` }}
                />
              </div>
              <span>
                <b>{bar.score}</b>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.jobsHead}>
        <Button variant="ghost" size="md" onClick={onWrite}>
          <FiEdit3 aria-hidden /> {t("economy:company.reviews.writeReview")}
        </Button>
      </div>
      {hasError && reviews.length === 0 ? (
        // The reviews list is this tab's whole content, so a failed fetch says
        // so rather than "no reviews yet", which reads as an employer nobody
        // has reviewed (DES-22).
        <LoadErrorState
          title={t("economy:company.reviews.loadError.title")}
          description={t("economy:company.reviews.loadError.description")}
          onRetry={onRetry}
        />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<FiStar />}
          title={t("economy:company.reviews.empty.title")}
          description={t("economy:company.reviews.empty.description")}
          action={{
            label: t("economy:company.reviews.writeReview"),
            onClick: onWrite,
          }}
        />
      ) : (
        <div className={styles.revList}>
          {reviews.map((review, reviewIndex) => (
            <div
              key={review.id ?? `${review.title}-${reviewIndex}`}
              className={styles.rev}
            >
              <div className={styles.revHead}>
                <div className={styles.revTitle}>{review.title}</div>
                <Stars
                  value={review.stars}
                  label={t("economy:company.reviews.starsAriaLabel", {
                    count: review.stars,
                  })}
                />
              </div>
              <div className={styles.revByline}>{review.byline}</div>
              <div className={styles.revBody}>
                {review.body.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
              {review.editedAt && (
                <div className={styles.revEdited}>
                  {t("economy:company.reviews.editedOn", {
                    date: fmt.date(new Date(review.editedAt), {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  })}
                </div>
              )}
              <CompanyReviewReply
                review={review}
                companySlug={profile.slug}
                isOwner={isOwner}
              />
              {/* One report subject covers the review AND the employer reply
                  under it, exactly as the directory treats its own reviews: a
                  reply read without the review it answers is not the same
                  statement. Demo fixtures have no id and so no control. */}
              {review.id && (
                <div className={styles.reviewReport}>
                  <ReportSubjectControl
                    subjectType="review"
                    subjectId={review.id}
                    subjectName={review.title}
                    label={t("economy:company.reviews.report.cta")}
                    ariaLabel={t("economy:company.reviews.report.ariaLabel", {
                      title: review.title,
                    })}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {hasMore && (
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            disabled={isLoadingMore}
            onClick={onLoadMore}
          >
            {isLoadingMore
              ? t("economy:company.reviews.loadingMore")
              : t("economy:company.reviews.loadMoreCta")}
          </Button>
        </div>
      )}
    </>
  );
}

function WorkPane({ work }: { work: NonNullable<CompanyProfile["work"]> }) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.prose}>
        <p>{t("economy:company.work.intro")}</p>
      </div>
      <div className={styles.workGrid}>
        {work.map((slot) => (
          <div key={slot.label} className={styles.workTile}>
            {slot.label}
          </div>
        ))}
      </div>
    </>
  );
}

export function CompanyTabs({
  profile,
  jobs,
  reviews,
  reviewCount,
  onWriteReview,
  hasMoreReviews,
  onLoadMoreReviews,
  isLoadingMoreReviews,
  hasReviewsError,
  onRetryReviews,
  isOwner,
  tab,
  setTab,
}: {
  profile: CompanyProfile;
  jobs: Job[];
  reviews: CompanyReviewView[];
  reviewCount: number;
  onWriteReview: () => void;
  hasMoreReviews: boolean;
  onLoadMoreReviews: () => void;
  isLoadingMoreReviews: boolean;
  hasReviewsError: boolean;
  onRetryReviews: () => void;
  isOwner: boolean;
  tab: TabId;
  setTab: (t: TabId) => void;
}) {
  const { t } = useTranslation();
  const tabs: Tab[] = [
    { id: "about", label: t("economy:company.tabs.about") },
    {
      id: "jobs",
      label: t("economy:company.tabs.jobs"),
      count: jobs.length > 0 ? jobs.length : undefined,
    },
    {
      id: "reviews",
      label: t("economy:company.tabs.reviews"),
      count: reviewCount,
    },
    ...(profile.work
      ? [{ id: "work", label: t("economy:company.tabs.work") }]
      : []),
  ];

  return (
    <div>
      <Tabs tabs={tabs} active={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === "about" && <AboutPane profile={profile} />}
      {tab === "jobs" && (
        <JobsPane
          jobs={jobs}
          postHref={`${routes.postJob}?company=${profile.slug}`}
        />
      )}
      {tab === "reviews" && (
        <ReviewsPane
          profile={profile}
          reviews={reviews}
          reviewCount={reviewCount}
          onWrite={onWriteReview}
          hasMore={hasMoreReviews}
          onLoadMore={onLoadMoreReviews}
          isLoadingMore={isLoadingMoreReviews}
          hasError={hasReviewsError}
          onRetry={onRetryReviews}
          isOwner={isOwner}
        />
      )}
      {tab === "work" && profile.work && <WorkPane work={profile.work} />}
    </div>
  );
}
