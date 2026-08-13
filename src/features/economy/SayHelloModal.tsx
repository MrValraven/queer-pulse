import { useId, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, SuccessPanel } from "./ModalKit";
import { useMyFlatmateProfile } from "./api/useMyFlatmateProfile";
import { useSayHello } from "./api/useSayHello";
import { useAffirmingPledgeGate } from "./useAffirmingPledgeGate";
import { DEMO_MY_PRONOUNS, type Profile } from "./flatmates.data";
import styles from "./FlatmatesPage.module.css";

/**
 * The say-hello flow. A member can add a short message and — the affirming bit —
 * optionally pre-share their own pronouns with this one person. Pronouns are
 * Art.9 special-category, so the share is strictly opt-in per connection AND
 * only offered when the sender has already consent-stored pronouns on their
 * profile; otherwise we gently point them there rather than collect anything new.
 */
export function SayHelloModal({
  profile,
  onSent,
  onClose,
}: {
  profile: Profile;
  onSent: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { data: myProfile } = useMyFlatmateProfile();
  const { mutate, isPending } = useSayHello();
  const { handlePledgeError, pledgeGate } = useAffirmingPledgeGate();
  const fieldId = useId();

  const [message, setMessage] = useState("");
  const [sharePronouns, setSharePronouns] = useState(false);
  const [sentPronouns, setSentPronouns] = useState<boolean | null>(null);

  // The sender's own pronouns, only when consent-stored. Demo has no live
  // profile, so it stands in a value to keep the feature demonstrable.
  const myPronouns = demoMode
    ? DEMO_MY_PRONOUNS
    : myProfile?.specialCategoryConsent
      ? myProfile.pronouns
      : "";
  const canSharePronouns = Boolean(myPronouns.trim());

  const handleSend = () => {
    if (isPending) return;
    mutate(
      {
        slug: profile.profileSlug,
        body: message.trim() || undefined,
        sharePronouns: canSharePronouns && sharePronouns,
      },
      {
        onSuccess: (result) => {
          setSentPronouns(result.pronounsShared);
          onSent();
        },
        onError: (error) => {
          if (handlePledgeError(error, handleSend)) return;
          showToast(t("economy:flatmates.card.sayHelloError"), "error");
        },
      },
    );
  };

  if (pledgeGate) return pledgeGate;

  if (sentPronouns !== null) {
    return (
      <ModalShell success onClose={onClose} ariaLabel={t("economy:sayHello.ariaLabel", { name: profile.name })}>
        <SuccessPanel
          title={t("economy:sayHello.success.title")}
          em={t("economy:sayHello.success.em")}
          onClose={onClose}
          closeLabel={t("economy:sayHello.success.close")}
        >
          {sentPronouns
            ? t("economy:sayHello.success.bodyWithPronouns", { name: profile.name })
            : t("economy:sayHello.success.body", { name: profile.name })}
        </SuccessPanel>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t("economy:sayHello.ariaLabel", { name: profile.name })}
    >
      <div className={styles.helloForm}>
        <h2 className={styles.helloTitle}>
          <Translation
            i18nKey="economy:sayHello.title"
            values={{ name: profile.name }}
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.helloLede}>{t("economy:sayHello.lede")}</p>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldSubLabel} htmlFor={`${fieldId}-message`}>
            {t("economy:sayHello.messageLabel")}
          </label>
          <textarea
            id={`${fieldId}-message`}
            className={styles.helloTextarea}
            rows={4}
            maxLength={2000}
            placeholder={t("economy:sayHello.messagePlaceholder")}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        {canSharePronouns ? (
          <label className={styles.consentRow}>
            <input
              type="checkbox"
              className={styles.consentCheckbox}
              checked={sharePronouns}
              onChange={(event) => setSharePronouns(event.target.checked)}
            />
            <span className={styles.consentCopy}>
              {t("economy:sayHello.sharePronouns", {
                pronouns: myPronouns,
                name: profile.name,
              })}
              <span className={styles.helloHint}>
                {t("economy:sayHello.sharePronounsHint")}
              </span>
            </span>
          </label>
        ) : (
          <p className={styles.helloHint}>
            {t("economy:sayHello.noPronounsHint")}
          </p>
        )}

        <div className={styles.helloActions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("economy:sayHello.cancel")}
          </Button>
          <Button type="button" variant="primary" onClick={handleSend} disabled={isPending}>
            {isPending ? (
              t("economy:sayHello.sending")
            ) : (
              <>
                <FiCheck aria-hidden /> {t("economy:sayHello.send")}
              </>
            )}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
