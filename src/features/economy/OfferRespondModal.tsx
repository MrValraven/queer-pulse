import { useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import {
  type Application,
  acceptedOfferPatch,
  declinedOfferPatch,
  offerRevertPatch,
} from "./applicationStatus.data";
import styles from "./ApplicationModals.module.css";

/** Respond to an offer: accept or decline — both change card state. */
export function OfferRespondModal({
  app,
  onClose,
  onPatch,
}: {
  app: Application;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Application>) => void;
}) {
  const UNDO_SECONDS = 8;
  const o = app.offer;
  const [outcome, setOutcome] = useState<null | "accept" | "decline">(null);
  const [pending, setPending] = useState<null | "accept" | "decline">(null);
  const [left, setLeft] = useState(UNDO_SECONDS);
  const timer = useRef<number | undefined>(undefined);
  const tick = useRef<number | undefined>(undefined);
  // Snapshot the pre-decision card so the action stays reversible.
  const snapshot = useRef(offerRevertPatch(app));
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearInterval(tick.current);
    },
    [],
  );

  const choose = (kind: "accept" | "decline") => {
    setPending(kind);
    timer.current = window.setTimeout(() => {
      onPatch(app.id, kind === "accept" ? acceptedOfferPatch() : declinedOfferPatch());
      setOutcome(kind);
      setLeft(UNDO_SECONDS);
      tick.current = window.setInterval(() => {
        setLeft((s) => {
          if (s <= 1) window.clearInterval(tick.current);
          return s - 1;
        });
      }, 1000);
    }, 1000);
  };

  const undo = () => {
    window.clearInterval(tick.current);
    onPatch(app.id, snapshot.current);
    setOutcome(null);
    setPending(null);
  };

  if (outcome) {
    const accepted = outcome === "accept";
    const canUndo = left > 0;
    return (
      <ModalShell onClose={onClose} success>
        <SuccessPanel
          title="Offer"
          em={accepted ? "accepted." : "declined."}
          onClose={onClose}
          footer={
            <div className={styles.undoBar}>
              {canUndo ? (
                <>
                  <span className={styles.undoText}>
                    Changed your mind? You can undo for {left}s.
                  </span>
                  <button type="button" className={styles.undoBtn} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : (
                <span className={styles.undoText}>This is now confirmed.</span>
              )}
            </div>
          }
        >
          {accepted
            ? `Congratulations — ${app.companyName} will send your contract within two working days.`
            : `We've thanked ${app.companyName} warmly on your behalf. The door stays open for the future.`}
        </SuccessPanel>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div className={styles.eyebrow}>Your offer · respond by {o?.respondBy}</div>
      <h2 className={styles.title}>
        {app.companyName} <em>said yes.</em>
      </h2>
      <p className={styles.sub}>Here's everything on the table. Take your time — then choose.</p>
      <div className={styles.panel}>
        <div className={styles.rows}>
          <div className={styles.row}>
            <span className={styles.rowK}>Salary</span>
            <span className={styles.rowV}>{o?.salary}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowK}>Holiday</span>
            <span className={styles.rowV}>{o?.holiday}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowK}>Start</span>
            <span className={styles.rowV}>{o?.start}</span>
          </div>
        </div>
      </div>
      <ul className={styles.list} style={{ marginBottom: 24 }}>
        {o?.terms.map((t) => (
          <li key={t} className={styles.listItem}>
            <FiCheck className={styles.tick} size={16} aria-hidden /> {t}
          </li>
        ))}
      </ul>
      <div className={styles.foot}>
        <button
          type="button"
          className={styles.back}
          disabled={pending !== null}
          onClick={() => choose("decline")}
        >
          {pending === "decline" ? <Sending label="Declining…" /> : "Decline politely"}
        </button>
        <Button size="lg" variant="jade" disabled={pending !== null} onClick={() => choose("accept")}>
          {pending === "accept" ? <Sending label="Accepting…" /> : "Accept offer →"}
        </Button>
      </div>
    </ModalShell>
  );
}
