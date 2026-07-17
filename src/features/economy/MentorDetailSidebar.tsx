import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { isWaitlisted, type Mentor } from "./mentorship.data";
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
  const { t } = useTranslation();
  return (
    <aside className={styles.side}>
      <div className={styles.sideCard}>
        <div className={styles.bookHead}>
          <h4>
            {t("economy:mentorDetail.sidebar.workWith", { firstName: first })}
          </h4>
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
            {isWaitlisted(m)
              ? t("economy:mentorship.cta.joinWaitlist")
              : t("economy:mentorship.cta.requestMatch")}
          </Button>
        </div>
        <p className={styles.sideFoot}>
          {t("economy:mentorDetail.sidebar.noUpfrontCost")}
        </p>
      </div>

      <div className={styles.sideCard}>
        <h4 className={styles.moreTitle}>
          {t("economy:mentorDetail.sidebar.notSureYet")}
        </h4>
        <div className={styles.moreLinks}>
          <Link to={routes.messages}>
            {t("economy:mentorDetail.sidebar.askQuestion", {
              firstName: first,
            })}
          </Link>
          <Link to={routes.mentorship}>
            {t("economy:mentorDetail.sidebar.browseAll")}
          </Link>
        </div>
      </div>
    </aside>
  );
}
