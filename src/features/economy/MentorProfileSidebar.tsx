import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BOOK_ROWS, MENTOR, MORE_FROM } from "./mentorProfile.data";
import { MentorApplyModal } from "./MentorApplyModal";
import styles from "./MentorProfilePage.module.css";

export function MentorProfileSidebar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const mentorName = `${MENTOR.firstName} ${MENTOR.lastName}`;

  return (
    <aside className={styles.side}>
      <div className={styles.sideCard} id="apply">
        <div className={styles.bookHead}>
          <h4>{t("economy:mentorProfile.sidebar.applyTitle")}</h4>
          <div className={styles.bookPrice}>
            €<em>0</em> + €<em>20</em>/mo
          </div>
          <div className={styles.bookPriceSub}>
            {t("economy:mentorProfile.sidebar.noUpfrontCost")}
          </div>
        </div>
        {BOOK_ROWS.map((row) => (
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
          <Button variant="primary" onClick={() => setOpen(true)}>
            {t("economy:mentorProfile.sidebar.openApplication")}
          </Button>
        </div>
        <p className={styles.sideFoot}>
          {t("economy:mentorProfile.sidebar.freeSustainer")}
        </p>
      </div>

      <div className={styles.sideCard}>
        <h4 className={styles.moreTitle}>
          {t("economy:mentorProfile.sidebar.moreFrom", {
            firstName: MENTOR.firstName,
          })}
        </h4>
        <div className={styles.moreLinks}>
          {MORE_FROM.map((link) => (
            <a key={link} href="#apply">
              {link}
            </a>
          ))}
        </div>
      </div>

      {open && (
        <MentorApplyModal
          mentorName={mentorName}
          onClose={() => setOpen(false)}
        />
      )}
    </aside>
  );
}
