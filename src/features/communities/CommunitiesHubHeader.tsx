import { SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileData } from "../../app/providers/useProfile";
import { useHowCommunitiesWorkModal } from "../marketing/useHowCommunitiesWorkModal";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { CommunitiesToolbar } from "./CommunitiesToolbar";
import { COMMUNITY_INVITATIONS_PATH } from "./communityInvitations.path";
import { useMyCommunityInvites } from "./api/useCommunityInvites";
import {
  useMyCommunities,
  useMyCommunitiesResolving,
} from "./api/useMyCommunities";
import type { DiscoverCommunities } from "./useDiscoverCommunities";
import type { TopTab } from "./useCommunitiesTopTab";
import styles from "./CommunitiesHubHeader.module.css";

/**
 * The quiet text button under the lead line that opens "How communities
 * work". Both heading variants render it in the same place, so the explainer
 * is one tap away on either tab.
 */
function HowItWorksButton({ onOpen }: { onOpen: () => void }) {
  const { t } = useTranslation();
  return (
    <button type="button" className={styles.howItWorksButton} onClick={onOpen}>
      {t("communities:hub.howItWorksCta")}
    </button>
  );
}

/**
 * The "My communities" heading block: the page name steps down to an eyebrow
 * so the greeting can carry the h1. Its own component because it is the only
 * part of the header that needs the membership map — mounted on this tab
 * alone, so Discover never pays for `GET /me/communities`.
 */
function HubMineHeading({
  onOpenHowItWorks,
}: {
  onOpenHowItWorks: () => void;
}) {
  const { t } = useTranslation();
  const { profile } = useProfileData();
  const memberships = useMyCommunities();
  const isMembershipsLoading = useMyCommunitiesResolving();

  return (
    <div className={styles.headingGroup}>
      <p className={styles.eyebrow}>{t("communities:hub.eyebrow")}</p>
      <h1 className={styles.title}>
        <Translation
          i18nKey="communities:hub.welcome"
          values={{ name: profile.first }}
          components={{ em: <em /> }}
        />
      </h1>
      {/* The lead line is a count, so it can't render until the count is
          known: "across your 0 communities" for the length of the membership
          fetch is a wrong number, not a loading state. */}
      {isMembershipsLoading ? (
        <div className={styles.lead} aria-hidden>
          <SkeletonLine width="min(42ch, 100%)" height={15} />
        </div>
      ) : (
        <p className={styles.lead}>
          {t("communities:hub.sub", { count: Object.keys(memberships).length })}
        </p>
      )}
      <HowItWorksButton onOpen={onOpenHowItWorks} />
      <HubInvitationsLink />
    </div>
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
 * Rendered only when something is waiting, so it never sits on the page as a
 * dead affordance. It is deliberately on the "My communities" tab rather than
 * Discover: an invitation is about the member's own standing, not about
 * browsing.
 */
function HubInvitationsLink() {
  const { t } = useTranslation();
  const { invites } = useMyCommunityInvites();
  if (invites.length === 0) return null;
  return (
    <Link to={COMMUNITY_INVITATIONS_PATH} className={styles.invitesLink}>
      <FiMail aria-hidden />
      {t("communities:hub.invitesLink", { count: invites.length })}
    </Link>
  );
}

/** Discover's heading block: the platform-wide title and its standing lead. */
function HubDiscoverHeading({
  onOpenHowItWorks,
}: {
  onOpenHowItWorks: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.headingGroup}>
      <h1 className={styles.title}>
        {t("communities:hubShell.title")}{" "}
        <em>{t("communities:hubShell.titleEm")}</em>
      </h1>
      <p className={styles.lead}>{t("communities:hubShell.subtitle")}</p>
      <HowItWorksButton onOpen={onOpenHowItWorks} />
    </div>
  );
}

/**
 * The "How communities work" explainer, the page's one explain-this-page
 * affordance. It opens from a quiet text button directly under the lead line
 * on both tabs, which keeps the control row free for the toolbar alone. The
 * header renders `modalElement` once for whichever tab is showing.
 */
function useHowItWorksExplainer() {
  const { openModal, modalElement } = useHowCommunitiesWorkModal();
  return { openExplainer: openModal, modalElement };
}

/**
 * Header for the merged `/communities` page. Carries the page's single <h1>
 * (with its lead line) and the whole control bar beneath it. It is the tab's
 * ONLY header: on "My communities" the greeting lives here rather than in a
 * second hero below, which used to push the cards most of a screen down. The
 * floating nav's band is already reserved once by `main[data-page-main]`
 * (base.css); this only adds its own breathing room on top of that. Not
 * sticky.
 */
export function CommunitiesHubHeader({
  discover,
  active,
  onChange,
}: {
  discover: DiscoverCommunities;
  active: TopTab;
  onChange: (next: TopTab) => void;
}) {
  const explainer = useHowItWorksExplainer();

  return (
    <header className={styles.header}>
      <div className="wrap">
        {active === "mine" ? (
          <HubMineHeading onOpenHowItWorks={explainer.openExplainer} />
        ) : (
          <HubDiscoverHeading onOpenHowItWorks={explainer.openExplainer} />
        )}
        <div className={styles.controls}>
          <CommunitiesToolbar
            discover={discover}
            active={active}
            onChange={onChange}
          />
        </div>
      </div>
      {explainer.modalElement}
    </header>
  );
}
