import { FiAlertTriangle, FiHeart } from "react-icons/fi";
import {
  EmptyState,
  SkeletonLine,
  SuccessPanel,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { FilterResultsTop } from "../../shared/components/filterPage";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FollowedPersonasGrid } from "./FollowedPersonasGrid";
import { SubprofileDirectoryLoadingGrid } from "./SubprofileDirectoryLoadingGrid";
import { useFollowedPersonasInfinite } from "./api/useFollowedPersonas";
import styles from "./SubprofileDirectoryPage.module.css";

/**
 * "The personas you follow" (PRD-208), the hub's second tab.
 *
 * Following used to be write-only: the tap sent the persona's owner one
 * notification and gave the follower a pill and nothing else, so there was no
 * way back to a persona followed weeks earlier. This is the list.
 *
 * The server decides what is on it. A persona that has since been unpublished,
 * made private, owner-removed, taken down by a moderator, or blocked either
 * way is filtered out in the query, so this list can never resurrect something
 * moderation removed and never shows a card whose link would 404.
 *
 * It looks and pages like the Everyone tab: the count on top in the same
 * results-top style (`FilterResultsTop`), then the same portrait grid with a
 * "Show more" pager (`FollowedPersonasGrid`), the same loading grid and the
 * same plum error panel.
 */
export function FollowedPersonasPanel({
  onBrowse,
}: {
  /** Sends an empty state to the tab where personas are actually found. */
  onBrowse: () => void;
}) {
  const { t } = useTranslation();
  const following = useFollowedPersonasInfinite();

  if (following.isLoading) {
    return (
      <>
        <FilterResultsTop count={<FollowingCountPlaceholder />} />
        <div className={styles.results}>
          {/* Eight fills two whole rows of four: with no sidebar this tab's
              grid is four columns wide on a desktop. */}
          <SubprofileDirectoryLoadingGrid
            label={t("subprofiles:following.loading")}
            count={8}
            hasNote
          />
        </div>
      </>
    );
  }

  if (following.hasNothingLoadedError) {
    // Distinct from the empty state: a failed fetch must not read as "you
    // follow nobody". The same plum error panel the Everyone tab shows, its
    // jade check swapped for a coral alert and its action used as a retry.
    return (
      <SuccessPanel
        title={t("subprofiles:following.error.title")}
        icon={<FiAlertTriangle size={26} color="var(--accent)" aria-hidden />}
        iconTone="coral"
        onClose={following.refetch}
        closeLabel={t("subprofiles:directory.error.retry")}
      >
        {t("subprofiles:following.error.description")}
      </SuccessPanel>
    );
  }

  if (following.shownCards.length === 0 && !following.hasMore) {
    return (
      <EmptyState
        icon={<FiHeart />}
        title={t("subprofiles:following.empty.title")}
        description={t("subprofiles:following.empty.description")}
        action={{
          label: t("subprofiles:following.empty.cta"),
          onClick: onBrowse,
        }}
      />
    );
  }

  return (
    <>
      <FilterResultsTop count={<FollowingCount total={following.total} />} />
      <FollowedPersonasGrid following={following} />
    </>
  );
}

/** The count line's stand-in while the list loads. The real line's height
 *  comes from its large serif number (`.count b` in FilterPage.module.css),
 *  so an invisible `<b><em>` holding a zero-width space gives this line the
 *  same line box and the grid stays put when the count lands. The bar sits
 *  inline beside it, small enough to leave that line box alone. */
function FollowingCountPlaceholder() {
  return (
    <>
      <b aria-hidden="true">
        <em>{"​"}</em>
      </b>
      <SkeletonLine
        width={150}
        height={14}
        style={{ display: "inline-block", verticalAlign: "middle" }}
      />
    </>
  );
}

/** "Following 3 personas" with the number large, serif and coral, the way the
 *  Everyone tab's result count reads. It rolls down when a card is unfollowed
 *  in place, while the card itself stays. */
function FollowingCount({ total }: { total: number }) {
  const fmt = useFormat();
  return (
    <Translation
      i18nKey="subprofiles:following.countLine"
      values={{ count: total }}
      slots={{
        count: (
          <b>
            <em>
              <RollingNumber value={fmt.number(total)} numericValue={total} />
            </em>
          </b>
        ),
      }}
    />
  );
}
