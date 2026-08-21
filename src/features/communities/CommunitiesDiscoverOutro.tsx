import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./CommunitiesPage.module.css";

/** The plum-panel CTA below the Discover grid, nudging anyone who didn't find
 *  their people toward starting a community. Split out of `CommunitiesDiscover`
 *  purely to keep that component under the repo's 200-line cap — it's static,
 *  so it takes no props. */
export function CommunitiesDiscoverOutro() {
  const { t } = useTranslation();

  return (
    <Reveal className={styles.outro}>
      <div className={styles.outroInner}>
        <h2 className={styles.outroTitle}>
          <Translation
            i18nKey="communities:discover.outro.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.outroBodyLead}>
          {t("communities:discover.outro.body")}
        </p>
        <p className={styles.outroBody}>
          {t("communities:discover.outro.body2")}
        </p>
        <Button variant="ghost-dark" to={routes.startCommunity}>
          {t("communities:discover.outro.cta")}
        </Button>
      </div>
    </Reveal>
  );
}
