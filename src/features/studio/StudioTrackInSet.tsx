import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import trackStyles from "./track.module.css";

const IN_SET = {
  count: 312,
  curator: "Sara Marques",
  next: 7,
  countdown: "2:36",
};

export function StudioTrackInSet() {
  const { t } = useTranslation();
  return (
    <div className={trackStyles.inSet}>
      <span className={trackStyles.live} />
      <span>
        <Translation
          i18nKey="studio:track.inSet.status"
          components={{ b: <b />, em: <em /> }}
          values={IN_SET}
        />
      </span>
      <Link to={routes.studioLive}>
        {t("studio:track.inSet.joinCta")} <FiArrowRight aria-hidden />
      </Link>
    </div>
  );
}
