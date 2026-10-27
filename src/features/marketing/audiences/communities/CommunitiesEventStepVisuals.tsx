import { useTranslation } from "../../../../shared/i18n/useTranslation";
import listStyles from "../../../gatherings/checkin/CheckinGuestList.module.css";
import { CheckinGuestRow } from "../../../gatherings/checkin/CheckinGuestRow";
import { GatheringCommunityRow } from "../../../gatherings/GatheringCommunityRow";
import gatheringStyles from "../../../gatherings/GatheringPage.module.css";
import { GoingAttendeeChip } from "../../../gatherings/GoingAttendeeChip";
import goingStyles from "../../../gatherings/GoingAttendeesPreview.module.css";
import {
  buildSampleDoorGuests,
  buildSampleGoing,
  SAMPLE_GUEST_COMMUNITY,
  SAMPLE_LEAD_COMMUNITY,
} from "./communitiesSteps.data";
import styles from "./CommunitiesWalkthrough.module.css";

/** The frame is inert, so the rows' actions never run. */
function ignoreAction() {
  return undefined;
}

/**
 * Who puts the event on, as the event page shows it: the "Who's going" row
 * with the host and co-host tags, then the "Hosted with" card naming the
 * hosting community and a guest community that said yes.
 */
export function SampleEventHosts() {
  const { t } = useTranslation();
  return (
    <div className={styles.sheet}>
      <div className={goingStyles.heading}>
        {t("gatherings:gathering.attendeesPreview.heading")}
      </div>
      <div className={goingStyles.list}>
        {buildSampleGoing().map(({ person, role }) => (
          <GoingAttendeeChip key={person.slug} person={person} role={role} />
        ))}
      </div>
      <div className={styles.hostedWith}>
        <div className={gatheringStyles.sh}>
          {t("gatherings:gathering.hostedWithHeading")}
        </div>
        <GatheringCommunityRow
          community={SAMPLE_LEAD_COMMUNITY}
          roleLabel={t("gatherings:gathering.hostedWithRole")}
        />
        <GatheringCommunityRow
          community={SAMPLE_GUEST_COMMUNITY}
          roleLabel={t("gatherings:gathering.guestCommunityRole")}
        />
      </div>
    </div>
  );
}

/**
 * The door on the night: the real Check-in tab rows in the tab's own list,
 * one guest already in with the time they arrived, two still waiting for a
 * host to check them in.
 */
export function SampleDoorList({ today }: { today: Date }) {
  return (
    <div className={[styles.sheet, styles.doorList].join(" ")}>
      {/* The tab's own list, so a narrow frame picks the compact chip. */}
      <div className={listStyles.list}>
        {buildSampleDoorGuests(today).map((attendee) => (
          <CheckinGuestRow
            key={attendee.slug}
            attendee={attendee}
            isPending={false}
            canCheckIn
            onCheckIn={ignoreAction}
            onUndo={ignoreAction}
            onShowDetails={ignoreAction}
          />
        ))}
      </div>
    </div>
  );
}
