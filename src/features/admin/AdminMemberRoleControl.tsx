import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { AdminModal, AdminChip } from "./ui";
import { useUpdateMemberRole } from "./api/useAdminMembers";
import type { AdminMember, MemberDetail } from "./adminMembers.data";
import type { MemberRole } from "./api/adminMembers.api";
import styles from "./AdminMembersPage.module.css";

/** The roles an admin can set, weakest → strongest. Drives both the button
 *  order and the "is this a demotion?" comparison below. */
const ROLE_ORDER: MemberRole[] = ["member", "moderator", "admin"];
const ROLE_RANK: Record<MemberRole, number> = {
  member: 0,
  moderator: 1,
  admin: 2,
};

const firstName = (full: string) => full.split(" ")[0];

/**
 * The drawer's role-management section: grant or revoke `moderator` / `admin`
 * on one member. The backend owns every guardrail (no self-change, no house
 * account, never the last admin) and answers 403/409 with a specific reason —
 * surfaced by the global mutation-error toast — so this component only mirrors
 * the two guardrails it can know locally (self, house account) as a disabled,
 * explained state, and confirms the one destructive move (removing admin).
 */
export function AdminMemberRoleControl({
  member,
  detail,
}: {
  member: AdminMember;
  detail: MemberDetail;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const updateRole = useUpdateMemberRole();
  const [confirm, setConfirm] = useState<{
    role: MemberRole;
    kind: "grant" | "demote";
  } | null>(null);

  const currentRole = detail.role;
  const isSelf = user?.id === member.id;
  const lockedReason = detail.isSystem
    ? t("admin:members.role.systemNote")
    : isSelf
      ? t("admin:members.role.selfNote")
      : null;

  const apply = (targetRole: MemberRole) => {
    setConfirm(null);
    updateRole.mutate(
      {
        memberId: member.id,
        slug: member.slug,
        role: targetRole,
        isSystem: detail.isSystem,
      },
      {
        onSuccess: () =>
          showToast(
            t("admin:members.role.updatedToast", {
              name: firstName(member.name),
              role: t(`admin:members.role.value.${targetRole}`),
            }),
            "success",
          ),
      },
    );
  };

  const onPick = (targetRole: MemberRole) => {
    if (targetRole === currentRole) return;
    // Granting admin is the single most dangerous move here — full platform
    // access, including staff/role management and moderation actions — so it
    // gets at least as much confirmation friction as removing admin does.
    const isAdminGrant =
      targetRole === "admin" && ROLE_RANK[currentRole] < ROLE_RANK.admin;
    if (isAdminGrant) {
      setConfirm({ role: targetRole, kind: "grant" });
      return;
    }
    // Removing admin also strips real power — confirm it.
    const isAdminDemotion =
      currentRole === "admin" && ROLE_RANK[targetRole] < ROLE_RANK.admin;
    if (isAdminDemotion) {
      setConfirm({ role: targetRole, kind: "demote" });
      return;
    }
    apply(targetRole);
  };

  return (
    <div>
      <span className={styles.subGroupLabel}>
        {t("admin:staffRoles.accountLevelLabel")}
      </span>
      <div className={styles.roleCurrentRow}>
        <span className={styles.roleCurrentLabel}>
          {t("admin:members.role.currentLabel")}
        </span>
        <AdminChip tone={currentRole === "admin" ? "violet" : currentRole === "moderator" ? "plum" : "ghost"}>
          {t(`admin:members.role.value.${currentRole}`)}
        </AdminChip>
      </div>

      {lockedReason ? (
        <p className={styles.dHint}>{lockedReason}</p>
      ) : (
        <>
          <p className={styles.dHint}>{t("admin:members.role.description")}</p>
          <div className={styles.roleActions}>
            {ROLE_ORDER.map((role) => (
              <Button
                key={role}
                variant={role === currentRole ? "primary" : "ghost"}
                size="md"
                disabled={role === currentRole || updateRole.isPending}
                onClick={() => onPick(role)}
              >
                {role === currentRole
                  ? t(`admin:members.role.value.${role}`)
                  : t(`admin:members.role.setAs.${role}`)}
              </Button>
            ))}
          </div>
        </>
      )}

      {confirm && (
        <AdminModal
          title={t(`admin:members.role.${confirm.kind}Confirm.title`, {
            name: member.name,
          })}
          onClose={() => setConfirm(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirm(null)}>
                {t("admin:common.cancel")}
              </Button>
              <Button variant="danger" onClick={() => apply(confirm.role)}>
                {t(`admin:members.role.${confirm.kind}Confirm.confirmCta`)}
              </Button>
            </>
          }
        >
          <p className={styles.roleConfirmBody}>
            {t(`admin:members.role.${confirm.kind}Confirm.body`, {
              name: member.name,
            })}
          </p>
        </AdminModal>
      )}
    </div>
  );
}
