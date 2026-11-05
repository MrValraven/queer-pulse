import { Reveal } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileDirectoryPager } from "./SubprofileDirectoryPager";
import { SubprofilePortraitCard } from "./SubprofilePortraitCard";
import type { FollowedPersonasInfiniteView } from "./api/useFollowedPersonas";
import styles from "./SubprofileDirectoryPage.module.css";

/** "Mar 2026": the month the follow started is enough on a card. */
const FOLLOWED_SINCE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  year: "numeric",
};

/**
 * The You follow tab's portrait grid and its "Show more" pager, drawn with
 * the Everyone tab's own grid and pager so the two tabs look and page alike.
 *
 * UNFOLLOW HAPPENS IN PLACE. Each card's Follow button reads "Following";
 * tapping it unfollows and the card stays where it is with the button back
 * on "Follow", so a mis-tap is one tap to undo. `useFollow` patches the
 * cached page and leaves the list unrefetched, so the card only leaves the
 * grid the next time the tab loads. The button's own state is the feedback.
 */
export function FollowedPersonasGrid({
  following,
}: {
  following: FollowedPersonasInfiniteView;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const {
    shownCards,
    total,
    hasMore,
    isFetchingMore,
    isFetchNextPageError,
    onShowMore,
  } = following;

  // "N of M" counts the follows still standing. A card unfollowed in place
  // stays on the grid while the server total drops by one, so counting every
  // card would read "3 of 2"; counting only the cards still followed moves
  // both figures together and moves them back on a re-follow. The clamp
  // guards against a total the server and the loaded pages disagree on.
  // With every shown card unfollowed the pager folds the count away, so the
  // cards still on screen carry no "0 of 0" under them.
  const followedCount = shownCards.filter(
    (entry) => entry.card.viewerFollowing,
  ).length;
  const shownCount = Math.min(followedCount, total);

  return (
    // The results column is the grid's size container, as on Everyone, so
    // the phone's two-column rule applies here too.
    <div className={styles.results}>
      {shownCards.length > 0 && (
        <div className={styles.grid}>
          {shownCards.map((entry, index) => {
            const followedOn = fmt.date(
              new Date(entry.followedAt),
              FOLLOWED_SINCE_FORMAT,
            );
            return (
              <Reveal key={entry.card.key} delay={Math.min(index, 8) * 60}>
                {/* h3 under the section's visually hidden h2. */}
                <SubprofilePortraitCard
                  view={entry.card}
                  headingLevel="h3"
                  note={t("subprofiles:following.cardSince", {
                    date: followedOn,
                  })}
                  compactNote={t("subprofiles:following.since", {
                    date: followedOn,
                  })}
                />
              </Reveal>
            );
          })}
        </div>
      )}
      <SubprofileDirectoryPager
        shownCount={shownCount}
        total={total}
        hasMore={hasMore}
        isFetchingMore={isFetchingMore}
        isFetchNextPageError={isFetchNextPageError}
        onShowMore={onShowMore}
        isBare={shownCards.length === 0}
        shouldHideCountAtZero
      />
    </div>
  );
}
