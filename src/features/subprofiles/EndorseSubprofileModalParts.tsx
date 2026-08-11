import { useId } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { Avatar, Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import { initialsOf, tintForSlug } from "../members/api/members.adapters";
import { currentUser } from "../members/data/members";
import styles from "./EndorseSubprofileModal.module.css";

/**
 * Animated plum-panel success state: the persona's face and the current user's
 * face pairing up with a jade check, shown once an endorsement is confirmed.
 * Mirrors `VouchSuccess`.
 */
export function EndorseSuccess({
  personaName,
  personaAvatarUrl,
  onClose,
}: {
  personaName: string;
  personaAvatarUrl: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  // The viewer's own "+ you" face. The mock persona is DEMO-ONLY; live builds
  // the face from the real authenticated user, and a live-but-unauthenticated
  // viewer falls back to a neutral placeholder — never the demo "Tiago Costa"
  // persona (see the demo-persona-leak guard on live paths).
  const you = demoMode
    ? {
        initials: currentUser.initials,
        tint: currentUser.tint,
        photo: currentUser.photo,
      }
    : user
      ? {
          initials: initialsOf(user.profile.firstName, user.profile.lastName),
          tint: tintForSlug(user.profile.slug),
          photo: user.profile.avatarUrl ?? undefined,
        }
      : { initials: "?", tint: "default" as const, photo: undefined };
  return (
    <div className={styles.success}>
      <div className={styles.facePair}>
        <span className={styles.ring} aria-hidden />
        <span className={styles.faceA}>
          <Avatar
            initials={initialsFromName(personaName, "?")}
            tint="plum"
            size={74}
            src={personaAvatarUrl ?? undefined}
            alt={personaName}
          />
        </span>
        <span className={styles.faceB}>
          <Avatar
            initials={you.initials}
            tint={you.tint}
            size={74}
            src={you.photo}
            alt={t("subprofiles:hero.endorse.modal.you")}
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
          i18nKey="subprofiles:hero.endorse.modal.success.title"
          components={{ em: <em /> }}
          values={{ name: personaName }}
        />
      </h2>
      <p className={styles.successSub}>
        <Translation
          i18nKey="subprofiles:hero.endorse.modal.success.body"
          components={{ b: <b /> }}
          values={{ name: personaName }}
        />
      </p>
      <Button
        variant="ghost-dark"
        size="lg"
        className={styles.doneBtn}
        onClick={onClose}
      >
        {t("subprofiles:hero.endorse.modal.success.doneCta")}
      </Button>
    </div>
  );
}

/**
 * The endorse form: an optional note textarea (200-char cap) + counter and the
 * cancel / submit actions. In edit mode the primary action reads "Save note"
 * and a "Withdraw endorsement" secondary action appears. Owns no state — the
 * modal lifts form state so it survives the loading transition.
 */
export function EndorseForm({
  personaName,
  personaAvatarUrl,
  viewerEndorsed,
  note,
  setNote,
  noteLoading,
  isPending,
  onClose,
  onSubmit,
  onWithdraw,
}: {
  personaName: string;
  personaAvatarUrl: string | null;
  viewerEndorsed: boolean;
  note: string;
  setNote: (note: string) => void;
  noteLoading: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onWithdraw: () => void;
}) {
  const { t } = useTranslation();
  const noteFieldId = useId();
  const trimmedLength = note.trim().length;
  return (
    <div>
      <div className={styles.eye}>
        {t("subprofiles:hero.endorse.modal.eyebrow")}
      </div>
      <div className={styles.title}>
        <Translation
          i18nKey="subprofiles:hero.endorse.modal.title"
          components={{ em: <em /> }}
          values={{ name: personaName }}
        />
      </div>
      <p className={styles.sub}>
        {t("subprofiles:hero.endorse.modal.sub", { name: personaName })}
      </p>

      <div className={styles.candidate}>
        <Avatar
          initials={initialsFromName(personaName, "?")}
          tint="plum"
          size={48}
          src={personaAvatarUrl ?? undefined}
        />
        <div className={styles.candName}>{personaName}</div>
      </div>

      <label className={styles.label} htmlFor={noteFieldId}>
        {t("subprofiles:hero.endorse.modal.noteLabel")}{" "}
        <span className={styles.optional}>
          {t("subprofiles:hero.endorse.modal.optional")}
        </span>
      </label>
      <textarea
        id={noteFieldId}
        className={styles.textarea}
        maxLength={200}
        placeholder={t("subprofiles:hero.endorse.modal.notePlaceholder", {
          name: personaName,
        })}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        disabled={noteLoading}
      />
      <div className={styles.counter}>
        {trimmedLength > 0
          ? t("subprofiles:hero.endorse.modal.charsCount", {
              count: trimmedLength,
            })
          : t("subprofiles:hero.endorse.modal.noteOptional")}
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          {t("subprofiles:hero.endorse.modal.cancel")}
        </Button>
        <Button
          variant="primary"
          className={styles.full}
          onClick={onSubmit}
          disabled={isPending || noteLoading}
        >
          {isPending ? (
            <>
              <span className={styles.spinner} aria-hidden />
              {t("subprofiles:hero.endorse.modal.sending")}
            </>
          ) : viewerEndorsed ? (
            t("subprofiles:hero.endorse.modal.save")
          ) : (
            t("subprofiles:hero.endorse.cta")
          )}
        </Button>
      </div>

      {viewerEndorsed && (
        <button
          type="button"
          className={styles.withdraw}
          onClick={onWithdraw}
          disabled={isPending}
        >
          {t("subprofiles:hero.endorse.modal.withdraw")}
        </button>
      )}
    </div>
  );
}
