import { useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  INITIAL_GUESTS,
  nowClock,
  type Guest,
} from "../gatheringDashboard.data";
import { GATHERING_TITLE } from "../manageGathering.data";
import {
  CheckInColumn,
  GuestListCard,
  StatsColumn,
} from "../GatheringDashboardCards";
import { DEMO_GATHERING_SLUGS, manageGatheringPath } from "../data";
import { DoorShell } from "./DoorShell";
import styles from "../GatheringDashboardPage.module.css";

const MANAGE = manageGatheringPath(DEMO_GATHERING_SLUGS.dashboard);

/**
 * The day-of dashboard as a prototype: nine invented guests, a simulated
 * scanner and a static arrival sparkline.
 *
 * DEMO ONLY, and gated as such at the route (LOC-03). This exact screen used
 * to render in live mode too, which meant a real host standing at their own
 * door was shown a hardcoded title and other people's names, and every tap
 * flipped local state and toasted success. The live door is a different
 * component with a different data source.
 */
export function DemoDoorDashboard() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);

  const checkedIn = guests.filter((guest) => guest.status === "in").length;

  const checkInManual = (name: string) => {
    setGuests((previous) =>
      previous.map((guest) =>
        guest.name === name
          ? { ...guest, status: "in", time: nowClock() }
          : guest,
      ),
    );
    showToast(
      t("gatherings:dashboard.checkedInToast", { name: name.split(" ")[0]! }),
      "success",
    );
  };

  return (
    <DoorShell
      title={GATHERING_TITLE}
      manageTo={MANAGE}
      stats={[
        { value: checkedIn, labelKey: "gatherings:dashboard.checkedIn" },
        { value: 14, labelKey: "gatherings:dashboard.expected" },
        {
          value: 3,
          labelKey: "gatherings:dashboard.waitlist",
          emphasis: true,
        },
      ]}
    >
      <div className={styles.grid}>
        <CheckInColumn guests={guests} onCheckIn={checkInManual} />
        <GuestListCard
          guests={guests}
          checkedIn={checkedIn}
          onCheckIn={checkInManual}
        />
        <StatsColumn />
      </div>
    </DoorShell>
  );
}
