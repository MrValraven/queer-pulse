import { useEffect } from "react";
import { useScrollLock } from "../../shared/hooks";
import s from "./StudioRightsPage.module.css";

interface StudioTakedownModalProps {
  title: string;
  meta: string;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Confirm-takedown dialog. Self-contained: only mounted while open, so it
 * locks scroll unconditionally. Closes on backdrop click and Esc; confirming
 * hands control back to the page which flips the release into its removal
 * window.
 */
export function StudioTakedownModal({
  title,
  meta,
  onConfirm,
  onClose,
}: StudioTakedownModalProps) {
  useScrollLock();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={s.modalBg}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={s.modal}
        role="dialog"
        aria-modal="true"
        aria-label={`Confirm takedown of ${title}`}
      >
        <div className={s.eb}>Confirm takedown</div>
        <h3 className={s.modalTitle}>
          Take down <em>{title}</em>?
        </h3>
        <div className={s.modalMeta}>{meta}</div>
        <p className={s.modalBody}>
          It'll stop being served within 14 days. Existing links will resolve to
          a short "this work has been withdrawn by the artist" page.{" "}
          <em>You can re-publish it any time</em> — your masters never leave
          your hands.
        </p>
        <div className={s.keep}>
          <p>
            <em>You keep everything already earned.</em> This release stays paid
            for every play up to removal, in the next cycle.
          </p>
        </div>
        <div className={s.modalActions}>
          <button
            type="button"
            className={`${s.bt} ${s.btConfirm}`}
            onClick={onConfirm}
          >
            Take it down →
          </button>
          <button type="button" className={s.bt} onClick={onClose}>
            Keep it up
          </button>
        </div>
      </div>
    </div>
  );
}
