import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { COOKIE_CATEGORIES } from "./cookies.data";
import styles from "./CookiesPage.module.css";

export function CookiesPage() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  const toggleFor: Record<
    string,
    { value: boolean; set: (v: boolean) => void }
  > = {
    functional: { value: functional, set: setFunctional },
    analytics: { value: analytics, set: setAnalytics },
  };

  function save() {
    showToast(t("marketing:cookies.toast.saved"), "success");
  }
  function acceptAll() {
    setFunctional(true);
    setAnalytics(true);
    showToast(t("marketing:cookies.toast.saved"), "success");
  }
  function essentialOnly() {
    setFunctional(false);
    setAnalytics(false);
    showToast(t("marketing:cookies.toast.saved"), "success");
  }

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className={styles.eyebrow}>{t("marketing:cookies.eyebrow")}</div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="marketing:cookies.h1"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.sub}>{t("marketing:cookies.sub")}</p>
      </header>

      <main className={styles.body}>
        <div className={styles.layout}>
          <div className={styles.group}>
            {COOKIE_CATEGORIES.map((cat) => {
              const toggle = toggleFor[cat.id];
              return (
                <div key={cat.id} className={styles.card}>
                  <div className={styles.cardHead}>
                    <div>
                      <div className={styles.cardTitle}>{t(cat.titleKey)}</div>
                      {cat.required && (
                        <div className={styles.cardReq}>
                          {t("marketing:cookies.alwaysOn")}
                        </div>
                      )}
                    </div>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={cat.required ? true : (toggle?.value ?? false)}
                        disabled={cat.required}
                        onChange={(e) => toggle?.set(e.target.checked)}
                      />
                      <span className={styles.toggleTrack} />
                      <span className={styles.toggleThumb} />
                    </label>
                  </div>
                  <p className={styles.cardBody}>{t(cat.bodyKey)}</p>
                  <div className={styles.rowHead}>
                    <span className={styles.colLabel}>
                      {t("marketing:cookies.columns.name")}
                    </span>
                    <span className={styles.colLabel}>
                      {t("marketing:cookies.columns.expires")}
                    </span>
                    <span className={styles.colLabel}>
                      {t("marketing:cookies.columns.provider")}
                    </span>
                  </div>
                  <div className={styles.list}>
                    {cat.cookies.map((cookie) => (
                      <div key={cookie.name} className={styles.row}>
                        <span className={styles.ckName}>{cookie.name}</span>
                        <span className={styles.ckExp}>
                          {t(cookie.expiresKey)}
                        </span>
                        <span className={styles.ckType}>
                          {cookie.provider}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className={styles.noAds}>
              <div className={styles.noAdsTitle}>
                {t("marketing:cookies.noAds.title")}
              </div>
              <p>{t("marketing:cookies.noAds.body")}</p>
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.summary}>
              <h3>
                <Translation
                  i18nKey="marketing:cookies.summary.title"
                  components={{ em: <em /> }}
                />
              </h3>
              <div className={styles.sumRow}>
                <span className={styles.sumName}>
                  {t("marketing:cookies.summary.essential")}
                </span>
                <span className={`${styles.sumVal} ${styles.sumReq}`}>
                  {t("marketing:cookies.alwaysOn")}
                </span>
              </div>
              <div className={styles.sumRow}>
                <span className={styles.sumName}>
                  {t("marketing:cookies.summary.functional")}
                </span>
                <span
                  className={`${styles.sumVal} ${functional ? styles.sumOn : styles.sumOff}`}
                >
                  {functional
                    ? t("marketing:cookies.summary.on")
                    : t("marketing:cookies.summary.off")}
                </span>
              </div>
              <div className={styles.sumRow}>
                <span className={styles.sumName}>
                  {t("marketing:cookies.summary.analytics")}
                </span>
                <span
                  className={`${styles.sumVal} ${analytics ? styles.sumOn : styles.sumOff}`}
                >
                  {analytics
                    ? t("marketing:cookies.summary.on")
                    : t("marketing:cookies.summary.off")}
                </span>
              </div>
              <div className={styles.actions}>
                <Button variant="primary" onClick={save}>
                  {t("marketing:cookies.actions.save")}
                </Button>
                <Button variant="ghost" onClick={acceptAll}>
                  {t("marketing:cookies.actions.acceptAll")}
                </Button>
                <Button variant="ghost" onClick={essentialOnly}>
                  {t("marketing:cookies.actions.essentialOnly")}
                </Button>
              </div>
            </div>
            <div className={styles.info}>
              <Translation
                i18nKey="marketing:cookies.info"
                components={{
                  settingsLink: <Link to={routes.settings} />,
                  privacyLink: <Link to={routes.privacy} />,
                }}
              />
            </div>
          </aside>
        </div>
      </main>

      <Outro
        title={
          <Translation
            i18nKey="marketing:cookies.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:cookies.outro.sub")}
      >
        <Button variant="ghost-dark" size="lg" to={routes.privacy}>
          {t("marketing:cookies.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
