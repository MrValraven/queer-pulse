import { FiBookOpen, FiMessageCircle } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import css from "./StudioSafety.module.css";

/**
 * The way on from a rights decision that has no next step in Studio (an
 * upheld claim, the dispute limit, a closed claim): what the member's
 * rights are, and Contact our team. `lead` names the situation in one line
 * above the links.
 */
export function StudioSafetyHelpLinks({ leadKey }: { leadKey?: string }) {
  const { t } = useTranslation();
  return (
    <div className={css.helpLinks}>
      {leadKey ? <p className={css.helpLead}>{t(leadKey)}</p> : null}
      <div className={css.helpActions}>
        <Button variant="quiet" size="sm" to={routes.studioRights}>
          <FiBookOpen aria-hidden /> {t("studio:safety.help.readRights")}
        </Button>
        <Button variant="quiet" size="sm" to={routes.contact}>
          <FiMessageCircle aria-hidden /> {t("studio:safety.help.contactTeam")}
        </Button>
      </div>
    </div>
  );
}
