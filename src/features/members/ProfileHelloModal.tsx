import { useState } from "react";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type MemberProfile } from "./data/memberProfiles";
import { openToLabel, reasonValue } from "./openTo.data";
import { draftForReason } from "./profileHello.data";
import styles from "./ProfileHelloModal.module.css";

/**
 * Reason-first "say hello" composer for a connected member: pick what drew
 * you in (from the profile owner's own `openTo` entries, not a fixed
 * script), get a starter draft, then send. Falls back to a plain reasonless
 * textarea when the owner hasn't filled in "open to" at all.
 *
 * `onSend` is the caller's job to wire to the real messaging entry point
 * (see `ProfileHeroActions.tsx`) — this component only collects the draft.
 */
export function ProfileHelloModal({
  profile,
  onClose,
  onSend,
}: {
  profile: MemberProfile;
  onClose: () => void;
  onSend: (draft: string) => void;
}) {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const hasReasons = profile.openTo.length > 0;

  return (
    <Modal
      title={t("members:profile.hello.title", { first: profile.first })}
      onClose={onClose}
    >
      <p className={styles.intro}>{t("members:profile.hello.intro")}</p>

      {hasReasons && (
        <div
          className={styles.reasons}
          role="group"
          aria-label={t("members:profile.hello.reasonsLabel")}
        >
          {profile.openTo.map((entry) => {
            const value = reasonValue(entry);
            const label = openToLabel(entry, t);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selectedReason === value}
                className={styles.reasonBtn}
                onClick={() => {
                  setSelectedReason(value);
                  setDraft(draftForReason(label, profile.first, t));
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <FormField label={t("members:profile.hello.draftLabel")}>
        <textarea
          className={styles.draft}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t("members:profile.hello.draftPlaceholder")}
        />
      </FormField>

      {profile.notHereFor && (
        <p className={styles.note}>{profile.notHereFor}</p>
      )}

      <div className={styles.footer}>
        <Button variant="ghost" onClick={onClose}>
          {t("members:profile.hello.cancel")}
        </Button>
        <Button
          variant="primary"
          disabled={!draft.trim()}
          onClick={() => onSend(draft.trim())}
        >
          {t("members:profile.hello.send")}
        </Button>
      </div>
    </Modal>
  );
}
