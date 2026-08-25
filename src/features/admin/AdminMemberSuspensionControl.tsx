import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal } from "./ui";
import { useLiftSuspension } from "./api/useAdminMembers";
import type { AdminMember, MemberDetail } from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

const firstName = (full: string) => full.split(" ")[0];

/**
 * The drawer's suspension control: reinstate a suspended member. Rendered only
 * while `detail.suspended` is true (and hidden again once lifted). The confirm
 * modal reuses the shared `AdminModal`; the mutation is demo/live dual-mode and
 * invalidates the member query in live mode (see `useLiftSuspension`).
 */
export function AdminMemberSuspensionControl({
  member,
  detail,
}: {
  member: AdminMember;
  detail: MemberDetail;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const lift = useLiftSuspension();
  const [confirming, setConfirming] = useState(false);
  const [lifted, setLifted] = useState(false);

  if (!detail.suspended || lifted) return null;

  const apply = () => {
    lift.mutate(
      { memberId: member.id },
      {
        onSuccess: () => {
          setConfirming(false);
          setLifted(true);
          showToast(
            t("admin:members.suspension.liftedToast", {
              name: firstName(member.name),
            }),
            "success",
          );
        },
      },
    );
  };

  return (
    <section className={styles.dSection}>
      <h3 className={styles.dHeading}>
        {t("admin:members.suspension.sectionTitle")}
      </h3>
      <p className={styles.dHint}>
        {t("admin:members.suspension.description")}
      </p>
      <div className={styles.roleActions}>
        <Button
          variant="jade"
          size="md"
          disabled={lift.isPending}
          onClick={() => setConfirming(true)}
        >
          {t("admin:members.suspension.liftCta")}
        </Button>
      </div>

      {confirming && (
        <AdminModal
          title={t("admin:members.suspension.confirm.title", {
            name: member.name,
          })}
          onClose={() => setConfirming(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                {t("admin:common.cancel")}
              </Button>
              <Button variant="jade" disabled={lift.isPending} onClick={apply}>
                {t("admin:members.suspension.confirm.confirmCta")}
              </Button>
            </>
          }
        >
          <p className={styles.roleConfirmBody}>
            {t("admin:members.suspension.confirm.body", { name: member.name })}
          </p>
        </AdminModal>
      )}
    </section>
  );
}
