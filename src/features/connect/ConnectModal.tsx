import { useState } from "react";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  onClose,
}: {
  slug?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const member =
    (slug && memberProfiles[slug]) || memberProfiles[defaultProfileSlug]!;
  const { send } = useConnectionActions();
  const [phase, setPhase] = useState<Phase>("idle");
  useScrollLock();

  const sent = phase === "sent";

  function handleSubmit(message: string) {
    if (phase !== "idle") return;
    setPhase("sending");
    // Reaching out records a sent request: demo updates local state, live POSTs
    // /connections. Existing connections no-op locally, so messaging a friend is
    // safe. Errors are swallowed here so the success panel still shows (the
    // prototype simulates delivery); a future pass can surface a live failure.
    if (slug) void send(slug, message || undefined).catch(() => {});
    // Simulate delivery, then reveal the animated success panel.
    window.setTimeout(() => setPhase("sent"), 1100);
  }

  return (
    <div
      className={styles.overlay}
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

        {sent ? (
          <ConnectSentPanel firstName={member.first} onClose={onClose} />
        ) : (
          <ConnectForm
            member={member}
            sending={phase === "sending"}
            onSubmit={handleSubmit}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
