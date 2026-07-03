import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import type { Mentor } from "./mentorship.data";
import styles from "./MentorDetailPage.module.css";

/** Sticky booking-style facts card + secondary "not sure yet" links. */
export function MentorDetailSidebar({
  m,
  first,
  onRequest,
}: {
  m: Mentor;
  first: string;
  onRequest: () => void;
}) {
  return (
    <aside className={styles.side}>
      <div className={styles.sideCard}>
        <div className={styles.bookHead}>
          <h4>Work with {first}</h4>
          <div className={styles.bookPrice}>{m.price.main}</div>
          <div className={styles.bookPriceSub}>{m.price.sub}</div>
        </div>
        {m.sideRows.map((row) => (
          <div key={row.label} className={styles.row}>
            <span>{row.label}</span>
            <b
              className={
                row.jade ? styles.jade : row.accent ? styles.accent : undefined
              }
            >
              {row.value}
            </b>
          </div>
        ))}
        <div className={styles.sideBtnWrap}>
          <Button
            variant="primary"
            className={styles.sideBtn}
            onClick={onRequest}
          >
            {m.btn}
          </Button>
        </div>
        <p className={styles.sideFoot}>
          No upfront cost. Mentorship here is member-to-member — you can always
          ask a question before committing.
        </p>
      </div>

      <div className={styles.sideCard}>
        <h4 className={styles.moreTitle}>Not sure yet?</h4>
        <div className={styles.moreLinks}>
          <Link to={routes.messages}>→ Message {first} a question</Link>
          <Link to={routes.mentorship}>→ Browse all mentors</Link>
        </div>
      </div>
    </aside>
  );
}
