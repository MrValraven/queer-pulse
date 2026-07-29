import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useToast } from "../../shared/components/feedback/useToast";
import { useWorkshopsActions } from "../../app/providers/useWorkshops";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { WorkshopWithRsvp } from "./api/workshops.adapters";
import { WorkshopRsvpControl } from "./WorkshopRsvpControl";
import { WorkshopHostControls } from "./WorkshopHostControls";
import styles from "./WorkshopPage.module.css";

export function WorkshopSidebar({ workshop }: { workshop: WorkshopWithRsvp }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { getRsvp } = useWorkshopsActions();

  // Read the counts through the RSVP overlay, not off the row: taking or
  // giving back a spot has to move the "3 / 8" and the bar immediately, in demo
  // mode as well as live.
  const { spotsFilled, spotsTotal } = getRsvp(workshop.id, {
    status: workshop.myRsvpStatus ?? null,
    spotsFilled: workshop.spotsFilled,
    spotsTotal: workshop.spotsTotal,
  });
  const filledPct = spotsTotal
    ? Math.min(100, Math.round((spotsFilled / spotsTotal) * 100))
    : 0;

  return (
    <aside className={styles.side}>
      {/* Renders nothing unless the viewer hosts this workshop. */}
      <WorkshopHostControls workshop={workshop} />

      <div className={styles.card}>
        <div className={styles.bookHead}>
          <h4>{t("economy:workshopSidebar.reserveTitle")}</h4>
          <div className={styles.price}>
            €<em>{workshop.price.replace(/[^0-9]/g, "")}</em>
          </div>
          <div className={styles.priceSub}>{workshop.priceSub}</div>
        </div>

        <div className={styles.row}>
          <span>{t("economy:workshopSidebar.spotsFilled")}</span>
          <b>
            {spotsFilled} / {spotsTotal}
          </b>
        </div>
        <div className={styles.spotsBar}>
          <span style={{ width: `${filledPct}%` }} />
        </div>
        {workshop.tiers.map((tier) => (
          <div key={tier.label} className={styles.row}>
            <span>{tier.label}</span>
            {tier.sliding ? (
              <span className={styles.sliding}>{tier.amount}</span>
            ) : (
              <b>{tier.amount}</b>
            )}
          </div>
        ))}
        <div className={styles.row}>
          <span>{t("economy:workshopSidebar.startDate")}</span>
          <b>{workshop.startDate}</b>
        </div>
        <div className={styles.row}>
          <span>{t("economy:workshopSidebar.cancellation")}</span>
          <b>{workshop.cancellation}</b>
        </div>

        {/* The host is teaching this, not attending it — they get the count of
            who has booked instead of a control that would 403. */}
        {workshop.isHost ? (
          <p className={styles.rsvpState}>
            <b>
              {spotsFilled === 0
                ? t("economy:workshopRsvp.hostCountNone")
                : t("economy:workshopRsvp.hostCount", { count: spotsFilled })}
            </b>
            {t("economy:workshopRsvp.hostNote")}
          </p>
        ) : (
          <WorkshopRsvpControl workshop={workshop} />
        )}

        <div className={styles.cta}>
          <Button
            variant="ghost"
            onClick={() =>
              showToast(
                t("economy:workshopSidebar.askQuestionToast", {
                  firstName:
                    workshop.tutor.name.split(" ")[0] ?? workshop.tutor.name,
                }),
                "success",
              )
            }
          >
            <FiMail aria-hidden /> {t("economy:workshopSidebar.askQuestion")}
          </Button>
        </div>
        <p className={styles.footNote}>
          {t("economy:workshopSidebar.footNote")}
        </p>
      </div>

      <div className={styles.card}>
        <h4 className={styles.cardLabel}>
          {t("economy:workshopSidebar.taughtBy")}
        </h4>
        <div className={styles.tutorRow}>
          <Avatar
            initials={workshop.tutor.initials}
            tint={workshop.tutor.tint}
            size={42}
          />
          <div>
            <div className={styles.tutorName}>
              <span className={styles.nameRow}>
                {workshop.tutor.memberSlug ? (
                  <Link to={`${routes.members}/${workshop.tutor.memberSlug}`}>
                    {workshop.tutor.name}
                  </Link>
                ) : (
                  workshop.tutor.name
                )}
                <MemberStaffBadge slug={workshop.tutor.memberSlug} />
              </span>
            </div>
            <div className={styles.tutorRole}>{workshop.tutor.role}</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h4 className={styles.cardLabel}>
          {t("economy:workshopSidebar.where")}
        </h4>
        <p className={styles.whereAddr}>
          <b className={styles.whereName}>{workshop.location.name}</b>
          {workshop.location.address}
        </p>
        <p className={styles.whereAccess}>{workshop.location.access}</p>
      </div>
    </aside>
  );
}
