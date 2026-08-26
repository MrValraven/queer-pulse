import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminModal } from "./ui";
import {
  useLiftRestriction,
  useLiftSuspension,
  useMemberRestriction,
} from "./api/useAdminMembers";
import type { AdminMember, MemberDetail } from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

const firstName = (full: string) => full.split(" ")[0];

/**
 * The reason code a lift cites. A lift undoes a decision rather than making a
 * fresh accusation, so there is no taxonomy entry that fits better than the
 * catch-all, and the moderator's own words carry the meaning.
 */
const LIFT_REASON_CODE = "other";

/**
 * The drawer's "put this member back" controls: reinstate a suspended member,
 * and lift a scoped restriction.
 *
 * The two are different sanctions and are shown independently. A suspension
 * locks the account out entirely; a restriction leaves it active and only
 * closes the write paths `NotRestrictedGuard` covers. A member can be under
 * either, both, or neither, so each section renders only while its own sanction
 * is in force.
 */
export function AdminMemberSuspensionControl({
  member,
  detail,
}: {
  member: AdminMember;
  detail: MemberDetail;
}) {
  return (
    <>
      <SuspensionSection member={member} detail={detail} />
      <RestrictionSection member={member} />
    </>
  );
}

/**
 * Reinstate a suspended member. Rendered only while `detail.suspended` is true
 * (and hidden again once lifted). The confirm modal reuses the shared
 * `AdminModal`; the mutation is demo/live dual-mode and invalidates the member
 * query in live mode (see `useLiftSuspension`).
 */
function SuspensionSection({
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

/**
 * Lift a member's scoped restriction (TS-09).
 *
 * `restrict` is the proportionate sanction a moderator reaches for instead of a
 * suspension, and until now it had no way back: the only routes out were
 * winning an appeal or waiting for the timer. This is the counterpart
 * "Lift suspension" always had.
 *
 * The note is required and is the exact text the member reads in their outcome
 * notification, matching every other moderation action in the product. The
 * section is absent entirely when no restriction is in force, so the drawer
 * never offers to undo something that is not there.
 */
function RestrictionSection({ member }: { member: AdminMember }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { data: restriction } = useMemberRestriction(member.id);
  const lift = useLiftRestriction();
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState("");
  const [lifted, setLifted] = useState(false);

  if (!restriction?.restricted || lifted) return null;

  const first = firstName(member.name);
  const until = restriction.restrictedUntil
    ? fmt.date(new Date(restriction.restrictedUntil))
    : null;

  const apply = () => {
    const memberFacingNote = note.trim();
    if (!memberFacingNote) {
      showToast(t("admin:members.restriction.missingNoteToast"), "error");
      return;
    }
    lift.mutate(
      {
        memberId: member.id,
        input: { reasonCode: LIFT_REASON_CODE, note: memberFacingNote },
      },
      {
        onSuccess: () => {
          setConfirming(false);
          setLifted(true);
          showToast(
            t("admin:members.restriction.liftedToast", { name: first }),
            "success",
          );
        },
      },
    );
  };

  return (
    <section className={styles.dSection}>
      <h3 className={styles.dHeading}>
        {t("admin:members.restriction.sectionTitle")}
      </h3>
      <p className={styles.dHint}>
        {until
          ? t("admin:members.restriction.descriptionUntil", { date: until })
          : t("admin:members.restriction.description")}
      </p>
      <div className={styles.roleActions}>
        <Button
          variant="jade"
          size="md"
          disabled={lift.isPending}
          onClick={() => setConfirming(true)}
        >
          {t("admin:members.restriction.liftCta")}
        </Button>
      </div>

      {confirming && (
        <AdminModal
          title={t("admin:members.restriction.confirm.title", {
            name: member.name,
          })}
          onClose={() => setConfirming(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                {t("admin:common.cancel")}
              </Button>
              <Button variant="jade" disabled={lift.isPending} onClick={apply}>
                {t("admin:members.restriction.confirm.confirmCta")}
              </Button>
            </>
          }
        >
          <p className={styles.roleConfirmBody}>
            {t("admin:members.restriction.confirm.body", { name: first })}
          </p>
          <label className={styles.fieldLabel} htmlFor="lift-restriction-note">
            {t("admin:members.restriction.confirm.noteLabel", { name: first })}
          </label>
          <textarea
            id="lift-restriction-note"
            className={styles.textarea}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("admin:members.restriction.confirm.notePlaceholder")}
            rows={3}
          />
        </AdminModal>
      )}
    </section>
  );
}
