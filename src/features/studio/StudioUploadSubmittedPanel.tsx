import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { studioUploadPath } from "./studioPaths";
import s from "./creator.module.css";
import publishStyles from "./StudioUploadPublish.module.css";

/** After publishing: the release is live, here is its page. */
export function SubmittedPanel({ release }: { release: StudioReleaseView }) {
  const { t } = useTranslation();
  return (
    <div className={s.submitted} role="status">
      <div className={s.submittedIcon}>
        <FiCheck size={26} aria-hidden />
      </div>
      <h2>
        <Translation
          i18nKey="studio:uploadFlow.published.title"
          components={{ em: <em /> }}
          values={{ title: release.title }}
        />
      </h2>
      <p>{t("studio:uploadFlow.published.body")}</p>
      <div className={publishStyles.submittedActions}>
        <Button variant="ghost-dark" to={release.href}>
          {t("studio:uploadFlow.published.openCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
        <Button variant="ghost-dark" to={studioUploadPath()} reloadDocument>
          {t("studio:uploadFlow.published.anotherCta")}
        </Button>
      </div>
    </div>
  );
}
