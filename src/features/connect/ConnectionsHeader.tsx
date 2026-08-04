import { FiInfo, FiUserPlus } from "react-icons/fi";
import { Button, FeatureHelp } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ConnectionsPage.module.css";

/** Page title, lead, invite CTA, and the cross-language reminder note. */
export function ConnectionsHeader() {
  const { t } = useTranslation();
  return (
    <>
      <header className={styles.head}>
        <div className={styles.headText}>
          <div className={styles.eyebrow}>{t("connect:page.eyebrow")}</div>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="connect:page.title"
              components={{ em: <em /> }}
            />{" "}
            <FeatureHelp id="connect.connections" />
          </h1>
          <p className={styles.lead}>{t("connect:page.lead")}</p>
        </div>
        <div className={styles.headActions}>
          <Button variant="primary" to={routes.invite}>
            <FiUserPlus />
            {t("connect:page.inviteCta")}
          </Button>
        </div>
      </header>

      <div className={styles.langNote}>
        <span>
          <FiInfo />
        </span>
        <span>
          <Translation i18nKey="connect:page.note" components={{ b: <b /> }} />
        </span>
      </div>
    </>
  );
}
