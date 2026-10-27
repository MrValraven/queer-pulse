import { FiCheck, FiUsers, FiX } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { Avatar } from "../../../../shared/components/ui/Avatar";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  AccessTierBadge,
  RoleBadge,
} from "../../../communities/CommunityBadges";
import joinStyles from "../../../communities/ModJoinRequestRow.module.css";
import { STEP_TIERS } from "./communitiesLanding.data";
import { buildSampleTeam } from "./communitiesSample.data";
import { buildSampleJoinRequest } from "./communitiesSteps.data";
import styles from "./CommunitiesWalkthrough.module.css";

/** The first step's visual: the ways in, then a request waiting in the
 *  team's queue. */
export function SampleJoinStep() {
  const { t } = useTranslation();
  return (
    <div className={styles.stack}>
      <SampleTierList />
      <div className={styles.queue}>
        <p className={styles.queueLabel}>
          {t("communities:detail.modtools.joinRequests.label")}
        </p>
        <SampleJoinRequestRow />
      </div>
    </div>
  );
}

/**
 * One row of the join queue, drawn as `ModJoinRequestRow` and
 * `JoinRequestApplicantCard` draw it, on their own stylesheet: who is asking,
 * the people you share, their note, and Approve or Decline. The product row
 * resolves staff badges from the server, so this renders the same markup.
 */
function SampleJoinRequestRow() {
  const { t } = useTranslation();
  const { person, sharedConnectionCount, note, timeLabel } =
    buildSampleJoinRequest(t);
  return (
    <div className={joinStyles.row}>
      <div className={joinStyles.applicant}>
        <Avatar
          initials={person.initials}
          tint={person.tint}
          src={person.avatarUrl ?? undefined}
          size={46}
        />
        <div className={joinStyles.main}>
          <div className={joinStyles.nameRow}>
            <span className={joinStyles.name}>{person.name}</span>
          </div>
          <div className={joinStyles.signals}>
            <span className={joinStyles.signal}>
              <FiUsers aria-hidden />
              {t(
                "communities:detail.modtools.joinRequests.applicant.sharedConnections",
                { count: sharedConnectionCount },
              )}
            </span>
          </div>
          <div className={joinStyles.line}>
            <span className={joinStyles.lineLabel}>
              {t(
                "communities:detail.modtools.joinRequests.applicant.noteLabel",
              )}
            </span>
            <p className={joinStyles.note}>{note}</p>
          </div>
          <div className={joinStyles.requested}>
            {t("communities:detail.modtools.joinRequests.requestedAgo", {
              time: timeLabel,
            })}
          </div>
        </div>
      </div>
      <div className={joinStyles.actions}>
        <Button variant="jade">
          <FiCheck aria-hidden />{" "}
          {t("communities:detail.modtools.joinRequests.approveCta")}
        </Button>
        <Button variant="ghost" size="sm" className={joinStyles.declineBtn}>
          <FiX aria-hidden />{" "}
          {t("communities:detail.modtools.joinRequests.declineCta")}
        </Button>
      </div>
    </div>
  );
}

/** The four ways in, each as the real tier pill with a line on what it does. */
function SampleTierList() {
  const { t } = useTranslation();
  return (
    <ul className={[styles.sheet, styles.tierList].join(" ")}>
      {STEP_TIERS.map((tier) => (
        <li key={tier} className={styles.tierRow}>
          <AccessTierBadge tier={tier} />
          <span className={styles.rowNote}>
            {t(`forCommunities:walkthrough.tier.${tier}`)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The people who run the sample collective, each with their real role pill. */
export function SampleTeamRoster() {
  const { t } = useTranslation();
  return (
    <div className={styles.sheet}>
      <p className={styles.sheetTitle}>
        {t("forCommunities:walkthrough.team.rosterTitle")}
      </p>
      <ul className={styles.teamList}>
        {buildSampleTeam().map(({ person, role }) => (
          <li key={person.name} className={styles.teamRow}>
            <Avatar
              initials={person.initials}
              tint={person.tint}
              src={person.avatarUrl ?? undefined}
              size={36}
              alt={person.name}
            />
            <span className={styles.teamName}>{person.name}</span>
            <RoleBadge role={role} />
          </li>
        ))}
      </ul>
    </div>
  );
}
