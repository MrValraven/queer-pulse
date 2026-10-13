import { Link } from "react-router-dom";
import { FiArrowRight, FiShield } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  STUDIO_MUSIC_FUNDRAISERS_HREF,
  STUDIO_NEW_MUSIC_FUNDING_POST_HREF,
} from "./studioPaths";
import css from "./StudioSolidarity.module.css";

/** /studio/solidarity-fund in live: QueerPulse never handles money, so the
 *  page points at Funding & Grants fundraisers tagged music, at starting
 *  one, and at Studio's open calls. */
export function StudioSolidarityFundLive() {
  const { t } = useTranslation();
  return (
    <div className={css.wrap}>
      <div className={css.eyebrow}>{t("studio:fundLive.eyebrow")}</div>
      <h1 className={css.title}>
        <Translation
          i18nKey="studio:fundLive.title"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={css.body}>{t("studio:fundLive.body")}</p>
      <p className={css.safety}>
        <FiShield aria-hidden /> {t("studio:fundLive.safety")}
      </p>
      <div className={css.actions}>
        <Link to={STUDIO_MUSIC_FUNDRAISERS_HREF} className={css.primary}>
          {t("studio:fundLive.fundraisersCta")} <FiArrowRight aria-hidden />
        </Link>
        <Link to={STUDIO_NEW_MUSIC_FUNDING_POST_HREF} className={css.secondary}>
          {t("studio:fundLive.startCta")}
        </Link>
        <Link to={routes.studioCalls} className={css.secondary}>
          {t("studio:fundLive.callsCta")}
        </Link>
      </div>
    </div>
  );
}
