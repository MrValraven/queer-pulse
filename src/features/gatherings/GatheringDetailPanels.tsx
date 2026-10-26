import { GatheringAccessPanel } from "./GatheringAccessPanel";
import { GatheringAnnouncements } from "./GatheringAnnouncements";
import { GatheringPaymentDetails } from "./GatheringPaymentDetails";
import { GatheringWherePanel } from "./GatheringWherePanel";
import type { GatheringDetail } from "./data";

/**
 * Everything the gathering detail says below the description: what the
 * organisers have announced, where it actually is, and whether you can get in.
 *
 * Demo-only: the mock registry has no address, no accessibility answers and no
 * announcements, so a demo gathering would render three empty panels claiming
 * nobody has answered anything. It keeps the prototype's own single location
 * line in the sidebar instead. Cost is the one exception: a paid demo event
 * shows its price, with how to pay beneath it, as a panel of its own.
 */
export function GatheringDetailPanels({
  gathering,
  demoMode,
}: {
  gathering: GatheringDetail;
  demoMode: boolean;
}) {
  if (demoMode) {
    return <GatheringPaymentDetails gathering={gathering} isStandalone />;
  }

  return (
    <>
      <GatheringAnnouncements announcements={gathering.announcements ?? []} />
      <GatheringWherePanel gathering={gathering} />
      <GatheringAccessPanel gathering={gathering} />
    </>
  );
}
