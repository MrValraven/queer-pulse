import { Button, MemberIdentity } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityBanDTO } from "./api/communityBans.api";
import styles from "./ModToolsPanels.module.css";

/** A member ref's display name, or the caller's placeholder when the account
 *  behind it has been erased. */
function banMemberName(
  ref: CommunityBanDTO["member"],
  fallback: string,
): string {
  if (!ref) return fallback;
  return `${ref.firstName} ${ref.lastName}`.trim() || fallback;
}

/**
 * One row on the ban list: who is barred, who barred them, when, and the
 * reason the moderator recorded.
 *
 * When the barred account has since been erased there is no slug to lift a ban
 * against, so the row states that instead of offering a control that cannot
 * work.
 */
export function BanRow({
  ban,
  onLift,
  formatDate,
}: {
  ban: CommunityBanDTO;
  onLift: (memberSlug: string, name: string) => void;
  formatDate: (iso: string) => string;
}) {
  const { t } = useTranslation();
  const memberName = banMemberName(
    ban.member,
    t("communities:detail.modtools.bans.formerMember"),
  );
  const when = formatDate(ban.createdAt);

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <MemberIdentity
          person={{
            slug: ban.member?.slug,
            name: memberName,
            avatarUrl: ban.member?.avatarUrl ?? undefined,
          }}
          size={36}
        />
        <p className={styles.meta}>
          {ban.bannedBy
            ? t("communities:detail.modtools.bans.byOn", {
                name: banMemberName(
                  ban.bannedBy,
                  t("communities:detail.modtools.bans.formerMember"),
                ),
                date: when,
              })
            : t("communities:detail.modtools.bans.byGoneOn", { date: when })}
        </p>
        <p className={styles.reason}>
          {ban.reason
            ? t("communities:detail.modtools.bans.reason", {
                reason: ban.reason,
              })
            : t("communities:detail.modtools.bans.noReason")}
        </p>
      </div>
      <div className={styles.actions}>
        {ban.member ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLift(ban.member!.slug, memberName)}
          >
            {t("communities:detail.modtools.bans.liftCta")}
          </Button>
        ) : (
          <p className={styles.hint}>
            {t("communities:detail.modtools.bans.erasedNote")}
          </p>
        )}
      </div>
    </div>
  );
}
