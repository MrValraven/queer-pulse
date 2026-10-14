import { useId } from "react";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./StudioWithdrawnPage.module.css";

/** The cover the withdrawn view shows: a music note struck through. */
export function WithdrawnCoverArt() {
  return (
    <div className={s.cover} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx={6} cy={18} r={3} />
        <circle cx={18} cy={16} r={3} />
        <line x1={2} y1={2} x2={22} y2={22} />
      </svg>
    </div>
  );
}

/** A release our team took down after a report, shown in place at its own
 *  URL (or on /studio/withdrawn). The 410 names nothing, so neither does
 *  this view. */
export function StudioWithdrawnView() {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <section className={s.wrap} aria-labelledby={headingId}>
      <div className={s.hero}>
        <WithdrawnCoverArt />
        <div className={s.eb}>{t("studio:withdrawnLive.eyebrow")}</div>
        <h1 id={headingId}>
          <Translation
            i18nKey="studio:withdrawnLive.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={s.sub}>{t("studio:withdrawnLive.body")}</p>
      </div>
      <div className={s.actions}>
        <Button variant="primary" size="lg" to={routes.studio}>
          {t("studio:withdrawnLive.homeCta")}
        </Button>
        <Button variant="ghost" size="lg" to={routes.studioRights}>
          {t("studio:withdrawnLive.rightsCta")}
        </Button>
      </div>
    </section>
  );
}
