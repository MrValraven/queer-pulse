import { routes } from "../../../app/routeMap";
import { PageShell } from "../../../shared/components/layout";
import { Button, Eyebrow } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./AddEventMonthPage.module.css";
import { EVENT_BATCH_FAILURE_KEYS } from "./eventBatchErrors";

/** The month page for a member without the early access grant: it names
 *  the per-member switch and leads back to hosting. */
export function AddEventMonthNoAccess() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.column}>
            <header className={styles.head}>
              <Eyebrow className={styles.eyebrow}>
                {t("gatherings:addMonth.page.eyebrow")}
              </Eyebrow>
              <h1 className={styles.title}>
                {t("gatherings:addMonth.page.title")}
              </h1>
              <p className={styles.lede}>
                {t(EVENT_BATCH_FAILURE_KEYS.noAccess)}
              </p>
            </header>
            <Button variant="ghost" to={routes.host}>
              {t("gatherings:addMonth.noAccess.backToHost")}
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
