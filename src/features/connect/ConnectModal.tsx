import { useState } from "react";
import { Spinner } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMemberProfile } from "../members/api/useMemberProfile";
import {
  defaultProfileSlug,
  memberProfiles,
} from "../members/data/memberProfiles";
import { useConnectionActions } from "./api/useConnectionActions";
import { ConnectForm } from "./ConnectForm";
import { ConnectSentPanel } from "./ConnectSentPanel";
import styles from "./ConnectModal.module.css";

type Phase = "idle" | "sending" | "sent";

export function ConnectModal({
  slug,
  reason,
  onClose,
}: {
  slug?: string;
  /** Preselected reason, e.g. from an "open to" chip. */
  reason?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  // Source the member from the same hook the profile page uses, so live mode
  // addresses the fetched member (name/avatar/openTo) rather than the static
  // demo registry. The `?? memberProfiles[slug]` fallback covers the first
  // render before the (demo) query resolves, and `defaultProfileSlug` keeps
  // the existing no-slug/placeholder behaviour.
  const { data: profileResult, isLoading: profileLoading } =
    useMemberProfile(slug);
  const member =
    profileResult?.member ??
    (slug ? memberProfiles[slug] : undefined) ??
    memberProfiles[defaultProfileSlug]!;
  const { send } = useConnectionActions();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  useScrollLock();

  const sent = phase === "sent";
  // In live mode the member fetch is async; gate only the initial idle render
  // so ConnectForm never mounts with the seed's openTo and then swaps under it.
  const memberLoading = Boolean(slug) && profileLoading && !profileResult;

  async function handleSubmit(message: string, submittedReason: string) {
    if (phase !== "idle") return;
    setError(null);
    setPhase("sending");
    // Reaching out records a sent request: demo updates local state, live POSTs
    // /connections. Existing connections no-op locally, so messaging a friend is
    // safe. Without a slug there's no target to POST to, so keep the prototype's
    // simulated delivery.
    if (!slug) {
      window.setTimeout(() => setPhase("sent"), 1100);
      return;
    }
    try {
      // Race the request against a minimum "sending" beat so a fast success
      // still reads as a deliberate delivery, not an instant flash. A live
      // failure rejects here (before the beat) and drops us back to the form.
      await Promise.all([
        send(slug, message || undefined, submittedReason || undefined),
        new Promise((resolve) => window.setTimeout(resolve, 1100)),
      ]);
      setPhase("sent");
    } catch {
      setError(t("connect:form.sendError"));
      setPhase("idle");
    }
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && phase !== "sending")
          onClose();
      }}
    >
      <div className={`${styles.modal} ${sent ? styles.modalSent : ""}`}>
        {phase !== "sending" && (
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t("connect:modal.close")}
          >
            ×
          </button>
        )}

        {memberLoading ? (
          <div className={styles.loading}>
            <Spinner />
            <span>{t("connect:modal.loading")}</span>
          </div>
        ) : sent ? (
          <ConnectSentPanel firstName={member.first} onClose={onClose} />
        ) : (
          <ConnectForm
            member={member}
            initialReason={reason}
            sending={phase === "sending"}
            error={error}
            onSubmit={handleSubmit}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
