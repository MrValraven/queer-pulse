import { Button, FeatureHelp, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useProfileData } from "../../app/providers/useProfile";
import { useHowCommunitiesWorkModal } from "../marketing/useHowCommunitiesWorkModal";
import { CommunitiesTopTabs } from "./CommunitiesTopTabs";
import {
  useMyCommunities,
  useMyCommunitiesResolving,
} from "./api/useMyCommunities";
import type { TopTab } from "./useCommunitiesTopTab";
import styles from "./CommunitiesHubHeader.module.css";

/**
 * The "My communities" heading block: the page name steps down to an eyebrow
 * so the greeting can carry the h1. Its own component because it is the only
 * part of the header that needs the membership map — mounted on this tab
 * alone, so Discover never pays for `GET /me/communities`.
 */
function HubMineHeading() {
  const { t } = useTranslation();
  const { profile } = useProfileData();
  const memberships = useMyCommunities();
  const isMembershipsLoading = useMyCommunitiesResolving();

  return (
    <div className={styles.headingGroup}>
      <p className={styles.eyebrow}>{t("communities:hub.eyebrow")}</p>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>
          <Translation
            i18nKey="communities:hub.welcome"
            values={{ name: profile.first }}
            components={{ em: <em /> }}
          />
        </h1>
        <FeatureHelp id="communities.hub" />
      </div>
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
    </div>
  );
}

/** Discover's heading block: the platform-wide title and its standing lead. */
function HubDiscoverHeading() {
  const { t } = useTranslation();

  return (
    <div className={styles.headingGroup}>
      {/* FeatureHelp sits beside the heading, not inside it, so the info
          button doesn't pollute the h1's accessible name or inherit its
          hero-scale font-size (see CommunityDetailHero for the same
          pattern). */}
      <div className={styles.titleRow}>
        <h1 className={styles.title}>
          {t("communities:hubShell.title")}{" "}
          <em>{t("communities:hubShell.titleEm")}</em>
        </h1>
        <FeatureHelp id="communities.hub" />
      </div>
      <p className={styles.lead}>{t("communities:hubShell.subtitle")}</p>
    </div>
  );
}

/**
 * Header for the merged `/communities` page. Carries the page's single <h1>
 * (with its lead line), the My communities | Discover switch, and the
 * persistent "Start a community" action. It is the tab's ONLY header: on "My
 * communities" the greeting lives here rather than in a second hero below,
 * which used to push the cards most of a screen down. The floating nav's band
 * is already reserved once by `main[data-page-main]` (base.css); this only
 * adds its own breathing room on top of that. Not sticky.
 */
export function CommunitiesHubHeader({
  active,
  onChange,
}: {
  active: TopTab;
  onChange: (next: TopTab) => void;
}) {
  const { t } = useTranslation();
  const { openModal, modalElement } = useHowCommunitiesWorkModal();

  return (
    <header className={styles.header}>
      <div className="wrap">
        <div className={styles.row}>
          <div className={styles.identity}>
            {active === "mine" ? <HubMineHeading /> : <HubDiscoverHeading />}
            <CommunitiesTopTabs active={active} onChange={onChange} />
          </div>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={openModal}>
              {t("communities:hub.howItWorksCta")}
            </Button>
            <Button variant="primary" to={routes.startCommunity}>
              {t("communities:hub.startCta")}
            </Button>
          </div>
        </div>
      </div>
      {modalElement}
    </header>
  );
}
