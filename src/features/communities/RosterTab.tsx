import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  LoadErrorState,
  LoadMoreFooter,
  SearchInput,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import type { RosterMember } from "./community.model";
import type { CommunityRole } from "./membership.types";
import type { PulsePaging } from "./api/useCommunityPosts";
import { viewerPerson } from "./communityPeople";
import { RosterMemberCard } from "./RosterMemberCard";
import { canSendCommunityGifts } from "./badges/communityBadgeAccess";
import { SendCommunityGiftDialog } from "./badges/SendCommunityGiftDialog";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityHubTabs.module.css";

const ROLE_ORDER: Record<RosterMember["role"], number> = {
  owner: 0,
  co_owner: 1,
  mod: 2,
  member: 3,
};

export function RosterTab({
  roster,
  total,
  slug,
  paging,
  viewerRole,
  isSpace,
}: {
  roster: RosterMember[];
  total: number;
  slug: string;
  /** Live-mode pagination for the roster; inert in demo (`hasNextPage: false`).
   *  Search below filters only the members loaded so far — "Load more" widens
   *  what search can find, same trade-off as any paginated-then-searched list. */
  paging: PulsePaging;
  /** The viewer's seat here. Staff get a gift button on other members' cards. */
  viewerRole: CommunityRole | null;
  /** A space has no badges or gifts, so no gift button either. */
  isSpace: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [giftRecipient, setGiftRecipient] = useState<RosterMember | null>(null);
  const viewerSlug = viewerPerson(user)?.slug;
  const canGift = !isSpace && canSendCommunityGifts(viewerRole);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const sorted = [...roster].sort(
      (a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role],
    );
    if (!term) return sorted;
    return sorted.filter((m) =>
      [m.name, m.role, m.hood, m.pronouns]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [roster, q]);

  // A failed first roster read reaches this tab as an empty roster, which
  // would read as a community with no members. Say the list did not load
  // (DES-22). ENG-501: react-query also sets `isError` when only
  // the next page failed, so the panel is for a roster with nothing loaded;
  // loaded members stay and the footer below retries the page that failed.
  const hasNothingLoadedError = Boolean(paging.isError) && roster.length === 0;
  if (hasNothingLoadedError) {
    return <LoadErrorState onRetry={paging.refetch} />;
  }

  return (
    <div>
      <SearchInput
        className={styles.searchRow}
        ariaLabel={t("communities:detail.roster.searchAria")}
        placeholder={t("communities:detail.roster.searchPlaceholder")}
        value={q}
        onChange={setQ}
      />

      <div className={detail.memberGrid}>
        {shown.map((m, index) => (
          <RosterMemberCard
            // An inactive member's stand-in has no slug, and two of them share
            // the label as their name, so the index keeps their keys apart.
            key={m.slug || `${m.name}-${index}`}
            member={m}
            communitySlug={slug}
            isGiftable={
              canGift && m.slug !== undefined && m.slug !== viewerSlug
            }
            onSendGift={setGiftRecipient}
          />
        ))}
      </div>
      <p className={detail.showing}>
        {/* Search moves the shown figure; a join, leave or removal moves
            the total. */}
        <Translation
          i18nKey="communities:detail.roster.showingOf"
          values={{ shown: shown.length, count: total }}
          slots={{
            shown: (
              <RollingNumber
                value={fmt.number(shown.length)}
                numericValue={shown.length}
              />
            ),
            count: (
              <RollingNumber value={fmt.number(total)} numericValue={total} />
            ),
          }}
        />
      </p>
      {/* Search filters only the members loaded so far — flag it when more
          pages remain so a thin result isn't mistaken for the whole roster. */}
      {q.trim() && paging.hasNextPage && (
        <p className={styles.searchScopeNote}>
          {t("communities:detail.roster.searchScopeNote")}
        </p>
      )}
      {paging.hasNextPage && (
        <LoadMoreFooter
          className={styles.loadMoreRoster}
          isFetchingNextPage={paging.isFetchingNextPage}
          isFetchNextPageError={Boolean(paging.isFetchNextPageError)}
          onLoadMore={paging.fetchNextPage}
          errorMessage={t("common:error.loadMore")}
          label={t("communities:detail.roster.loadMoreCta")}
          loadingLabel={t("communities:detail.roster.loadingMore")}
        />
      )}
      <AnimatePresence>
        {giftRecipient?.slug && (
          <SendCommunityGiftDialog
            key={giftRecipient.slug}
            slug={slug}
            recipient={{ slug: giftRecipient.slug, name: giftRecipient.name }}
            onClose={() => setGiftRecipient(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
