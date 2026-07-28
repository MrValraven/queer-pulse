import { useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
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
import { ConnectNoticePanel } from "./ConnectNoticePanel";
import { ConnectSentPanel } from "./ConnectSentPanel";
import { describeConnectError, type ConnectErrorView } from "./connectErrorView";
import styles from "./ConnectModal.module.css";

type Phase = "idle" | "sending" | "sent";
type NoticeView = Extract<ConnectErrorView, { mode: "panel" }>;

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
  const { demoMode } = useDemoMode();
  // Source the member from the same hook the profile page uses, so live mode
  // addresses the fetched member (name/avatar/openTo) rather than the static
  // demo registry. The registry fallbacks below are DEMO-ONLY: the
  // `?? memberProfiles[slug]` entry covers the first render before the (demo)
  // query resolves, and `defaultProfileSlug` keeps the no-slug placeholder for
  // the prototype's simulated delivery. In LIVE mode we never substitute a mock
  // persona (notably the default "Inês") for a member the fetch hasn't yielded —
  // on a fetch failure that would show the wrong person's identity. `member` is
  // then null and the modal shows an unavailable state; the form still POSTs the
  // real `slug` regardless.
  const { data: profileResult, isLoading: profileLoading } =
    useMemberProfile(slug);
  const member =
    profileResult?.member ??
    (demoMode
      ? ((slug ? memberProfiles[slug] : undefined) ??
        memberProfiles[defaultProfileSlug]!)
      : null);
  const { send } = useConnectionActions();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeView | null>(null);
  useScrollLock();

  const sent = phase === "sent";
  // Both the success and terminal-notice panels use the plum-panel chrome.
  const plum = sent || notice !== null;
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
    } catch (err) {
      // Adapt to the outcome: terminal cases (already sent, blocked, not
      // accepting…) replace the form with a notice panel; retryable ones keep
      // the form and show an inline message. See describeConnectError.
      const view = describeConnectError(err);
      if (view.mode === "panel") setNotice(view);
      else setError(t(view.messageKey));
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
      <div className={`${styles.modal} ${plum ? styles.modalSent : ""}`}>
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
        ) : !member ? (
          // Live mode, member fetch didn't yield anyone — surface that rather
          // than fall back to a demo persona's identity.
          <div className={styles.loading} role="alert">
            <span>{t("connect:modal.error")}</span>
          </div>
        ) : notice ? (
          <ConnectNoticePanel
            titleKey={notice.titleKey}
            bodyKey={notice.bodyKey}
            icon={notice.icon}
            firstName={member.first}
            onClose={onClose}
          />
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
