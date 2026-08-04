import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { GATHERING_DATE, GATHERING_TITLE } from "./manageGathering.data";
import styles from "./ManageGatheringPage.module.css";

interface ManageGatheringSidebarProps {
  onCopyLink: () => void;
}

/** Content, not chrome — the live listing URL for this gathering. */
const SHARE_URL = "queerpulse.com/g/pride-brunch-jun";

export function ManageGatheringSidebar({
  onCopyLink,
}: ManageGatheringSidebarProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const GATHERING = routes.gatherings;
  const CONTACT = routes.contact;
  return (
    <div className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbImg}>
          <div className={styles.sbImgLabel}>
            {t("gatherings:manage.sidebar.coverPhotoLine1")}
            <br />
            {t("gatherings:manage.sidebar.coverPhotoLine2")}
          </div>
        </div>
        <div className={styles.sbBody}>
          <div className={styles.sbTitle}>{GATHERING_TITLE}</div>
          <div className={styles.sbMeta}>
            {fmt.date(GATHERING_DATE, {
              weekday: "short",
              day: "numeric",
              month: "long",
            })}{" "}
            · {t("gatherings:hood.principeReal")}
          </div>
          <div className={styles.shareRow}>
            <div className={styles.shareUrl}>{SHARE_URL}</div>
            <Button
              variant="primary"
              className={styles.copyBtn}
              onClick={onCopyLink}
            >
              {t("gatherings:manage.sidebar.copyCta")}
            </Button>
          </div>
          <Link className={styles.sbViewLink} to={GATHERING}>
            {t("gatherings:manage.sidebar.viewListingCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
      </div>
      <div className={styles.supportCard}>
        <div className={styles.supText}>
          <Translation
            i18nKey="gatherings:manage.sidebar.supportText"
            components={{ a: <Link to={CONTACT} /> }}
          />
        </div>
      </div>
    </div>
  );
}
