import { useId, useState } from "react";
import { ConfirmDialog, Toggle } from "../../shared/components/ui";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminMember, MemberDetail } from "./adminMembers.data";
import { AdminAccessRow } from "./AdminAccessRow";
import styles from "./AdminMemberAccessPanel.module.css";
import { useSetMemberInviteAccess } from "./api/useAdminMemberInviteAccess";

/** The pause confirm's body: how many pending invites stay valid, when the
 *  backend sent the count. */
function pauseBodyFor(
  name: string,
  pendingInviteCount: number | null,
  t: TFunction,
): string {
  if (pendingInviteCount === null)
    return t("admin:inviteAccess.pauseBodyCountUnknown", { name });
  if (pendingInviteCount === 0)
    return t("admin:inviteAccess.pauseBodyNoPending", { name });
  return t("admin:inviteAccess.pauseBody", {
    name,
    count: pendingInviteCount,
  });
}

/**
 * The member drawer's Invites row, under the Studio row in the access panel:
 * whether the member can invite new people, with a switch. Pausing asks
 * first, since it changes what the member can do; turning invites back on
 * happens in one tap. The switch stays mounted through both, so focus never
 * has to move.
 */
export function AdminMemberInviteAccessLine({
  member,
  detail,
}: {
  member: AdminMember;
  detail: MemberDetail;
}) {
  const { t } = useTranslation();
  const setInviteAccess = useSetMemberInviteAccess();
  const [isConfirmingPause, setIsConfirmingPause] = useState(false);
  const hasInviteAccess = detail.hasInviteAccess;
  const footnoteId = useId();

  const mutateInviteAccess = (
    nextHasInviteAccess: boolean,
    onSuccess?: () => void,
  ) =>
    setInviteAccess.mutate(
      {
        memberId: member.id,
        slug: member.slug,
        hasInviteAccess: nextHasInviteAccess,
      },
      { onSuccess },
    );

  const handleToggleChange = (isTurningOn: boolean) => {
    if (setInviteAccess.isPending) return;
    if (isTurningOn) mutateInviteAccess(true);
    else setIsConfirmingPause(true);
  };

  return (
    <AdminAccessRow
      title={t("admin:inviteAccess.label")}
      status={
        hasInviteAccess
          ? t("admin:inviteAccess.on")
          : t("admin:inviteAccess.off")
      }
      tone={hasInviteAccess ? "on" : "off"}
      footnote={t("admin:inviteAccess.hint")}
      footnoteId={footnoteId}
      action={
        <span className={styles.switchAction}>
          <Toggle
            checked={hasInviteAccess}
            onChange={handleToggleChange}
            label={t("admin:inviteAccess.toggleLabel", { name: member.name })}
            aria-describedby={footnoteId}
          />
        </span>
      }
    >
      <ConfirmDialog
        open={isConfirmingPause}
        onClose={() => setIsConfirmingPause(false)}
        onConfirm={() =>
          mutateInviteAccess(false, () => setIsConfirmingPause(false))
        }
        loading={setInviteAccess.isPending}
        tone="destructive"
        title={t("admin:inviteAccess.pauseTitle", { name: member.name })}
        description={pauseBodyFor(member.name, detail.pendingInviteCount, t)}
        confirmLabel={t("admin:inviteAccess.pauseConfirm")}
      />
    </AdminAccessRow>
  );
}
