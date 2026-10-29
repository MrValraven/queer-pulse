import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ALBUM } from "./studioAlbum.data";
import { fixtureDate, WEEKDAY_DAY_MONTH } from "./studioFixtureDate";
import s from "./creator.module.css";
import { studioPaymentsPath } from "./studioPaths";

export function StudioDashboardSide() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={s.col}>
      <div className={s.card}>
        <div className={s.cardH}>
          <h3>
            <Translation
              i18nKey="studio:dashboard.side.quickActions.heading"
              components={{ em: <em /> }}
            />
          </h3>
        </div>
        <div className={s.quickList}>
          <Link to={routes.studioUpload} className={s.quickItem}>
            <span className={s.quickIc}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </span>
            <span className={s.quickNm}>
              {t("studio:dashboard.side.quickActions.upload.label")}
              <small>
                {t("studio:dashboard.side.quickActions.upload.hint")}
              </small>
            </span>
            <span className={s.quickArr} aria-hidden>
              <FiArrowRight />
            </span>
          </Link>
          <Link to={routes.studio} className={s.quickItem}>
            <span className={s.quickIc}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx={12} cy={12} r={9} />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>
            <span className={s.quickNm}>
              {t("studio:dashboard.side.quickActions.goLive.label")}
              <small>
                {t("studio:demo.dashboard.goLivePlan", {
                  date: fmt.date(fixtureDate("2026-06-10"), WEEKDAY_DAY_MONTH),
                  title: ALBUM.title,
                })}
              </small>
            </span>
            <span className={s.quickArr} aria-hidden>
              <FiArrowRight />
            </span>
          </Link>
          <Link to={studioPaymentsPath()} className={s.quickItem}>
            <span className={s.quickIc}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            <span className={s.quickNm}>
              {t("studio:dashboard.side.quickActions.payments.label")}
              <small>
                {t("studio:dashboard.side.quickActions.payments.hint")}
              </small>
            </span>
            <span className={s.quickArr} aria-hidden>
              <FiArrowRight />
            </span>
          </Link>
        </div>
      </div>

      <div className={s.sideCard}>
        <div className={s.sideEb}>
          {t("studio:dashboard.side.deal.eyebrow")}
        </div>
        <h4>
          <Translation
            i18nKey="studio:dashboard.side.deal.heading"
            components={{ em: <em /> }}
          />
        </h4>
        <p>{t("studio:dashboard.side.deal.body")}</p>
        <ul className={s.sideList}>
          <li>
            <span>{t("studio:dashboard.side.deal.buys.label")}</span>
            <em>{t("studio:dashboard.side.deal.buys.value")}</em>
          </li>
          <li>
            <span>{t("studio:dashboard.side.deal.platform.label")}</span>
            <em>{t("studio:dashboard.side.deal.platform.value")}</em>
          </li>
          <li>
            <span>{t("studio:dashboard.side.deal.tips.label")}</span>
            <em>{t("studio:dashboard.side.deal.tips.value")}</em>
          </li>
        </ul>
      </div>
    </div>
  );
}
