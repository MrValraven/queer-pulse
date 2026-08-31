import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useConnectionsHydrated } from "../../app/providers/useConnections";
import { routes } from "../../app/routeMap";
import { Spinner, useDismiss } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMemberProfile } from "../members/api/useMemberProfile";
import {
  defaultProfileSlug,
  memberProfiles,
} from "../members/data/memberProfiles";
import { useConnectionActions } from "./api/useConnectionActions";
import { ConnectForm } from "./ConnectForm";
import { ConnectIncomingPanel } from "./ConnectIncomingPanel";
import { ConnectNoticePanel } from "./ConnectNoticePanel";
import { ConnectSentPanel } from "./ConnectSentPanel";
import {
  describeConnectError,
  type ConnectErrorView,
} from "./connectErrorView";
import styles from "./ConnectModal.module.css";

type Phase = "idle" | "sending" | "sent" | "answering";
type NoticeView = Extract<ConnectErrorView, { mode: "panel" }>;

export function ConnectModal({
  slug,
  reason: initialReason,
  onClose,
}: {
  slug?: string;
  /** Preselected reason, e.g. from an "open to" chip. */
  reason?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const navigate = useNavigate();
  const { showToast } = useToast();
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
  const { send, acceptRequest, declineRequest } = useConnectionActions();
  // PRD-03. The relationship the server actually reports, so a request already
  // waiting FROM this member is known before a doomed send is attempted rather
  // than discovered from its 409.
  const { isIncoming, incomingConnectionId } = useConnectionsHydrated();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeView | null>(null);
  // The refused 409 counterpart of `isIncoming`: a request that landed between
  // this page loading and the send, so the store had not heard about it yet.
  const [refusedAsIncoming, setRefusedAsIncoming] = useState(false);
  // THE DRAFT LIVES HERE, above every panel the send can end on, so a refusal
  // can never destroy words the member wrote (PRD-03).
  const [reason, setReason] = useState(initialReason ?? "");
  const [message, setMessage] = useState("");

  // Scroll-lock, Escape-to-close, initial focus, a Tab focus-trap and focus
  // restore to the trigger — all from the shared modal a11y hook, so this
  // bespoke bottom-sheet behaves like every other dialog in the app. A
  // dismissal is refused mid-send, exactly as the scrim click already was.
  const isBusy = phase === "sending" || phase === "answering";
  const dismiss = useCallback(() => {
    if (phase !== "sending" && phase !== "answering") onClose();
  }, [phase, onClose]);
  const dialogRef = useDismiss(dismiss);

  const sent = phase === "sent";
  const theyAskedYou = Boolean((slug && isIncoming(slug)) || refusedAsIncoming);
  // Both the success and terminal-notice panels use the plum-panel chrome.
  const plum = sent || notice !== null || theyAskedYou;
  // In live mode the member fetch is async; gate only the initial idle render
  // so ConnectForm never mounts with the seed's openTo and then swaps under it.
  const memberLoading = Boolean(slug) && profileLoading && !profileResult;
  const memberName = member ? `${member.first} ${member.last}`.trim() : "";
  const draft = message.trim();

  async function handleSubmit(
    submittedMessage: string,
    submittedReason: string,
  ) {
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
        send(slug, submittedMessage || undefined, submittedReason || undefined),
        new Promise((resolve) => window.setTimeout(resolve, 1100)),
      ]);
      setPhase("sent");
    } catch (err) {
      // Adapt to the outcome: a request pointing the other way switches to the
      // accept/decline panel, terminal cases replace the form with a notice
      // panel, and retryable ones keep the form and show an inline message.
      // The composed text survives all three. See describeConnectError.
      const view = describeConnectError(err);
      if (view.mode === "incoming") setRefusedAsIncoming(true);
      else if (view.mode === "panel") setNotice(view);
      else setError(t(view.messageKey));
      setPhase("idle");
    }
  }

  /**
   * Accept the request waiting from this member. When they had already written
   * something, those words ride into the conversation the accept just opened,
   * seeded as a draft for them to review before it is actually sent (the same
   * handoff every other "message this person" CTA in the app uses).
   */
  async function handleAccept() {
    if (!slug || isBusy) return;
    setPhase("answering");
    const didAccept = await acceptRequest({
      slug,
      id: incomingConnectionId(slug),
    });
    setPhase("idle");
    if (!didAccept) return;
    showToast(
      t("connect:toast.connected", { name: member?.first ?? memberName }),
      "success",
    );
    if (draft) {
      void navigate(routes.messages, {
        state: { to: { slug, name: memberName, text: draft } },
      });
    }
    onClose();
  }

  async function handleDecline() {
    if (!slug || isBusy) return;
    setPhase("answering");
    const didDecline = await declineRequest({
      slug,
      id: incomingConnectionId(slug),
    });
    setPhase("idle");
    if (!didDecline) return;
    showToast(t("connect:toast.declined"), "success");
    onClose();
  }

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("connect:modal.ariaLabel")}
        tabIndex={-1}
        className={`${styles.modal} ${plum ? styles.modalSent : ""}`}
      >
        {!plum && <div className={styles.grabber} aria-hidden />}
        {!isBusy && (
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t("connect:modal.close")}
          >
            <FiX aria-hidden />
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
        ) : theyAskedYou ? (
          <ConnectIncomingPanel
            firstName={member.first}
            hasDraft={draft.length > 0}
            busy={isBusy}
            onAccept={() => void handleAccept()}
            onDecline={() => void handleDecline()}
            onClose={onClose}
          />
        ) : notice ? (
          <ConnectNoticePanel
            titleKey={notice.titleKey}
            bodyKey={notice.bodyKey}
            icon={notice.icon}
            firstName={member.first}
            draft={draft}
            onClose={onClose}
          />
        ) : sent ? (
          <ConnectSentPanel firstName={member.first} onClose={onClose} />
        ) : (
          <ConnectForm
            member={member}
            reason={reason}
            message={message}
            sending={phase === "sending"}
            error={error}
            onReasonChange={setReason}
            onMessageChange={setMessage}
            onSubmit={(submittedMessage, submittedReason) =>
              void handleSubmit(submittedMessage, submittedReason)
            }
            onClose={onClose}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
