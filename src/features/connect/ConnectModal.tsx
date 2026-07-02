import { useState } from "react";
import { useScrollLock } from "../../shared/hooks";
import { useConnections } from "../../app/providers/ConnectionsProvider";
import {
  defaultProfileSlug,
  memberProfiles,
} from "../members/data/memberProfiles";
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
  const member =
    (slug && memberProfiles[slug]) || memberProfiles[defaultProfileSlug]!;
  const { sendRequest } = useConnections();
  const [phase, setPhase] = useState<Phase>("idle");
  useScrollLock();

  const sent = phase === "sent";

  function handleSubmit() {
    if (phase !== "idle") return;
    setPhase("sending");
    // Reaching out to someone you're not yet connected to records a sent request
    // (the provider no-ops for existing connections, so messaging a friend is safe).
    if (slug) sendRequest(slug);
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
            aria-label="Close"
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
