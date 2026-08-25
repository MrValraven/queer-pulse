import { FiCheck, FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import s from "./creator.module.css";

export function SubmittedPanel() {
  const { t } = useTranslation();
  return (
    <div className={s.submitted}>
      <div className={s.submittedIcon}>
        <FiCheck size={26} aria-hidden />
      </div>
      <h2>
        <Translation
          i18nKey="studio:upload.submitted.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p>{t("studio:upload.submitted.body")}</p>
      <Button variant="ghost-dark" to={routes.studioPayouts}>
        {t("studio:upload.submitted.viewPayoutsCta")}{" "}
        <FiArrowRight aria-hidden />
      </Button>
    </div>
  );
}
