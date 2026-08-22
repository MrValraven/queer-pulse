import { FiUsers } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useProfileData } from "../../app/providers/useProfile";
import { CommunitiesHomeDigest } from "./CommunitiesHomeDigest";
import { CommunitiesHomeSidebar } from "./CommunitiesHomeSidebar";
import {
  CommunitiesHomePulse,
  CommunitiesHomeTodos,
} from "./CommunitiesHomeFeed";
import { useCommunitiesHomeData } from "./useCommunitiesHomeData";
import styles from "./CommunitiesHomePage.module.css";

export function CommunitiesHome() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // The placeholder skeleton is a demo-prototype device: the pulse feed it
  // covers is mock-derived and always empty in live mode, so live members were
  // waiting half a second for nothing.
  const isSimulatedLoading = useSimulatedLoad(500);
  const isLoading = demoMode && isSimulatedLoading;
  // The signed-in member (real profile live, mock currentUser in demo mode).
  const { profile } = useProfileData();
  const firstName = profile.first;
  const { pulse, todos, myCommunities, upcoming, suggestions, digest } =
    useCommunitiesHomeData();

  return (
    <>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.head}>
            <div>
              <div className={styles.eyebrow}>
                {t("communities:hub.eyebrow")}
              </div>
              <h2 className={styles.h1}>
                <Translation
                  i18nKey="communities:hub.welcome"
                  values={{ name: firstName }}
                  components={{ em: <em /> }}
                />
              </h2>
              <p className={styles.sub}>
                {t("communities:hub.sub", { count: myCommunities.length })}
              </p>
            </div>
          </div>

          {myCommunities.length === 0 ? (
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
              {/* The weekly digest is derived entirely from the `getLiving`
                  mock — there's no live feed backend — so it only renders in
                  demo mode rather than showing a misleading all-zero week. */}
              {demoMode && <CommunitiesHomeDigest digest={digest} />}

              <div className={styles.layout}>
                <div>
                  <CommunitiesHomeTodos todos={todos} />
                  <CommunitiesHomePulse loading={isLoading} pulse={pulse} />
                </div>

                <CommunitiesHomeSidebar
                  communities={myCommunities}
                  upcoming={upcoming}
                  suggestions={suggestions}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
