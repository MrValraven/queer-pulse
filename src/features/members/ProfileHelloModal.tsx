import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FormField, Modal, Sending } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { messageRequestErrorKey } from "../messages/api/firstContactError";
import { useSendMessageRequest } from "../messages/api/useMessageRequest";
import { type MemberProfile } from "./data/memberProfiles";
import { openToLabel, reasonValue } from "./openTo.data";
import { draftForReason } from "./profileHello.data";
import styles from "./ProfileHelloModal.module.css";

/**
 * Reason-first "say hello" composer for a connected member: pick what drew
 * you in (from the profile owner's own `openTo` entries, not a fixed
 * script), get a starter draft, then actually send it.
 *
 * PRD-338: this used to hand the draft off as a seeded composer draft via a
 * "Message <member>" deep-link and toast "Sent" on the spot, before anything
 * had left the browser. It now posts through the same message-request
 * endpoint every other first-contact surface uses (`useSendMessageRequest`:
 * for an already-accepted connection, which is the only case this modal is
 * ever offered for, the backend delivers the body as an ordinary message and
 * returns the conversation). The toast only fires once the server has
 * confirmed, and a failed send leaves the modal open with the draft intact
 * so nothing is lost.
 */
export function ProfileHelloModal({
  profile,
  onClose,
}: {
  profile: MemberProfile;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const sendMessageRequest = useSendMessageRequest();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const hasReasons = profile.openTo.length > 0;

  function handleSend() {
    const body = draft.trim();
    if (!body || sendMessageRequest.isPending) return;
    sendMessageRequest.mutate(
      { toSlug: profile.slug, body },
      {
        onSuccess: (result) => {
          onClose();
          showToast(
            t("members:profile.hello.sentToast", { first: profile.first }),
            "success",
            undefined,
            // Live only: a demo send never leaves the browser and resolves no
            // conversation id.
            !demoMode && result.conversationId
              ? {
                  label: t("members:profile.hello.openThreadCta"),
                  onClick: () =>
                    void navigate(
                      `${routes.messages}?c=${encodeURIComponent(result.conversationId!)}`,
                    ),
                }
              : undefined,
          );
        },
        onError: (error) => {
          // Leave the modal open and the draft in place; don't claim "sent"
          // for a message that didn't go through. A coded first-contact
          // refusal (PRD-365/366) says specifically why.
          showToast(
            t(
              messageRequestErrorKey(error) ??
                "members:profile.hello.sendErrorToast",
              { name: profile.first },
            ),
            "error",
          );
        },
      },
    );
  }

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
          disabled={!draft.trim() || sendMessageRequest.isPending}
          onClick={handleSend}
        >
          {sendMessageRequest.isPending ? (
            <Sending label={t("members:profile.hello.sending")} />
          ) : (
            t("members:profile.hello.send")
          )}
        </Button>
      </div>
    </Modal>
  );
}
