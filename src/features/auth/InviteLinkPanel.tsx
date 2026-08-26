import { useState } from "react";
import { FiAlertCircle, FiLink } from "react-icons/fi";
import { Button, Sending } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isInviteQuotaError } from "./api/invite.api";
import { useCreateInvite, type CreatedInvite } from "./api/useCreateInvite";
import { SharePreviewCard } from "./SharePreviewCard";
import { INVITE_URL, defaultVouch } from "./invite.data";
import { RECIPIENT_EMAIL_PATTERN, sleep } from "./inviteLinkPanel.data";
import { InviteReadyPanel } from "./InviteReadyPanel";
import { InviteComposeFields } from "./InviteComposeFields";
import { useInviteSender } from "./useInviteSender";
import styles from "./InvitePage.module.css";

interface InviteLinkPanelProps {
  /** Live community size, from the page's quota fetch — undefined while loading. */
  memberCount?: number;
  /** True when the page's quota fetch already says the month's allowance is
   *  spent, so the refusal is shown up front instead of after a wasted POST. */
  isQuotaExhausted?: boolean;
}

export function InviteLinkPanel({
  memberCount,
  isQuotaExhausted = false,
}: InviteLinkPanelProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const sender = useInviteSender();
  const createInvite = useCreateInvite();
  // Optional: the address the invite is pinned to. Empty leaves it a bearer
  // link anyone holding it can redeem.
  const [recipientEmail, setRecipientEmail] = useState("");
  // Only ever true after a generate attempt with a malformed address — the
  // member isn't scolded mid-typing.
  const [hasRecipientEmailError, setHasRecipientEmailError] = useState(false);
  const [vouch, setVouch] = useState("");
  const [note, setNote] = useState("");
  // Covers the whole generate() run — including the delay floor — so the button
  // stays disabled even in demo mode where the mutation resolves instantly.
  const [generating, setGenerating] = useState(false);
  // The invite is created only when the member generates it — null until then.
  const [invite, setInvite] = useState<CreatedInvite | null>(null);
  // True once the backend has refused on the monthly quota — blocks generating
  // and shows a sticky inline alert instead of a transient toast.
  const [hasHitQuota, setHasHitQuota] = useState(false);

  // Either signal blocks generating: the pre-fetched allowance, or a refusal
  // the POST came back with (the allowance can run out in another tab).
  const isBlockedByQuota = hasHitQuota || isQuotaExhausted;

  const description = note.trim() || defaultVouch(t);

  /** Surface a failed POST /invites: the quota refusal sticks inline (no toast
   *  on top of it — one message, one place), everything else toasts. */
  function handleInviteError(err: unknown) {
    if (isInviteQuotaError(err)) {
      setHasHitQuota(true);
    } else {
      showToast(t("auth:invite.link.error.generic"), "error");
    }
  }

  /** Typed but malformed addresses block the POST; an empty field is always
   *  valid, because pinning the invite is optional. */
  const trimmedRecipientEmail = recipientEmail.trim();
  const isRecipientEmailUsable =
    trimmedRecipientEmail === "" ||
    RECIPIENT_EMAIL_PATTERN.test(trimmedRecipientEmail);

  /** Persist the invite (POST /invites), then reveal the animated ready panel. */
  async function generate() {
    if (generating || isBlockedByQuota) return;
    if (!isRecipientEmailUsable) {
      setHasRecipientEmailError(true);
      return;
    }
    setHasRecipientEmailError(false);
    setGenerating(true);
    try {
      // A short floor so the success lands as a deliberate beat, not an instant pop.
      const [created] = await Promise.all([
        createInvite.mutateAsync({
          email: trimmedRecipientEmail || undefined,
          note: note.trim() || undefined,
          vouch: vouch.trim() || undefined,
        }),
        sleep(650),
      ]);
      setInvite(created);
    } catch (err) {
      handleInviteError(err);
      setGenerating(false);
    }
  }

  // ── Ready: the invite exists. Quiet plum success panel with the live link. ──
  if (invite) {
    return (
      <InviteReadyPanel
        invite={invite}
        pinnedEmail={trimmedRecipientEmail || undefined}
      />
    );
  }

  // ── Compose: write the optional note, preview the unfurl, then generate. ──
  return (
    <div>
      <InviteComposeFields
        recipientEmail={recipientEmail}
        setRecipientEmail={(value) => {
          setRecipientEmail(value);
          // Clear the refusal the moment they start fixing it.
          if (hasRecipientEmailError) setHasRecipientEmailError(false);
        }}
        hasRecipientEmailError={hasRecipientEmailError}
        vouch={vouch}
        setVouch={setVouch}
        note={note}
        setNote={setNote}
      />

      <div className={styles.epLabel}>{t("auth:invite.link.previewLabel")}</div>
      <SharePreviewCard
        senderName={sender.full}
        description={description}
        url={INVITE_URL}
        memberCount={memberCount}
      />

      {isBlockedByQuota && (
        <div className={styles.quotaError} role="alert">
          <FiAlertCircle aria-hidden />
          {t("auth:invite.link.error.quota")}
        </div>
      )}

      <div className={styles.actions}>
        <Button
          type="button"
          onClick={() => void generate()}
          disabled={generating || isBlockedByQuota}
          aria-busy={generating}
        >
          {generating ? (
            <Sending label={t("auth:invite.link.generating")} />
          ) : (
            <>
              <FiLink aria-hidden style={{ marginRight: 8 }} />
              {t("auth:invite.link.generateCta")}
            </>
          )}
        </Button>
      </div>
      <div className={styles.formNote}>{t("auth:invite.link.formNote")}</div>
    </div>
  );
}
