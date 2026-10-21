import { useId } from "react";
import { FiCompass } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_WELCOME_REQUEST_STATE } from "./studioFirstRunConstants";
import css from "./StudioFirstRun.module.css";

/** Studio Help's way back into the welcome: opens Studio home with the
 *  welcome on top, the picks made before already ticked. */
export function StudioFirstRunHelpEntry() {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <section className={css.helpEntry} aria-labelledby={headingId}>
      <span className={css.helpIcon}>
        <FiCompass aria-hidden />
      </span>
      <div className={css.helpText}>
        <h2 id={headingId} className={css.helpHeading}>
          <Translation
            i18nKey="studio:firstRun.help.heading"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={css.helpBody}>{t("studio:firstRun.help.body")}</p>
      </div>
      <Button
        variant="quiet"
        to={routes.studio}
        state={STUDIO_WELCOME_REQUEST_STATE}
      >
        {t("studio:firstRun.help.cta")}
      </Button>
    </section>
  );
}
