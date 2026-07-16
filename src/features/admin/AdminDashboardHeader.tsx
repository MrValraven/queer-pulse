import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import styles from "./AdminDashboardPage.module.css";

/** Fixed demo "now" the eyebrow timestamp is built from — formatted via
 *  useFormat() rather than baked as a hardcoded English string. */
const DEMO_NOW = new Date(2026, 5, 28, 9, 14);

export function AdminDashboardHeader() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.ph}>
      <div className={styles.phText}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden />
          {fmt.date(DEMO_NOW, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · {fmt.time(DEMO_NOW)}
        </div>
        <h1 className={styles.h1}>
          {t("admin:dashboard.header.titleLine1")}
          <br />
          <Translation
            i18nKey="admin:dashboard.header.titleLine2"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.phSub}>{t("admin:dashboard.header.sub")}</p>
      </div>
      <div className={styles.phActions}>
        <Button
          variant="ghost"
          onClick={() =>
            showToast(t("admin:dashboard.header.digestToast"), "info")
          }
        >
          {t("admin:dashboard.header.digestCta")}
        </Button>
        <Button variant="primary" to={routes.adminModeration}>
          {t("admin:dashboard.header.moderationCta")} →
        </Button>
      </div>
    </div>
  );
}
