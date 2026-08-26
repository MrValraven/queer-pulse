import { FiKey } from "react-icons/fi";
import { Button, Card } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useInviteQuota, daysUntilReset } from "../auth/api/useInviteQuota";
import styles from "./ProfileInviteCard.module.css";

/**
 * ACQ-08 — the quiet companion to the account-menu "Invite someone" row: a
 * compact strip at the foot of the member's OWN profile saying how many
 * invites are still theirs this month and when the allowance turns over.
 *
 * Deliberately a row, not a full card: the profile is already dense (hero,
 * personas, work, communities, places, writing), so this sits after all of it
 * and pushes nothing down. It is rendered only for a real self view — a
 * visitor, and an owner previewing as a visitor, never see it, because someone
 * else's remaining invites are none of their business.
 *
 * Silent by default. Nothing renders while the quota is loading, if the fetch
 * failed, or once the allowance is spent — the same rule the account-menu
 * badge follows, so a member with nothing to give is never nagged about it.
 */
export function ProfileInviteCard() {
  const { t } = useTranslation();
  const { data: quota, isLoading, isError } = useInviteQuota();

  if (isLoading || isError || !quota) return null;
  if (quota.remaining <= 0) return null;

  // Derived at render, never cached, so a page left open across midnight shows
  // the right countdown (see `daysUntilReset`).
  const resetsInDays = daysUntilReset(quota.resetsAt);

  return (
    <div className="wrap">
      <Card
        as="aside"
        padding="sm"
        className={styles.card}
        aria-label={t("shared:inviteCard.ariaLabel")}
      >
        <span className={styles.icon} aria-hidden>
          <FiKey />
        </span>
        <span className={styles.body}>
          <span className={styles.title}>
            {t("shared:inviteCard.title", { count: quota.remaining })}
          </span>
          <span className={styles.meta}>
            {t("shared:inviteCard.body")}{" "}
            {resetsInDays === 0
              ? t("shared:inviteCard.resets_zero")
              : t("shared:inviteCard.resets", { count: resetsInDays })}
          </span>
        </span>
        <Button to={routes.invite} variant="ghost" size="sm">
          {t("shared:inviteCard.cta")}
        </Button>
      </Card>
    </div>
  );
}
