import { FiUsers } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button, EmptyState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { useProfile } from "../../app/providers/ProfileProvider";
import { CommunitiesHomeDigest } from "./CommunitiesHomeDigest";
import { CommunitiesHomeSidebar } from "./CommunitiesHomeSidebar";
import {
  CommunitiesHomePulse,
  CommunitiesHomeTodos,
} from "./CommunitiesHomeFeed";
import { useCommunitiesHomeData } from "./useCommunitiesHomeData";
import styles from "./CommunitiesHomePage.module.css";

export function CommunitiesHomePage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad(500);
  // The signed-in member (real profile live, mock currentUser in demo mode).
  const { profile } = useProfile();
  const firstName = profile.first;
  const { pulse, todos, myCommunities, upcoming, suggestions, digest } =
    useCommunitiesHomeData();

  return (
    <AppShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.head}>
            <div>
              <div className={styles.eyebrow}>
                {t("communities:hub.eyebrow")}
              </div>
              <h1 className={styles.h1}>
                <Translation
                  i18nKey="communities:hub.welcome"
                  values={{ name: firstName }}
                  components={{ em: <em /> }}
                />
              </h1>
              <p className={styles.sub}>
                {t("communities:hub.sub", { count: myCommunities.length })}
              </p>
            </div>
            <div className={styles.headActions}>
              <Button variant="ghost" to={routes.communities}>
                {t("communities:hub.discoverCta")}
              </Button>
              <Button variant="primary" to={routes.startCommunity}>
                {t("communities:hub.startCta")}
              </Button>
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
              <CommunitiesHomeDigest digest={digest} />

              <div className={styles.layout}>
                <div>
                  <CommunitiesHomeTodos todos={todos} />
                  <CommunitiesHomePulse loading={loading} pulse={pulse} />
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
    </AppShell>
  );
}
