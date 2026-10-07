import { useState } from "react";
import { FiGlobe, FiSearch } from "react-icons/fi";
import {
  EmptyState,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type DirectoryPlace } from "./directoryPlaces";
import { type LocalPlace } from "./localPlaces";
import { DirectoryOnlineCard } from "./DirectoryOnlineCard";
import { DirectoryOnlineConstellation } from "./DirectoryOnlineConstellation";
import { DirectoryServerPageFooter } from "./DirectoryServerPageFooter";
import { DirectoryAdultLoadNote } from "./DirectoryAdultLoadNote";
import card from "./DirectoryPage.module.css";
import s from "./DirectoryOnline.module.css";

/** Holds the panel's and the first cards' shape while the registry loads, so
 *  the tab never flashes an empty state before its businesses arrive. */
function DirectoryOnlineSkeleton() {
  return (
    <div aria-hidden>
      <div className={`${s.panel} ${s.panelSkeleton}`} />
      <div className={s.grid}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={card.card}>
            <SkeletonLine
              width="100%"
              height={182}
              style={{ borderRadius: 14 }}
            />
            <SkeletonLine width="55%" height={19} />
            <SkeletonLine width="40%" height={14} />
            <SkeletonLine width="100%" height={13.5} />
            <SkeletonLine width="85%" height={13.5} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The directory's Online tab: queer-owned businesses that sell online. A
 * plum constellation leads, with every business orbiting the community's
 * pulse, then the businesses themselves as storefront cards. A node and its
 * card light up together, the way a pin and its card do on the map.
 *
 * `places` is the server's selling-online pool plus, for a member with the
 * chip on, the 18+ shops, already filtered (see `useDirectoryPageState`), so
 * this only decides which state to show.
 */
export function DirectoryOnlineView({
  places,
  total,
  loading,
  isError,
  onRetry,
  isAdultError,
  onRetryAdult,
  hasActiveFilters,
  onClearFilters,
  hasMoreFromServer,
  isLoadingMoreFromServer,
  isFetchNextPageError,
  onLoadMoreFromServer,
}: {
  places: LocalPlace[];
  /** Every business that sells online, before filters. */
  total: number;
  loading: boolean;
  /** Nothing to show because the read failed (ENG-501). */
  isError: boolean;
  onRetry: () => void;
  /** The member-only 18+ list failed; said in place above the results. */
  isAdultError: boolean;
  /** Asks for the 18+ list again. */
  onRetryAdult: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  /** The server holds more pages; they are pulled in one after another. */
  hasMoreFromServer: boolean;
  /** True while the next server page is in flight. */
  isLoadingMoreFromServer: boolean;
  /** True when the latest server page failed; loaded businesses stay. */
  isFetchNextPageError: boolean;
  /** Fetches the next server page, or retries the one that failed. */
  onLoadMoreFromServer: () => void;
}) {
  const { t } = useTranslation();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const businesses = places.map((place) => place.source as DirectoryPlace);

  const listBusinessAction = {
    label: t("marketing:directory.submitStrip.cta"),
    to: routes.listBusiness,
  };

  let content;
  if (loading) {
    content = <DirectoryOnlineSkeleton />;
  } else if (isError) {
    content = (
      <LoadErrorState
        onRetry={onRetry}
        // A failed page's Retry fetches that page; show it in flight.
        isRetrying={isLoadingMoreFromServer}
        title={
          <Translation
            i18nKey="marketing:directory.loadError.title"
            components={{ em: <em /> }}
          />
        }
        description={t("marketing:directory.loadError.body")}
      />
    );
  } else if (businesses.length === 0) {
    const emptyState =
      hasActiveFilters && total > 0 ? (
        <EmptyState
          icon={<FiSearch />}
          title={t("marketing:directory.online.emptyFiltered.title")}
          description={t("marketing:directory.online.emptyFiltered.body")}
          action={{
            label: t("marketing:directory.clearFilters"),
            onClick: onClearFilters,
          }}
        />
      ) : (
        <EmptyState
          icon={<FiGlobe />}
          title={t("marketing:directory.online.empty.title")}
          description={t("marketing:directory.online.empty.body")}
          action={listBusinessAction}
        />
      );
    content = emptyState;
  } else {
    content = (
      <>
        <DirectoryOnlineConstellation
          places={businesses}
          activeSlug={activeSlug}
          onActivate={setActiveSlug}
        />
        <div className={s.grid}>
          {businesses.map((place, index) => (
            <DirectoryOnlineCard
              key={place.slug}
              place={place}
              index={index}
              isActive={place.slug === activeSlug}
              onActivate={setActiveSlug}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <section className={s.view}>
      <div className="wrap">
        {/* Mounted in every state so its live region is in place before the
            18+ list can fail; it shows only above the results. */}
        <DirectoryAdultLoadNote
          isShown={isAdultError && !loading && !isError}
          onRetry={onRetryAdult}
        />
        {content}
        {hasMoreFromServer && !loading && !isError && (
          <DirectoryServerPageFooter
            isFetchingNextPage={isLoadingMoreFromServer}
            isFetchNextPageError={isFetchNextPageError}
            onLoadMore={onLoadMoreFromServer}
          />
        )}
      </div>
    </section>
  );
}
