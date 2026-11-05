import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { FilterPageHeader } from "../../shared/components/filterPage";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileData } from "../../app/providers/useProfile";
import { routes } from "../../app/routeMap";
import { CommunitiesTopTabs } from "./CommunitiesTopTabs";
import { COMMUNITY_INVITATIONS_PATH } from "./communityInvitations.path";
import { useMyCommunityInvites } from "./api/useCommunityInvites";
import {
  useMyCommunities,
  useMyCommunitiesResolving,
} from "./api/useMyCommunities";
import type { TopTab } from "./useCommunitiesTopTab";
import styles from "./CommunitiesHubHeader.module.css";

/**
 * Header for the merged `/communities` page, on the shared filter-page header
 * the members directory uses: eyebrow, the page's single h1, its lead, then
 * the My communities / Discover pill tabs and "Start a community" in the
 * actions row.
 *
 * One header serves both tabs, so the tabs keep their DOM node (and keyboard
 * focus) when the member switches. On "My communities" the page name steps
 * down to the eyebrow so the greeting can carry the h1, and the membership
 * and invitation reads it needs are enabled on that tab alone, so Discover
 * never pays for `GET /me/communities`.
 *
 * The two tabs carry different eyebrows, titles and leads, and the longer
 * set wraps to more lines. Each of the three lines therefore renders through
 * `TabSwapSlot`, which also lays the other tab's copy into the same box
 * invisibly, so the header keeps one height across both tabs and the tab row
 * stays under the pointer that just clicked it.
 */
export function CommunitiesHubHeader({
  active,
  onChange,
}: {
  active: TopTab;
  onChange: (next: TopTab) => void;
}) {
  const { t } = useTranslation();
  const { profile } = useProfileData();
  const isMineTab = active === "mine";
  const memberships = useMyCommunities({ enabled: isMineTab });
  const isMembershipsLoading = useMyCommunitiesResolving({
    enabled: isMineTab,
  });
  const { invites } = useMyCommunityInvites({ enabled: isMineTab });
  const hasInvites = isMineTab && invites.length > 0;

  const mineEyebrow = t("communities:hub.eyebrow");
  const discoverEyebrow = t("communities:hubShell.eyebrow");
  const mineTitle = (
    <Translation
      i18nKey="communities:hub.welcome"
      values={{ name: profile.first }}
      components={{ em: <em /> }}
    />
  );
  const discoverTitle = (
    <>
      {t("communities:hubShell.title")}{" "}
      <em>{t("communities:hubShell.titleEm")}</em>
    </>
  );
  // On Discover the membership read is off, so this count is whatever the
  // cache holds (often zero). It only sizes the invisible copy, where a digit
  // more or less does not change the line count.
  const mineLead = t("communities:hub.sub", {
    count: Object.keys(memberships).length,
  });
  const discoverLead = t("communities:hubShell.subtitle");

  return (
    <FilterPageHeader
      eyebrow={
        <TabSwapSlot
          shown={isMineTab ? mineEyebrow : discoverEyebrow}
          reserved={isMineTab ? discoverEyebrow : mineEyebrow}
        />
      }
      title={
        <TabSwapSlot
          shown={isMineTab ? mineTitle : discoverTitle}
          reserved={isMineTab ? discoverTitle : mineTitle}
        />
      }
      lead={
        <TabSwapSlot
          shown={isMineTab ? mineLead : discoverLead}
          reserved={isMineTab ? discoverLead : mineLead}
        />
      }
      // The mine lead is a count, so it can't render until the count is
      // known: "across your 0 communities" for the length of the membership
      // fetch is a wrong number. The shimmer holds the line until it lands.
      isLeadLoading={isMineTab && isMembershipsLoading}
      note={
        hasInvites ? <HubInvitationsLink count={invites.length} /> : undefined
      }
      actions={
        <>
          <CommunitiesTopTabs active={active} onChange={onChange} />
          <Button
            variant="primary"
            to={routes.startCommunity}
            className={styles.startCta}
          >
            {t("communities:hub.startCta")}
          </Button>
        </>
      }
    />
  );
}

/**
 * Stacks the active tab's copy and the other tab's copy in one grid cell, the
 * other one hidden from sight and from assistive tech, so the slot is always
 * as tall as the longer of the two at the current width and language. Spans
 * only, so it fits inside the header's `<h1>` and `<p>`.
 */
function TabSwapSlot({
  shown,
  reserved,
}: {
  shown: ReactNode;
  reserved: ReactNode;
}) {
  return (
    <span className={styles.swapSlot}>
      <span className={styles.swapShown}>{shown}</span>
      <span className={styles.swapReserved} aria-hidden>
        {reserved}
      </span>
    </span>
  );
}

/**
 * The way into the invitations shelf (PRD-140), and the only one there is.
 *
 * An invitation to a `private` community exists NOWHERE else a member can
 * reach: the community 404s anyone off its roster, so it never appears in
 * Discover, in search, or on any card. Before the shelf, the invitation lived
 * only in a bell row that scrolls away. This link is what makes it findable
 * again the next day.
 *
 * The header renders it only when something is waiting, so it never sits on
 * the page as a dead affordance, and only on the "My communities" tab: an
 * invitation is about the member's own standing, which browsing has no part
 * in.
 */
function HubInvitationsLink({ count }: { count: number }) {
  const { t } = useTranslation();
  return (
    <Link to={COMMUNITY_INVITATIONS_PATH} className={styles.invitesLink}>
      <FiMail aria-hidden />
      {t("communities:hub.invitesLink", { count })}
    </Link>
  );
}
