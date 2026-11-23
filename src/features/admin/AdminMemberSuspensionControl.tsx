import { useRef, useState, type RefObject } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
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
import noteStyles from "./AdminMemberSuspensionControl.module.css";

const firstName = (full: string) => full.split(" ")[0];

/**
 * The reason code a lift cites. A lift reverses an earlier decision and
 * accuses nobody, so the catch-all is the entry that fits, and the moderator's
 * own words carry the meaning.
 */
const LIFT_REASON_CODE = "other";

/** Focuses the note on the next frame, once React has committed
 *  `aria-invalid` and the error line, so a screen reader lands on the field
 *  already marked invalid and described by that line. */
function focusAfterCommit(fieldRef: RefObject<HTMLTextAreaElement | null>) {
  requestAnimationFrame(() => fieldRef.current?.focus());
}

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
 * `AdminModal` and asks for the note the route requires (the audit trail
 * records it with the reason code); the mutation is demo/live dual-mode and invalidates the member
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
  const [note, setNote] = useState("");
  const [isNoteMissing, setIsNoteMissing] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [lifted, setLifted] = useState(false);

  if (!detail.suspended || lifted) return null;

  // Closing drops the missing-note line, so a reopened modal starts clean.
  const closeConfirm = () => {
    setConfirming(false);
    setIsNoteMissing(false);
  };

  const apply = () => {
    const auditNote = note.trim();
    if (!auditNote) {
      setIsNoteMissing(true);
      focusAfterCommit(noteRef);
      return;
    }
    lift.mutate(
      {
        memberId: member.id,
        input: { reasonCode: LIFT_REASON_CODE, note: auditNote },
      },
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
          onClose={closeConfirm}
          footer={
            <>
              <Button variant="ghost" onClick={closeConfirm}>
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
          <LiftNoteField
            id="lift-suspension-note"
            label={t("admin:members.suspension.confirm.noteLabel")}
            placeholder={t("admin:members.suspension.confirm.notePlaceholder")}
            missingText={t("admin:members.suspension.missingNoteToast")}
            maxLength={2000}
            value={note}
            isMissing={isNoteMissing}
            fieldRef={noteRef}
            onChange={(value) => {
              setNote(value);
              if (value.trim()) setIsNoteMissing(false);
            }}
          />
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
  const [isNoteMissing, setIsNoteMissing] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [lifted, setLifted] = useState(false);

  if (!restriction?.restricted || lifted) return null;

  const first = firstName(member.name);
  const until = restriction.restrictedUntil
    ? fmt.date(new Date(restriction.restrictedUntil))
    : null;

  // Closing drops the missing-note line, so a reopened modal starts clean.
  const closeConfirm = () => {
    setConfirming(false);
    setIsNoteMissing(false);
  };

  const apply = () => {
    const memberFacingNote = note.trim();
    if (!memberFacingNote) {
      setIsNoteMissing(true);
      focusAfterCommit(noteRef);
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
          onClose={closeConfirm}
          footer={
            <>
              <Button variant="ghost" onClick={closeConfirm}>
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
          <LiftNoteField
            id="lift-restriction-note"
            label={t("admin:members.restriction.confirm.noteLabel", {
              name: first,
            })}
            placeholder={t("admin:members.restriction.confirm.notePlaceholder")}
            missingText={t("admin:members.restriction.missingNoteToast")}
            value={note}
            isMissing={isNoteMissing}
            fieldRef={noteRef}
            onChange={(value) => {
              setNote(value);
              if (value.trim()) setIsNoteMissing(false);
            }}
          />
        </AdminModal>
      )}
    </section>
  );
}

/**
 * The required note in a lift's confirm modal: its label, the textarea, and
 * the line that names what is missing when the moderator confirms with the
 * note empty. The caller focuses the field at that moment, and the line folds
 * away as soon as the note has text.
 */
function LiftNoteField({
  id,
  label,
  placeholder,
  missingText,
  maxLength,
  value,
  isMissing,
  fieldRef,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  missingText: string;
  maxLength?: number;
  value: string;
  isMissing: boolean;
  fieldRef: RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className={noteStyles.noteGroup}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>
      <textarea
        ref={fieldRef}
        id={id}
        className={styles.textarea}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        required
        aria-invalid={isMissing || undefined}
        aria-describedby={isMissing ? errorId : undefined}
      />
      <Collapse isOpen={isMissing}>
        <p id={errorId} role="alert" className={noteStyles.noteError}>
          <FiAlertCircle aria-hidden className={noteStyles.noteErrorIcon} />
          {missingText}
        </p>
      </Collapse>
    </div>
  );
}
