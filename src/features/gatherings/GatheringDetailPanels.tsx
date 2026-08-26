import { useState } from "react";
import { FiShield } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GatheringAccessPanel } from "./GatheringAccessPanel";
import { GatheringAnnouncements } from "./GatheringAnnouncements";
import { GatheringWherePanel } from "./GatheringWherePanel";
import { SharePlansModal } from "./SharePlansModal";
import type { GatheringDetail } from "./data";
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
  const [isSharePlansOpen, setIsSharePlansOpen] = useState(false);
  if (demoMode) return null;

  const isGoing =
    gathering.myRsvpStatus === "going" ||
    gathering.myRsvpStatus === "waitlisted";

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
          <Button variant="ghost" onClick={() => setIsSharePlansOpen(true)}>
            <FiShield aria-hidden /> {t("gatherings:sharePlans.openCta")}
          </Button>
        </section>
      )}

      {isSharePlansOpen && (
        <SharePlansModal
          gathering={gathering}
          onClose={() => setIsSharePlansOpen(false)}
        />
      )}
    </>
  );
}
