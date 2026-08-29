import { FeatureHelp, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileData } from "../../app/providers/useProfile";
import { useHowCommunitiesWorkModal } from "../marketing/useHowCommunitiesWorkModal";
import { CommunitiesToolbar } from "./CommunitiesToolbar";
import {
  useMyCommunities,
  useMyCommunitiesResolving,
} from "./api/useMyCommunities";
import type { DiscoverCommunities } from "./useDiscoverCommunities";
import type { TopTab } from "./useCommunitiesTopTab";
import styles from "./CommunitiesHubHeader.module.css";

/** The ⓘ's read-more button: the page's own deeper explainer. */
type HubHelpAction = { label: string; onClick: () => void };

/**
 * The "My communities" heading block: the page name steps down to an eyebrow
 * so the greeting can carry the h1. Its own component because it is the only
 * part of the header that needs the membership map — mounted on this tab
 * alone, so Discover never pays for `GET /me/communities`.
 */
function HubMineHeading({ helpAction }: { helpAction: HubHelpAction }) {
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
        <FeatureHelp id="communities.hub" action={helpAction} />
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
function HubDiscoverHeading({ helpAction }: { helpAction: HubHelpAction }) {
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
        <FeatureHelp id="communities.hub" action={helpAction} />
      </div>
      <p className={styles.lead}>{t("communities:hubShell.subtitle")}</p>
    </div>
  );
}

/**
 * The ⓘ beside the title is now the page's only explainer affordance: "About
 * this screen" first, with "How communities work" as its read-more. That
 * explainer used to be a ghost button on the control row, one of two
 * explain-this-page controls a thumb's width apart, and the ~215px it took is
 * what let the row collapse to a single line.
 */
function useHubHelp() {
  const { t } = useTranslation();
  const { openModal, modalElement } = useHowCommunitiesWorkModal();
  return {
    action: { label: t("communities:hub.howItWorksCta"), onClick: openModal },
    modalElement,
  };
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
  const help = useHubHelp();

  return (
    <header className={styles.header}>
      <div className="wrap">
        {active === "mine" ? (
          <HubMineHeading helpAction={help.action} />
        ) : (
          <HubDiscoverHeading helpAction={help.action} />
        )}
        <div className={styles.controls}>
          <CommunitiesToolbar
            discover={discover}
            active={active}
            onChange={onChange}
          />
        </div>
      </div>
      {help.modalElement}
    </header>
  );
}
