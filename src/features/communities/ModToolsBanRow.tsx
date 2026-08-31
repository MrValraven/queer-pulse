import { Badge, Button, MemberIdentity } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityBanDTO } from "./api/communityBans.api";
import { CommunityRuleCitation } from "./CommunityRuleCitation";
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
 * One row on the ban list: who is barred, who barred them, when, for how long,
 * under which house rule, and the reason the moderator recorded.
 *
 * The term of the bar leads the row. A permanent bar and a bar that ends on
 * Friday are different decisions, and until they were told apart the panel
 * showed them identically. An expired bar stays listed, marked as served: the
 * member can already come back, and deleting the record of a sanction that ran
 * its course would erase exactly what a reviewable ladder needs to keep.
 *
 * When the barred account has since been erased there is no slug to act
 * against, so the row states that instead of offering controls that cannot
 * work.
 */
export function BanRow({
  ban,
  onLift,
  onEdit,
  onOpenRatifications,
  formatDate,
}: {
  ban: CommunityBanDTO;
  onLift: (memberSlug: string, name: string) => void;
  onEdit: (ban: CommunityBanDTO, name: string) => void;
  /** Opens the second-signature queue (PRD-25). */
  onOpenRatifications: () => void;
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
        <div>
          {ban.isExpired ? (
            <Badge tone="ghost">
              {t("communities:detail.modtools.ban.term.served", {
                date: formatDate(ban.expiresAt!),
              })}
            </Badge>
          ) : ban.expiresAt ? (
            <Badge tone="amber">
              {t("communities:detail.modtools.ban.term.until", {
                date: formatDate(ban.expiresAt),
              })}
            </Badge>
          ) : (
            <Badge tone="danger">
              {t("communities:detail.modtools.ban.term.permanent")}
            </Badge>
          )}
          {/* A 30-day bar with a permanent proposal open on it is a different
              thing from a settled 30-day bar, and the term badge alone cannot
              tell them apart (PRD-25). */}
          {ban.isPendingRatification && (
            <Badge tone="amber" dot>
              {t("communities:detail.modtools.ban.term.pendingRatification")}
            </Badge>
          )}
        </div>
        {ban.isPendingRatification && (
          <p className={styles.hint}>
            {t("communities:detail.modtools.bans.pendingRatificationNote")}
          </p>
        )}
        <p className={styles.reason}>
          {ban.reason
            ? t("communities:detail.modtools.bans.reason", {
                reason: ban.reason,
              })
            : t("communities:detail.modtools.bans.noReason")}
        </p>
        {ban.rule && <CommunityRuleCitation rule={ban.rule} />}
      </div>
      <div className={styles.actions}>
        {ban.isPendingRatification && (
          <Button variant="ghost" size="sm" onClick={onOpenRatifications}>
            {t("communities:detail.modtools.bans.openRatificationCta")}
          </Button>
        )}
        {ban.member ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(ban, memberName)}
            >
              {t("communities:detail.modtools.ban.editCta")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLift(ban.member!.slug, memberName)}
            >
              {t("communities:detail.modtools.bans.liftCta")}
            </Button>
          </>
        ) : (
          <p className={styles.hint}>
            {t("communities:detail.modtools.bans.erasedNote")}
          </p>
        )}
      </div>
    </div>
  );
}
