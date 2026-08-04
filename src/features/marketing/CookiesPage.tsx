import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useConsent } from "../../app/providers/useConsent";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { COOKIE_CATEGORIES } from "./cookies.data";
import styles from "./CookiesPage.module.css";

export function CookiesPage() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  // Persist through the real consent gate (spec 07) instead of throwing the
  // choice away. Analytics is the one opt-in category this page surfaces;
  // `monitoring` (error tracking) is left to the in-app preference center and
  // is preserved untouched on a granular save.
  const {
    consent,
    setConsent,
    acceptAll: acceptAllConsent,
    rejectAll,
  } = useConsent();
  const [analytics, setAnalytics] = useState(consent.analytics);
  const pageTitle = t("marketing:cookies.meta.title");
  const pageDescription = t("marketing:cookies.meta.description");

  // Reflect the stored choice — including the backend reconciliation the
  // provider runs on mount in live mode — so the toggle never drifts from what
  // is actually persisted.
  useEffect(() => {
    setAnalytics(consent.analytics);
  }, [consent.analytics]);

  const toggleFor: Record<
    string,
    { value: boolean; set: (v: boolean) => void }
  > = {
    analytics: { value: analytics, set: setAnalytics },
  };

  function save() {
    setConsent({ analytics, monitoring: consent.monitoring }, "preference_center");
    showToast(t("marketing:cookies.toast.saved"), "success");
  }
  function acceptAll() {
    setAnalytics(true);
    acceptAllConsent("preference_center");
    showToast(t("marketing:cookies.toast.saved"), "success");
  }
  function essentialOnly() {
    setAnalytics(false);
    rejectAll("preference_center");
    showToast(t("marketing:cookies.toast.saved"), "success");
  }

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.cookies },
        ])}
      />
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

      <div className={styles.body}>
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
                      {/* The switch's only visible name sits in .cardTitle,
                          which is not associated with the control — so the
                          label carries it for assistive tech. */}
                      <span className="visuallyHidden">{t(cat.titleKey)}</span>
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
                        <span className={styles.ckType}>{cookie.provider}</span>
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
                <span className={`${styles.sumVal} ${styles.sumReq}`}>
                  {t("marketing:cookies.alwaysOn")}
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
      </div>

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
