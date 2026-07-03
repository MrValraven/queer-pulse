import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useToast } from "../../shared/components/feedback/useToast";
import type { Workshop } from "./workshops.data";
import { WorkshopReserveModal } from "./WorkshopReserveModal";
import styles from "./WorkshopPage.module.css";

export function WorkshopSidebar({ workshop }: { workshop: Workshop }) {
  const [reserving, setReserving] = useState(false);
  const { showToast } = useToast();
  const filledPct = Math.round(
    (workshop.spotsFilled / workshop.spotsTotal) * 100,
  );
  const full = workshop.spotsFilled >= workshop.spotsTotal;

  return (
    <aside className={styles.side}>
      <div className={styles.card}>
        <div className={styles.bookHead}>
          <h4>Reserve a seat</h4>
          <div className={styles.price}>
            €<em>{workshop.price.replace(/[^0-9]/g, "")}</em>
          </div>
          <div className={styles.priceSub}>{workshop.priceSub}</div>
        </div>

        <div className={styles.row}>
          <span>Spots filled</span>
          <b>
            {workshop.spotsFilled} / {workshop.spotsTotal}
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
          <span>Start date</span>
          <b>{workshop.startDate}</b>
        </div>
        <div className={styles.row}>
          <span>Cancellation</span>
          <b>{workshop.cancellation}</b>
        </div>

        <div className={styles.cta}>
          <Button
            variant="primary"
            disabled={full}
            onClick={() => setReserving(true)}
          >
            {full ? "Cohort is full" : "Reserve a spot →"}
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              showToast(
                `We'll pass your question to ${workshop.tutor.name.split(" ")[0]}.`,
                "success",
              )
            }
          >
            <FiMail aria-hidden /> Ask a question
          </Button>
        </div>
        <p className={styles.footNote}>
          Solidarity rate · just say so on the form, no proof of anything. No
          one sees which rate you picked.
        </p>
      </div>

      <div className={styles.card}>
        <h4 className={styles.cardLabel}>Taught by</h4>
        <div className={styles.tutorRow}>
          <Avatar
            initials={workshop.tutor.initials}
            tint={workshop.tutor.tint}
            size={42}
          />
          <div>
            <div className={styles.tutorName}>
              {workshop.tutor.memberSlug ? (
                <Link to={`${routes.members}/${workshop.tutor.memberSlug}`}>
                  {workshop.tutor.name}
                </Link>
              ) : (
                workshop.tutor.name
              )}
            </div>
            <div className={styles.tutorRole}>{workshop.tutor.role}</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h4 className={styles.cardLabel}>Where</h4>
        <p className={styles.whereAddr}>
          <b className={styles.whereName}>{workshop.location.name}</b>
          {workshop.location.address}
        </p>
        <p className={styles.whereAccess}>{workshop.location.access}</p>
      </div>

      {reserving && (
        <WorkshopReserveModal
          workshop={workshop}
          onClose={() => setReserving(false)}
        />
      )}
    </aside>
  );
}
