import { FiUsers } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button, EmptyState } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { currentUser } from "../members/data/members";
import { CommunitiesHomeDigest } from "./CommunitiesHomeDigest";
import { CommunitiesHomeSidebar } from "./CommunitiesHomeSidebar";
import {
  CommunitiesHomePulse,
  CommunitiesHomeTodos,
} from "./CommunitiesHomeFeed";
import { useCommunitiesHomeData } from "./useCommunitiesHomeData";
import styles from "./CommunitiesHomePage.module.css";

export function CommunitiesHomePage() {
  const loading = useSimulatedLoad(500);
  const firstName = currentUser.first;
  const { pulse, todos, myCommunities, upcoming, suggestions, digest } =
    useCommunitiesHomeData();

  return (
    <AppShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.head}>
            <div>
              <div className={styles.eyebrow}>Your communities</div>
              <h1 className={styles.h1}>
                Welcome back, <em>{firstName}</em>
              </h1>
              <p className={styles.sub}>
                Here's what's been happening across your {myCommunities.length}{" "}
                communities.
              </p>
            </div>
            <div className={styles.headActions}>
              <Button variant="ghost" to={routes.communities}>
                Discover communities
              </Button>
              <Button variant="primary" to={routes.startCommunity}>
                Start a community
              </Button>
            </div>
          </div>

          {myCommunities.length === 0 ? (
            <EmptyState
              icon={<FiUsers />}
              title="You haven't joined any communities yet"
              description="Browse by interest and find where you belong — there's no rush."
              action={{ label: "Discover communities", to: routes.communities }}
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
