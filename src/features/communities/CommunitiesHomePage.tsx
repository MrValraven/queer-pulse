import { FiUsers } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { CommunitiesGrid } from "./CommunitiesGrid";
import { CommunitiesHomeDigest } from "./CommunitiesHomeDigest";
import { CommunitiesHomeSidebar } from "./CommunitiesHomeSidebar";
import {
  CommunitiesHomePulse,
  CommunitiesHomeTodos,
} from "./CommunitiesHomeFeed";
import { useCommunitiesHomeData } from "./useCommunitiesHomeData";
import type { DiscoverCommunities } from "./useDiscoverCommunities";
import styles from "./CommunitiesHomePage.module.css";

/**
 * The `/communities?tab=mine` body.
 *
 * The greeting, the tab switch and the whole filter bar all live one level up
 * in `CommunitiesHubHeader` — this body starts straight at the cards, so the
 * first community is visible without scrolling.
 *
 * The communities you belong to lead the page as real cards, through the same
 * `CommunitiesGrid` (and the same filters, chips and sort) that Discover uses
 * — scoped to your own memberships. Everything the hub carried before sits
 * underneath: the mod to-do list, the cross-community pulse, and the events /
 * suggestions rail.
 */
export function CommunitiesHome({
  discover,
}: {
  discover: DiscoverCommunities;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // The placeholder skeleton is a demo-prototype device: the pulse feed it
  // covers is mock-derived and always empty in live mode, so live members were
  // waiting half a second for nothing.
  const isSimulatedLoading = useSimulatedLoad(500);
  const isPulseLoading = demoMode && isSimulatedLoading;
  const {
    isLoading: isMembershipsLoading,
    pulse,
    todos,
    myCommunities,
    upcoming,
    suggestions,
    digest,
  } = useCommunitiesHomeData();
  const hasSidebar = upcoming.length > 0 || suggestions.length > 0;

  return (
    <div className={styles.page}>
      <div className="wrap">
        {/* Only an empty membership map we've actually resolved earns the
            empty state. While it's still in flight we fall through to the
            grid, which carries its own card skeletons, so a member who does
            belong to communities never gets told they belong to none. */}
        {!isMembershipsLoading && myCommunities.length === 0 ? (
          <EmptyState
            icon={<FiUsers />}
            title={t("communities:hub.empty.title")}
            description={t("communities:hub.empty.description")}
            action={{
              label: t("communities:hub.discoverCta"),
              to: routes.communities,
            }}
          />
        ) : (
          <>
            <CommunitiesGrid
              discover={discover}
              isPending={isMembershipsLoading}
              beforeGrid={
                /* The weekly digest is derived entirely from the `getLiving`
                   mock — there's no live feed backend — so it only renders in
                   demo mode rather than showing a misleading all-zero week. */
                demoMode ? <CommunitiesHomeDigest digest={digest} /> : null
              }
            />

            {/* The rail only exists when it has something in it — both of its
                cards are demo-derived — so the column drops rather than
                leaving a 300px gutter of nothing beside the feed. */}
            <div
              className={[
                styles.layout,
                styles.belowGrid,
                !hasSidebar && styles.layoutFull,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div>
                <CommunitiesHomeTodos todos={todos} />
                <CommunitiesHomePulse loading={isPulseLoading} pulse={pulse} />
              </div>

              {hasSidebar && (
                <CommunitiesHomeSidebar
                  upcoming={upcoming}
                  suggestions={suggestions}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
