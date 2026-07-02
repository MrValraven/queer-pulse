import { useState } from "react";
import { FiAlertCircle, FiLink } from "react-icons/fi";
import { Button, Sending } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ApiError } from "../../shared/api/client";
import { useCreateInvite, type CreatedInvite } from "./api/useCreateInvite";
import { SharePreviewCard } from "./SharePreviewCard";
import { DEFAULT_VOUCH, INVITE_URL, SENDER_NAME } from "./invite.data";
import { sleep } from "./inviteLinkPanel.data";
import { InviteReadyPanel } from "./InviteReadyPanel";
import { InviteComposeFields } from "./InviteComposeFields";
import styles from "./InvitePage.module.css";

export function InviteLinkPanel() {
  const { showToast } = useToast();
  const createInvite = useCreateInvite();
  const [vouch, setVouch] = useState("");
  const [note, setNote] = useState("");
  // Covers the whole generate() run — including the delay floor — so the button
  // stays disabled even in demo mode where the mutation resolves instantly.
  const [generating, setGenerating] = useState(false);
  // The invite is created only when the member generates it — null until then.
  const [invite, setInvite] = useState<CreatedInvite | null>(null);
  // Set when the backend rejects with the monthly quota 403 — blocks generating
  // and shows the message inline instead of a transient toast.
  const [quotaError, setQuotaError] = useState<string | null>(null);

  const description = note.trim() || DEFAULT_VOUCH;

  /** Surface a failed POST /invites: a quota 403 sticks, everything else toasts. */
  function handleInviteError(err: unknown) {
    if (
      err instanceof ApiError &&
      err.status === 403 &&
      /limit|month/i.test(err.message)
    ) {
      setQuotaError(err.message);
      showToast(err.message, "error");
    } else {
      showToast("Could not create your invite link — try again", "error");
    }
  }

  /** Persist the invite (POST /invites), then reveal the animated ready panel. */
  async function generate() {
    if (generating || quotaError) return;
    setGenerating(true);
    try {
      // A short floor so the success lands as a deliberate beat, not an instant pop.
      const [created] = await Promise.all([
        createInvite.mutateAsync({
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
    return <InviteReadyPanel invite={invite} />;
  }

  // ── Compose: write the optional note, preview the unfurl, then generate. ──
  return (
    <div>
      <InviteComposeFields
        vouch={vouch}
        setVouch={setVouch}
        note={note}
        setNote={setNote}
      />

      <div className={styles.epLabel}>How your link will look</div>
      <SharePreviewCard
        senderName={SENDER_NAME}
        description={description}
        url={INVITE_URL}
      />

      {quotaError && (
        <div className={styles.quotaError} role="alert">
          <FiAlertCircle aria-hidden />
          {quotaError}
        </div>
      )}

      <div className={styles.actions}>
        <Button
          type="button"
          onClick={generate}
          disabled={generating || Boolean(quotaError)}
          aria-busy={generating}
        >
          {generating ? (
            <Sending label="Generating link…" />
          ) : (
            <>
              <FiLink aria-hidden style={{ marginRight: 8 }} />
              Generate link
            </>
          )}
        </Button>
      </div>
      <div className={styles.formNote}>
        One link, one person — we’ll create it when you generate. Share it only
        with people you’d vouch for.
      </div>
    </div>
  );
}
