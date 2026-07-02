import { useEffect, useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import type { Therapist } from "./mentalHealth.data";
import { TherapistProfileBody } from "./TherapistProfileBody";
import styles from "./TherapistProfileModal.module.css";

type Phase = "idle" | "sending" | "sent";

export function TherapistProfileModal({
  therapist,
  onClose,
}: {
  therapist: Therapist;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  useScrollLock();

  // Close on Escape, the way the other self-contained modals do.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "sending") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

  const firstName = therapist.name.replace(/^Dr\.\s*/, "").split(" ")[0];

  function handleSayHello() {
    if (phase !== "idle") return;
    setPhase("sending");
    window.setTimeout(() => setPhase("sent"), 1100);
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && phase !== "sending") onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={`${therapist.name} — profile`}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          <FiX />
        </button>

        <TherapistProfileBody therapist={therapist} onClose={onClose} />

        {phase === "sent" ? (
          <div className={styles.sent}>
            <span className={styles.sentIcon}>
              <FiCheck aria-hidden />
            </span>
            <div>
              <div className={styles.sentTitle}>
                Message sent to {firstName}.
              </div>
              <p className={styles.sentText}>
                They'll reply directly to your email if it feels like a fit. No
                notifications, no pressure.
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.foot}>
            <div className={styles.footNote}>
              Messages go straight to {firstName} — held briefly and reviewed
              before delivery to keep the room safe.
            </div>
            <Button
              size="lg"
              variant="jade"
              onClick={handleSayHello}
              disabled={phase === "sending"}
            >
              {phase === "sending" ? (
                <span className={styles.sending}>
                  <span className={styles.spinner} aria-hidden /> Sending…
                </span>
              ) : (
                "Say hello →"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
