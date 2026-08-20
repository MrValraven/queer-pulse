import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiMessageCircle } from "react-icons/fi";
import { Avatar, Button, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMemberContact } from "../connect/useMemberContact";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { RosterMember } from "./community.model";
import type { PulsePaging } from "./api/useCommunityPosts";
import { photoOf } from "./communityPeople";
import { alsoIn } from "./communityConnections";
import { RoleBadge } from "./CommunityBadges";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityHubTabs.module.css";

const ROLE_ORDER: Record<RosterMember["role"], number> = {
  owner: 0,
  mod: 1,
  member: 2,
};

/**
 * The roster card's "Message" affordance — a `span role="button"` (no `<button>`
 * inside the profile `<Link>`, per the design rule). Extracted so
 * `useMemberContact` runs at a component top level rather than inside the
 * `shown.map` below, where a hook call would be illegal.
 */
function RosterMessageButton({ member }: { member: RosterMember }) {
  const { t } = useTranslation();
  const { connected, contact } = useMemberContact(member.slug ?? "");
  const reachOut = () =>
    contact({ slug: member.slug ?? "", name: member.name });
  return (
    <span
      role="button"
      tabIndex={0}
      className={styles.msgBtn}
      onClick={reachOut}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && (e.preventDefault(), reachOut())
      }
    >
      <FiMessageCircle aria-hidden />{" "}
      {connected
        ? t("connect:contact.message")
        : t("communities:detail.roster.messageCta")}
    </span>
  );
}

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
                  <Link
                    to={`/members/${m.slug}`}
                    className={styles.rosterLink}
                  >
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
        {t("communities:detail.roster.showingOf", {
          shown: shown.length,
          count: total,
        })}
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
