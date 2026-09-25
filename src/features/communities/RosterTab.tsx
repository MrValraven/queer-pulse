import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import {
  Avatar,
  Button,
  LoadErrorState,
  SearchInput,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { RosterMember } from "./community.model";
import type { PulsePaging } from "./api/useCommunityPosts";
import { photoOf } from "./communityPeople";
import { alsoIn } from "./communityConnections";
import { RoleBadge } from "./CommunityBadges";
import { RosterMessageButton } from "./RosterMessageButton";
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
}: {
  roster: RosterMember[];
  total: number;
  slug: string;
  /** Live-mode pagination for the roster; inert in demo (`hasNextPage: false`).
   *  Search below filters only the members loaded so far — "Load more" widens
   *  what search can find, same trade-off as any paginated-then-searched list. */
  paging: PulsePaging;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const [q, setQ] = useState("");

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

  // A failed roster read reaches this tab as the organiser alone (the detail
  // page's fallback), which reads as a community of one. Say the list did not
  // load instead (DES-22).
  if (paging.isError) {
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
        {shown.map((m) => (
          <div className={detail.mCard} key={m.slug ?? m.name}>
            <div className={styles.rosterAv}>
              <Avatar
                initials={m.initials}
                tint={m.tint}
                src={photoOf(m, demoMode)}
                size={48}
                // The member's name is rendered as visible text right beside
                // this avatar (see .rosterName below), so the image is
                // decorative — omit `alt` (→ alt="") to avoid a screen reader
                // double-reading the name (axe image-redundant-alt).
                verified={m.verified}
              />
            </div>
            <div className={styles.rosterName}>
              <span className={styles.nameRow}>
                {m.slug ? (
                  <Link to={`/members/${m.slug}`} className={styles.rosterLink}>
                    {m.name}
                  </Link>
                ) : (
                  m.name
                )}
                <MemberStaffBadge slug={m.slug} />
              </span>
            </div>
            <div className={styles.rosterBadgeRow}>
              <RoleBadge role={m.role} />
              {m.verified && (
                <span className={styles.verified}>
                  <FiCheck aria-hidden />{" "}
                  {t("communities:detail.roster.verified")}
                </span>
              )}
            </div>
            {m.title && <div className={detail.mRole}>{m.title}</div>}
            <div className={styles.rosterMeta}>
              {[m.pronouns, m.hood].filter(Boolean).join(" · ")}
            </div>
            {(() => {
              const others = alsoIn(m.slug, slug, demoMode);
              return others.length > 0 ? (
                <div className={styles.alsoIn}>
                  {t("communities:detail.roster.alsoIn", {
                    names: others.join(", "),
                  })}
                </div>
              ) : null;
            })()}
            <RosterMessageButton member={m} />
          </div>
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
        <div className={styles.loadMoreRoster}>
          <Button
            type="button"
            variant="ghost"
            disabled={paging.isFetchingNextPage}
            onClick={paging.fetchNextPage}
          >
            {paging.isFetchingNextPage
              ? t("communities:detail.roster.loadingMore")
              : t("communities:detail.roster.loadMoreCta")}
          </Button>
        </div>
      )}
    </div>
  );
}
