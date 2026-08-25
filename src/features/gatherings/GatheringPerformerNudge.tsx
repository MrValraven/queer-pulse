import { FiStar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useNudges } from "../../app/providers/useNudges";
import { routes } from "../../app/routeMap";
import { useSubprofiles } from "../subprofiles/api/useSubprofiles";
import { KIND_LABEL_KEYS } from "../subprofiles/subprofile-kinds";
import { useEventLineup } from "./api/useEventLineup";
import { lineupRoleToKind } from "./eventLineup.data";
import { gatheringHasEnded, type GatheringDetail } from "./data";
import styles from "./GatheringPerformerNudge.module.css";

/**
 * Post-gathering persona nudge (Personas Phase 5, Moment 5) — mounted on the
 * gathering detail page (`GatheringPage`, `/gatherings/:slug`), the one real,
 * dual-mode, slug-aware surface a member returns to after a gathering ends.
 * (`GatheringRecapPage` is 100% demo-mock with no real slug or backend
 * counterpart, so it can't host a live nudge; see the Task 5 build notes.)
 *
 * Fires only when ALL of: the viewer is on the host-tagged lineup
 * (`viewerEntry`), the event has ended, their lineup role maps to a
 * recognised persona craft (`lineupRoleToKind`), they don't already run a
 * persona of that craft, and the shared dismissal store hasn't
 * dismissed/capped `post_gathering`.
 *
 * v1 scope: accepting only pre-fills the craft on persona creation
 * (`?create=1&kind=`) — linking the gathering itself as a `role:"performing"`
 * affiliation is a documented follow-up (the mechanism already exists via
 * `SubprofileAffiliationsEditor`, just not wired into this deep-link yet).
 */
export function GatheringPerformerNudge({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const { isDismissed, isCapped, dismiss } = useNudges();
  const activeSession = !checking && loggedIn && status === "active";
  const { data: lineup } = useEventLineup(gathering.slug);
  const { data: personas } = useSubprofiles({
    enabled: demoMode || activeSession,
  });

  if (!lineup?.viewerEntry) return null;
  if (!gatheringHasEnded(gathering)) return null;
  const kind = lineupRoleToKind(lineup.viewerEntry.role);
  if (!kind) return null;
  if ((personas ?? []).some((persona) => persona.kind === kind)) return null;
  if (isDismissed("post_gathering") || isCapped) return null;

  return (
    <div className={styles.nudge}>
      <FiStar className={styles.icon} aria-hidden />
      <div className={styles.body}>
        <p className={styles.text}>
          {t("gatherings:performerNudge.body", {
            name: lineup.viewerEntry.name,
            craft: t(KIND_LABEL_KEYS[kind]),
          })}
        </p>
        <div className={styles.actions}>
          <Button
            size="sm"
            to={`${routes.subprofilesDashboard}?create=1&kind=${kind}`}
          >
            {t("gatherings:performerNudge.startCta")}
          </Button>
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={() => dismiss("post_gathering")}
          >
            {t("gatherings:performerNudge.dismissCta")}
          </button>
        </div>
      </div>
    </div>
  );
}
