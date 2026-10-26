import { FiPauseCircle } from "react-icons/fi";
import { Button, Card } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./InvitePage.module.css";

/**
 * Shown on the invite page in place of the quota row and the compose form
 * when our team has paused this member's invites. The rest of the account
 * keeps working, so the copy says so and offers a way to reach our team
 * through the contact form with the account topic preselected.
 */
export function InvitesPausedPanel() {
  const { t } = useTranslation();
  return (
    <Card className={styles.pausedPanel} padding="lg" role="status">
      <span className={styles.pausedIcon} aria-hidden>
        <FiPauseCircle />
      </span>
      <div>
        <h2 className={styles.pausedHeading}>
          {t("auth:invite.paused.heading")}
        </h2>
        <p className={styles.pausedBody}>{t("auth:invite.paused.body")}</p>
        <Button
          variant="ghost"
          size="md"
          to={`${routes.contact}?topic=account`}
        >
          {t("auth:invite.paused.cta")}
        </Button>
      </div>
    </Card>
  );
}
