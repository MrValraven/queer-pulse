import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { routes } from "../../app/routeMap";
import { StudioShell } from "./StudioShell";
import { buildDeals, buildLicences } from "./studioTerms.data";
import s from "./studioTerms.module.css";

const checkIcon = (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M4 10.5l4 4 8-9" />
  </svg>
);

const xIcon = (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    aria-hidden
  >
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
);

export function StudioTermsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const deals = useMemo(() => buildDeals(), []);
  const licences = useMemo(() => buildLicences(t), [t]);

  return (
    <StudioShell hidePlayer>
      <div className={s.wrap}>
        <div className={s.pageH}>
          <div className={s.eb}>{t("studio:terms.eyebrow")}</div>
        </div>

        <div className={s.hero}>
          <div className={s.eb}>{t("studio:terms.hero.eyebrow")}</div>
          <h1>
            <Translation i18nKey="studio:terms.hero.title" components={{ em: <em /> }} />
          </h1>
          <p className={s.lede}>
            <Translation i18nKey="studio:terms.hero.lede" components={{ em: <em /> }} />
          </p>
        </div>

        <div className={s.deal}>
          {deals.map((d, i) => (
            <div key={i} className={s.dealCard}>
              <div className={s.ic}>{d.icon}</div>
              <h4>{d.title}</h4>
              <p>{d.body}</p>
            </div>
          ))}
        </div>

        <section className={s.sec}>
          <div className={s.num}>{t("studio:terms.sec.deed.num")}</div>
          <h2>
            <Translation i18nKey="studio:terms.sec.deed.heading" components={{ em: <em /> }} />
          </h2>
          <p>{t("studio:terms.sec.deed.p1")}</p>
          <p>
            <Translation
              i18nKey="studio:terms.sec.deed.p2"
              components={{ strong: <strong />, em: <em /> }}
            />
          </p>
          <div className={s.pull}>{t("studio:terms.sec.deed.pull")}</div>
          <p className={s.muted}>
            <Translation
              i18nKey="studio:terms.sec.deed.footnote"
              components={{ a: <Link to={routes.governance} /> }}
            />
          </p>
        </section>

        <section className={s.sec}>
          <div className={s.num}>{t("studio:terms.sec.licences.num")}</div>
          <h2>
            <Translation i18nKey="studio:terms.sec.licences.heading" components={{ em: <em /> }} />
          </h2>
          <p>{t("studio:terms.sec.licences.p1")}</p>
          <div className={s.licGrid}>
            {licences.map((lic) => (
              <div key={lic.code} className={s.lic}>
                <div className={s.code}>{lic.code}</div>
                <h4>{lic.title}</h4>
                <ul>
                  {lic.rows.map((row, i) => (
                    <li key={i} className={row.ok ? s.yes : s.no}>
                      {row.ok ? checkIcon : xIcon}
                      <span>{row.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className={s.muted}>
            <Translation i18nKey="studio:terms.sec.licences.footnote" components={{ em: <em /> }} />
          </p>
        </section>

        <section className={s.sec}>
          <div className={s.num}>{t("studio:terms.sec.privacy.num")}</div>
          <h2>
            <Translation i18nKey="studio:terms.sec.privacy.heading" components={{ em: <em /> }} />
          </h2>
          <p>
            <Translation
              i18nKey="studio:terms.sec.privacy.p1"
              components={{ strong: <strong /> }}
            />
          </p>
          <p className={s.muted}>
            <Translation
              i18nKey="studio:terms.sec.privacy.footnote"
              components={{ a: <Link to="/studio/settings" /> }}
            />
          </p>
        </section>

        <div className={s.meta}>
          <div className={s.mt}>
            <h4>{t("studio:terms.longVersions.title")}</h4>
            <p>{t("studio:terms.longVersions.meta")}</p>
          </div>
          <Button
            variant="ghost-dark"
            onClick={() => showToast(t("studio:terms.readFullTermsToast"), "info")}
          >
            {t("studio:terms.readFullTermsCta")}
          </Button>
          <Button
            variant="ghost-dark"
            onClick={() => showToast(t("studio:terms.readDeedToast"), "info")}
          >
            {t("studio:terms.readDeedCta")}
          </Button>
        </div>
      </div>
    </StudioShell>
  );
}
