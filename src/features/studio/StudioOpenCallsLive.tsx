import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar } from "react-icons/fi";
import {
  EmptyState,
  FadeIn,
  LoadErrorState,
  LoadMoreFooter,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useThreads } from "../forum/api/useForum";
import {
  FUNDING_CATEGORY_ID,
  FUNDING_MUSIC_TAG,
  FUNDING_OPEN_CALLS_HREF,
} from "../forum/funding/funding.data";
import { useMinuteClock } from "../forum/funding/useMinuteClock";
import { StudioFundingCallCard } from "./StudioFundingCallCard";
import {
  STUDIO_MUSIC_CALLS_HREF,
  STUDIO_NEW_MUSIC_FUNDING_POST_HREF,
} from "./studioPaths";
import { StudioLine } from "./StudioSkeletons";
import kit from "./studioKit.module.css";
import css from "./StudioCalls.module.css";

const SKELETON_ROWS = ["first", "second", "third"] as const;

/** Open Funding calls tagged music (Studio v2). Studio stores nothing: it
 *  reads GET /forum/threads?category=funding&fundingView=open&tag=music. A
 *  failed later page keeps the loaded calls; a failed first read shows the
 *  error panel, which stays up (with focus on Retry) while Retry runs. */
export function StudioOpenCallsLive() {
  const { t } = useTranslation();
  const calls = useThreads(FUNDING_CATEGORY_ID, {
    fundingView: "open",
    tag: FUNDING_MUSIC_TAG,
  });
  const nowMs = useMinuteClock();
  const hasCalls = calls.threads.length > 0;
  // StudioFundingCallCard draws nothing for a thread without funding, so such
  // a thread never gets a list item (an empty animated row is blank space).
  const fundingCalls = calls.threads.filter((thread) => thread.funding);
  const hasFundingCalls = fundingCalls.length > 0;
  // useThreads exposes no errorUpdateCount, so the page remembers a failed
  // first read itself: Retry resets the query to loading, and the panel must
  // not unmount under the focused button.
  const [hasFailedFirstRead, setHasFailedFirstRead] = useState(false);
  if (calls.isError && !hasCalls && !hasFailedFirstRead)
    setHasFailedFirstRead(true);
  if (hasCalls && hasFailedFirstRead) setHasFailedFirstRead(false);
  const isFirstReadFailed =
    !hasCalls && hasFailedFirstRead && (calls.isError || calls.isLoading);

  return (
    <div className={css.wrap}>
      <header className={css.hero}>
        <div className={css.eyebrow}>{t("studio:callsLive.eyebrow")}</div>
        <h1 className={css.title}>
          <Translation
            i18nKey="studio:callsLive.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={css.dek}>{t("studio:callsLive.dek")}</p>
        <div className={css.heroLinks}>
          <Link
            to={STUDIO_NEW_MUSIC_FUNDING_POST_HREF}
            className={kit.pillLink}
          >
            {t("studio:callsLive.postCta")}
          </Link>
          <Link to={STUDIO_MUSIC_CALLS_HREF} className={kit.pillLink}>
            {t("studio:callsLive.musicCallsCta")} <FiArrowRight aria-hidden />
          </Link>
        </div>
      </header>
      {isFirstReadFailed ? (
        <LoadErrorState
          title={t("studio:callsLive.loadErrorTitle")}
          onRetry={calls.refetch}
          isRetrying={calls.isLoading}
          compact
        />
      ) : calls.isLoading ? (
        <div
          className={css.skeletons}
          role="status"
          aria-label={t("studio:states.loadingLabel")}
        >
          {SKELETON_ROWS.map((row) => (
            <div key={row} className={css.card}>
              <StudioLine width="30%" height={12} />
              <StudioLine width="65%" height={22} />
              <StudioLine width="90%" height={14} />
            </div>
          ))}
        </div>
      ) : !hasFundingCalls && !calls.hasNextPage ? (
        <EmptyState
          icon={<FiCalendar />}
          title={t("studio:callsLive.empty.title")}
          description={t("studio:callsLive.empty.body")}
          headingLevel={2}
          action={{
            label: t("studio:callsLive.allCallsCta"),
            to: FUNDING_OPEN_CALLS_HREF,
          }}
        />
      ) : (
        <>
          {hasFundingCalls && (
            <ul
              className={css.list}
              aria-label={t("studio:callsLive.listLabel")}
            >
              {fundingCalls.map((thread, index) => (
                <FadeIn
                  as="li"
                  key={thread.slug ?? thread.id}
                  delay={Math.min(index, 8) * 60}
                >
                  <StudioFundingCallCard thread={thread} nowMs={nowMs} />
                </FadeIn>
              ))}
            </ul>
          )}
          {(calls.hasNextPage || calls.isFetchNextPageError) && (
            <div className={kit.moreFooter}>
              <LoadMoreFooter
                isFetchingNextPage={calls.isFetchingNextPage}
                isFetchNextPageError={calls.isFetchNextPageError}
                onLoadMore={calls.fetchNextPage}
                label={t("studio:callsLive.showMore")}
                loadingLabel={t("studio:callsLive.loadingMore")}
                errorMessage={t("studio:callsLive.loadMoreError")}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
