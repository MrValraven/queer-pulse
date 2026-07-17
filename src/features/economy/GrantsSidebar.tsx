import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./GrantsPage.module.css";

export function GrantsSidebar() {
  const { t } = useTranslation();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sideCard}>
        <h4>
          <Translation
            i18nKey="economy:grants.sidebar.microGrants.title"
            components={{ em: <em /> }}
          />
        </h4>
        <p>{t("economy:grants.sidebar.microGrants.body")}</p>
        <Link to={routes.grants}>
          {t("economy:grants.sidebar.microGrants.cta")}
        </Link>
      </div>
      <div className={styles.sideCard}>
        <h4>{t("economy:grants.sidebar.skillsExchange.title")}</h4>
        <p>{t("economy:grants.sidebar.skillsExchange.body")}</p>
        <Link to={routes.barter}>
          {t("economy:grants.sidebar.skillsExchange.cta")}
        </Link>
      </div>
      <div
        className={styles.sideCard}
        style={{
          background: "rgba(var(--jade-rgb),.05)",
          borderColor: "rgba(var(--jade-rgb),.2)",
        }}
      >
        <h4>
          <Translation
            i18nKey="economy:grants.sidebar.appHelp.title"
            components={{ em: <em /> }}
          />
        </h4>
        <p>{t("economy:grants.sidebar.appHelp.body")}</p>
        <Link to={routes.skills}>
          {t("economy:grants.sidebar.appHelp.cta")}
        </Link>
      </div>
    </aside>
  );
}
