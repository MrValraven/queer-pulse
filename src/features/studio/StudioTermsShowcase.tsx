import { useMemo } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { buildLicences } from "./studioTerms.data";
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

/** Demo only: the deed, the licences, the privacy
 *  promise and the version line, under their original keys. */
export function StudioTermsShowcase() {
  const { t } = useTranslation();
  const licences = useMemo(() => buildLicences(t), [t]);
  return (
    <>
      <section className={s.sec}>
        <div className={s.num}>{t("studio:terms.sec.deed.num")}</div>
        <h2>
          <Translation
            i18nKey="studio:terms.sec.deed.heading"
            components={{ em: <em /> }}
          />
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
          <Translation
            i18nKey="studio:terms.sec.licences.heading"
            components={{ em: <em /> }}
          />
        </h2>
        <p>{t("studio:terms.sec.licences.p1")}</p>
        <div className={s.licGrid}>
          {licences.map((licence) => (
            <div key={licence.code} className={s.lic}>
              <div className={s.code}>{licence.code}</div>
              <h3>{licence.title}</h3>
              <ul>
                {licence.rows.map((row, rowIndex) => (
                  <li key={rowIndex} className={row.ok ? s.yes : s.no}>
                    {row.ok ? checkIcon : xIcon}
                    <span>{row.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className={s.muted}>
          <Translation
            i18nKey="studio:terms.sec.licences.footnote"
            components={{ em: <em /> }}
          />
        </p>
      </section>

      <section className={s.sec}>
        <div className={s.num}>{t("studio:terms.sec.privacy.num")}</div>
        <h2>
          <Translation
            i18nKey="studio:terms.sec.privacy.heading"
            components={{ em: <em /> }}
          />
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
            components={{ a: <Link to={routes.studioSettings} /> }}
          />
        </p>
      </section>

      <p className={s.muted}>{t("studio:terms.longVersions.meta")}</p>
    </>
  );
}

/** Demo only: the co-op deed has no page yet, so the button says so. */
export function StudioTermsDeedButton() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  return (
    <Button
      variant="ghost"
      onClick={() => showToast(t("studio:terms.readDeedToast"), "info")}
    >
      {t("studio:terms.readDeedCta")}
    </Button>
  );
}
