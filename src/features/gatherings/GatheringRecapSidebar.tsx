import { FiCheck, FiClock } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import styles from "./GatheringRecapPage.module.css";

export function GatheringRecapSidebar({
  onCopyLink,
}: {
  onCopyLink: () => void;
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbLabel}>Event details</div>
        <div className={styles.sbRow}>
          <span className={styles.sdrLabel}>Date</span>
          <span className={styles.sdrVal}>21 June 2026</span>
        </div>
        <div className={styles.sbRow}>
          <span className={styles.sdrLabel}>Venue</span>
          <span className={styles.sdrVal}>A Cevicheria</span>
        </div>
        <div className={styles.sbRow}>
          <span className={styles.sdrLabel}>Attended</span>
          <span className={styles.sdrVal}>38 members</span>
        </div>
        <div className={styles.hostRow}>
          <Avatar initials="SR" tint="jade" size={34} />
          <div>
            <div className={styles.hostName}>Sofia Rodrigues</div>
            <div className={styles.hostRole}>Host</div>
          </div>
        </div>
      </div>

      <div className={styles.nextCard}>
        <div className={styles.nextEyebrow}>Coming up next</div>
        <div className={styles.nextTitle}>Queer Book Club — July</div>
        <div className={styles.nextDate}>Sat 19 July · LX Factory</div>
        <Button
          to={routes.rsvp}
          style={{
            width: "100%",
            justifyContent: "center",
            fontSize: 13,
            padding: "9px 16px",
          }}
        >
          RSVP →
        </Button>
      </div>

      <div className={styles.attendedCard}>
        <div className={styles.acRow}>
          <span style={{ color: "var(--jade)" }}>
            <FiCheck />
          </span>
          <div className={styles.acText}>You attended this gathering</div>
        </div>
        <span className={styles.acSoon} aria-disabled="true">
          <FiClock /> Add to your year in review
          <span className={styles.acSoonBadge}>Soon</span>
        </span>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.shareRow}>
          <div className={styles.shareLabel}>Share this recap</div>
          <Button
            variant="ghost"
            style={{ fontSize: 12.5, padding: "8px 14px" }}
            onClick={onCopyLink}
          >
            Copy link
          </Button>
        </div>
      </div>
    </aside>
  );
}
