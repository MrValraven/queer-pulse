import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import {
  Badge,
  LoadErrorState,
  LoadMoreFooter,
  type BadgeTone,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { businessPath } from "../../app/routeMap";
import { listingCorrectionContactPath } from "../marketing/contactPrefill";
import {
  hasFailedWithoutData,
  isRetryingFailedRead,
} from "../admin/queryLoadFailure";
import { useMySuggestedListings } from "./api/useMySuggestedListings";
import type {
  MySuggestedListingDTO,
  MySuggestedListingState,
} from "./api/mySuggestedListings.api";
import styles from "./SuggestedPlacesSection.module.css";

/** Pill colour per state. The pill's TEXT carries the meaning; the colour
 *  only reinforces it. */
const STATE_TONE: Record<MySuggestedListingState, BadgeTone> = {
  in_review: "amber",
  needs_info: "coral",
  published: "jade",
  with_business: "plum",
};

/** The pill for one suggestion. A place that closed for good reads "Closed"
 *  in a neutral tone whatever its review state, so a shut business never
 *  wears the jade "Published" pill. */
function suggestionPill(suggestion: MySuggestedListingDTO): {
  tone: BadgeTone;
  labelKey: string;
} {
  if (suggestion.isPermanentlyClosed) {
    return {
      tone: "ghost",
      labelKey: "members:places.suggestions.state.closed",
    };
  }
  return {
    tone: STATE_TONE[suggestion.state],
    labelKey: `members:places.suggestions.state.${suggestion.state}`,
  };
}

/** The one line under a suggestion that says what happens next, or who has
 *  the place now. */
function suggestionNoteKey(suggestion: MySuggestedListingDTO): string {
  if (suggestion.isPermanentlyClosed) {
    return "members:places.suggestions.note.closed";
  }
  if (suggestion.holder === "claimed_by_you") {
    return "members:places.suggestions.note.claimedByYou";
  }
  if (suggestion.holder === "claimed") {
    return "members:places.suggestions.note.claimed";
  }
  return `members:places.suggestions.note.${suggestion.state}`;
}

/** One suggested place: its name (a link once the public page opens), where
 *  it stands, and the way to send a correction about it. */
function SuggestedPlaceRow({
  suggestion,
}: {
  suggestion: MySuggestedListingDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const pill = suggestionPill(suggestion);
  return (
    <li className={styles.row}>
      <div className={styles.rowTop}>
        {suggestion.publicSlug ? (
          <Link
            className={styles.nameLink}
            to={businessPath(suggestion.publicSlug)}
          >
            {suggestion.name}
          </Link>
        ) : (
          <span className={styles.name}>{suggestion.name}</span>
        )}
        <Badge tone={pill.tone} dot>
          {t(pill.labelKey)}
        </Badge>
      </div>
      {/* `<when>` keeps "Suggested {date}" on one line, so a narrow row
          never strands the date away from its verb. */}
      <p className={styles.meta}>
        <Translation
          i18nKey="members:places.suggestions.meta"
          components={{ when: <span className={styles.nowrap} /> }}
          values={{
            city: suggestion.city,
            ref: suggestion.ref,
            date: fmt.date(new Date(suggestion.suggestedAt), {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          }}
        />
      </p>
      <p className={styles.note}>{t(suggestionNoteKey(suggestion))}</p>
      <div className={styles.actions}>
        {suggestion.publicSlug && (
          <Link
            className={styles.action}
            to={businessPath(suggestion.publicSlug)}
          >
            {t("members:places.viewListingCta")} <FiArrowRight aria-hidden />
          </Link>
        )}
        <Link
          className={styles.action}
          to={listingCorrectionContactPath(suggestion.ref)}
        >
          {t("members:places.suggestions.correctionCta")}
        </Link>
      </div>
    </li>
  );
}

/**
 * PRD-434. "Places you suggested", on the member's own profile below the
 * places they run.
 *
 * A suggestion is held by the platform, so `GET /listings/mine` never
 * returned it and the member who sent one had no way to see it again. This
 * reads `GET /listings/suggestions/mine` and shows each place with where it
 * stands. A member who never suggested anything sees nothing here: the
 * section is a record of their suggestions and has nothing to offer empty.
 *
 * Nothing renders while the first read is out either, so a member with no
 * suggestions never sees a placeholder flash in and vanish.
 *
 * A failed next page keeps the loaded rows (a failed `fetchNextPage` also
 * sets `isError`), so the full error panel is only for a first load that
 * failed. `hasFailedWithoutData` keeps that panel up while its Retry runs
 * (react-query resets a never-loaded query to `pending` on refetch), so the
 * focused button stays mounted.
 */
export function SuggestedPlacesSection() {
  const { t } = useTranslation();
  const query = useMySuggestedListings({ isEnabled: true });
  const { suggestions } = query;
  const hasFirstLoadFailed = hasFailedWithoutData(query);

  if (!hasFirstLoadFailed && suggestions.length === 0) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>
        <Translation
          i18nKey="members:places.suggestions.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sub}>{t("members:places.suggestions.subtitle")}</p>
      {hasFirstLoadFailed ? (
        <LoadErrorState
          compact
          headingLevel={3}
          onRetry={() => void query.refetch()}
          isRetrying={isRetryingFailedRead(query)}
          description={t("members:places.suggestions.loadError")}
        />
      ) : (
        <>
          <ul className={styles.list}>
            {suggestions.map((suggestion) => (
              <SuggestedPlaceRow key={suggestion.ref} suggestion={suggestion} />
            ))}
          </ul>
          {(query.hasNextPage || query.isFetchNextPageError) && (
            <LoadMoreFooter
              isFetchingNextPage={query.isFetchingNextPage}
              isFetchNextPageError={query.isFetchNextPageError}
              onLoadMore={() => void query.fetchNextPage()}
              errorMessage={t("members:places.suggestions.loadMoreError")}
              label={t("members:places.suggestions.loadMore")}
              loadingLabel={t("members:places.suggestions.loadingMore")}
            />
          )}
        </>
      )}
    </div>
  );
}
