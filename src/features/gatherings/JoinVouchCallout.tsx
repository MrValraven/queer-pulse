import { FiShield, FiUserPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import styles from "./JoinVouchCallout.module.css";

/**
 * Small reusable callout for non-members who land on a gathering/event page.
 * Explains the invite/vouch flow and links to request an invite + safety info.
 * Plum-panel emphasis treatment so it reads as important, not a flimsy card.
 */
export function JoinVouchCallout() {
  const { t } = useTranslation();

  return (
    <div className={styles.callout}>
      <span className={styles.icon} aria-hidden>
        <FiUserPlus />
      </span>
      <div className={styles.body}>
        <div className={styles.title}>
          <Translation
            i18nKey="gatherings:vouchCallout.title"
            components={{ em: <em /> }}
          />
        </div>
        <p className={styles.text}>{t("gatherings:vouchCallout.body")}</p>
        <div className={styles.actions}>
          <Button
            variant="ghost-dark"
            to={requestInvitePath("gathering_vouch")}
          >
            {t("gatherings:vouchCallout.requestInviteCta")}
          </Button>
          <Button variant="ghost-dark" to={routes.safety}>
            <FiShield aria-hidden style={{ marginRight: 6 }} />
            {t("gatherings:vouchCallout.safetyCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
