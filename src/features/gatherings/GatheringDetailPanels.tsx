import { useState } from "react";
import { FiShield } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GatheringAccessPanel } from "./GatheringAccessPanel";
import { GatheringAnnouncements } from "./GatheringAnnouncements";
import { GatheringWherePanel } from "./GatheringWherePanel";
import { SharePlansModal } from "./SharePlansModal";
import type { GatheringDetail } from "./data";
import { useGatheringPreview } from "./guestPreview/gatheringPreviewContext";
import styles from "./GatheringDetailPanels.module.css";

/**
 * Everything the gathering detail says below the description: what the
 * organisers have announced, where it actually is, whether you can get in, and
 * the one-tap way to tell somebody you trust where you are going.
 *
 * Demo-only: the mock registry has no address, no accessibility answers and no
 * announcements, so a demo gathering would render three empty panels claiming
 * nobody has answered anything. It keeps the prototype's own single location
 * line in the sidebar instead.
 */
export function GatheringDetailPanels({
  gathering,
  demoMode,
}: {
  gathering: GatheringDetail;
  demoMode: boolean;
}) {
  const { t } = useTranslation();
  const [isSharePlansOpenLocally, setIsSharePlansOpenLocally] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { viewAs } = useGatheringPreview();
  if (demoMode) return null;

  const isGoing =
    gathering.myRsvpStatus === "going" ||
    gathering.myRsvpStatus === "waitlisted";
  // `?share=plans` opens Share plans on arrival (the Go together group sheet
  // links here). Derived from the URL on every render, so it also opens when
  // the member is already on this page and only the query changes.
  const isSharePlansRequested =
    viewAs === null && isGoing && searchParams.get("share") === "plans";
  const isSharePlansOpen = isSharePlansOpenLocally || isSharePlansRequested;
  const closeSharePlans = () => {
    setIsSharePlansOpenLocally(false);
    if (!searchParams.has("share")) return;
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("share");
    setSearchParams(nextSearchParams, { replace: true });
  };

  return (
    <>
      <GatheringAnnouncements announcements={gathering.announcements ?? []} />
      <GatheringWherePanel gathering={gathering} />
      <GatheringAccessPanel gathering={gathering} />

      {isGoing && (
        <section className={styles.panel}>
          <h2 className={styles.heading}>
            {t("gatherings:sharePlans.panelHeading")}
          </h2>
          <p className={styles.lead}>{t("gatherings:sharePlans.panelLead")}</p>
          <Button
            variant="ghost"
            onClick={() => setIsSharePlansOpenLocally(true)}
          >
            <FiShield aria-hidden /> {t("gatherings:sharePlans.openCta")}
          </Button>
        </section>
      )}

      {isSharePlansOpen && (
        <SharePlansModal gathering={gathering} onClose={closeSharePlans} />
      )}
    </>
  );
}
