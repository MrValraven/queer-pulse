import { useId } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { Avatar, Button, Toggle } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { initialsOf, tintForSlug } from "./api/members.adapters";
import { currentUser, type MemberProfile } from "./data/memberProfiles";
import {
  RELATIONSHIPS,
  RELATIONSHIP_LABEL_KEY,
  type VouchRelationship,
} from "./vouchMember.data";
import styles from "./VouchMemberModal.module.css";

/**
 * Animated plum-panel success state: the candidate's face and the current
 * user's face pairing up with a jade check, shown once a vouch is confirmed.
 */
export function VouchSuccess({
  profile,
  first,
  onClose,
}: {
  profile: MemberProfile;
  first: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  // The viewer's own "+ you" face. Demo uses the mock persona; live builds it
  // from the real authenticated user so production never renders the demo
  // "Tiago Costa" persona (see the demo-persona-leak guard on live paths).
  const you =
    demoMode || !user
      ? {
          initials: currentUser.initials,
          tint: currentUser.tint,
          photo: currentUser.photo,
        }
      : {
          initials: initialsOf(user.profile.firstName, user.profile.lastName),
          tint: tintForSlug(user.profile.slug),
          photo: user.profile.avatarUrl ?? undefined,
        };
  return (
    <div className={styles.success}>
      <div className={styles.facePair}>
        <span className={styles.ring} aria-hidden />
        <span className={styles.faceA}>
          <Avatar
            initials={profile.initials}
            tint={profile.tint === "auth" ? "plum" : profile.tint}
            size={74}
            src={profile.photo}
            alt={`${first} ${profile.last}`}
          />
        </span>
        <span className={styles.faceB}>
          <Avatar
            initials={you.initials}
            tint={you.tint}
            size={74}
            src={you.photo}
            alt={t("members:card.you")}
          />
          <span className={styles.faceCheck} aria-hidden>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
              <path
                className={styles.checkPath}
                d="M5 12.5l4 4L19 7"
                stroke="var(--plum)"
                strokeWidth={3.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </div>
      <h2 className={styles.successTitle}>
        <Translation
          i18nKey="members:vouch.modal.success.title"
          components={{ em: <em /> }}
          values={{ first }}
        />
      </h2>
      <p className={styles.successSub}>
        <Translation
          i18nKey="members:vouch.modal.success.body"
          components={{ b: <b /> }}
          values={{ first }}
        />
      </p>
      <Button
        variant="ghost-dark"
        size="lg"
        className={styles.doneBtn}
        onClick={onClose}
      >
        {t("members:vouch.modal.success.doneCta")}
      </Button>
    </div>
  );
}

/**
 * The vouch form: the "how you know them" relationship checkboxes (at least one
 * required), the anonymity toggle, the note textarea + counter, and the cancel /
 * submit actions. Owns no state — the modal lifts form state so it survives the
 * loading transition. Every field here reaches the backend; see
 * `VouchMemberModal`'s note on why there is no skill-endorsement chip row.
 */
export function VouchForm({
  profile,
  first,
  relationships,
  toggleRelationship,
  note,
  setNote,
  anonymous,
  setAnonymous,
  isPending,
  isError,
  onClose,
  onSubmit,
}: {
  profile: MemberProfile;
  first: string;
  relationships: VouchRelationship[];
  toggleRelationship: (r: VouchRelationship) => void;
  note: string;
  setNote: (n: string) => void;
  anonymous: boolean;
  setAnonymous: (anonymous: boolean) => void;
  isPending: boolean;
  isError: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const noteFieldId = useId();
  const hasRelationship = relationships.length > 0;
  return (
    <div>
      <div className={styles.eye}>{t("members:vouch.modal.form.eyebrow")}</div>
      <div className={styles.title}>
        <Translation
          i18nKey="members:vouch.modal.form.title"
          components={{ em: <em /> }}
          values={{ first }}
        />
      </div>
      <p className={styles.sub}>
        {t("members:vouch.modal.form.sub", { first })}
      </p>

      <div className={styles.candidate}>
        <Avatar
          initials={profile.initials}
          tint={profile.tint === "auth" ? "plum" : profile.tint}
          size={48}
          src={profile.photo}
        />
        <div>
          <div className={styles.candName}>
            <span className={styles.nameRow}>
              {first} {profile.last}
              <MemberStaffBadge slug={profile.slug} />
            </span>
          </div>
          <div className={styles.candRole}>{profile.role}</div>
        </div>
      </div>

      <div className={styles.label}>
        {t("members:vouch.modal.form.relationshipLabel", { first })}{" "}
        <span className={styles.optional}>
          {t("members:vouch.modal.form.relationshipHint")}
        </span>
      </div>
      <div className={styles.opts}>
        {RELATIONSHIPS.map((r) => {
          const checked = relationships.includes(r);
          return (
            <label
              key={r}
              className={[styles.opt, checked && styles.optChecked]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="checkbox"
                name="vouch-relationship"
                value={r}
                checked={checked}
                onChange={() => toggleRelationship(r)}
              />
              {t(RELATIONSHIP_LABEL_KEY[r])}
            </label>
          );
        })}
      </div>

      <div className={styles.anonRow}>
        <span className={styles.anonLabel}>
          {t("members:vouch.modal.form.anonymousLabel")}
        </span>
        <Toggle
          checked={anonymous}
          onChange={setAnonymous}
          label={t("members:vouch.modal.form.anonymousLabel")}
        />
      </div>

      <label className={styles.label} htmlFor={noteFieldId}>
        {t("members:vouch.modal.form.noteLabel")}
      </label>
      <textarea
        id={noteFieldId}
        className={styles.textarea}
        placeholder={t("members:vouch.modal.form.notePlaceholder", { first })}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className={styles.counter}>
        {note.trim().length > 0
          ? t("members:vouch.modal.form.charsCount", {
              count: note.trim().length,
            })
          : t("members:vouch.modal.form.noteOptional")}
      </div>

      {isError && <p className={styles.error}>{t("members:vouch.modal.error")}</p>}

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          {t("members:vouch.modal.form.cancel")}
        </Button>
        <Button
          variant="primary"
          className={styles.full}
          onClick={onSubmit}
          disabled={isPending || !hasRelationship}
        >
          {isPending ? (
            <>
              <span className={styles.spinner} aria-hidden />
              {t("members:vouch.modal.form.sending")}
            </>
          ) : (
            t("members:profile.hero.vouchForCta", { first })
          )}
        </Button>
      </div>
    </div>
  );
}
