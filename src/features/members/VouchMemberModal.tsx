import { useEffect, useState } from "react";
import { useScrollLock } from "../../shared/hooks";
import { memberProfiles } from "./data/memberProfiles";
import { RELATIONSHIPS } from "./vouchMember.data";
import { VouchForm, VouchSuccess } from "./VouchMemberModalParts";
import styles from "./VouchMemberModal.module.css";

/**
 * Publicly co-sign an existing member. A short relationship + optional skill
 * endorsements + note, running loading → animated plum-panel success. On
 * success it calls `onVouched` so the member's "Vouched for by…" row gains the
 * current user's face. Self-contained: owns its form state and locks scroll
 * while mounted (it's only rendered when open).
 */
export function VouchMemberModal({
  slug,
  onClose,
  onVouched,
}: {
  slug: string;
  onClose: () => void;
  /** Called once, when the vouch is confirmed (success state reached). */
  onVouched: () => void;
}) {
  const [relationship, setRelationship] = useState<string>(RELATIONSHIPS[0]);
  const [endorsed, setEndorsed] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"form" | "loading" | "done">("form");
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "loading") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, status]);

  const profile = memberProfiles[slug];
  if (!profile) return null;

  const first = profile.first;
  const canSubmit = note.trim().length >= 12;

  const toggleTag = (tag: string) =>
    setEndorsed((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const submit = () => {
    if (!canSubmit || status !== "form") return;
    setStatus("loading");
    window.setTimeout(() => {
      onVouched();
      setStatus("done");
    }, 1100);
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== "loading") onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Vouch for ${first}`}
        className={`${styles.modal} ${status === "done" ? styles.modalDone : ""}`}
      >
        {status !== "loading" && (
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        )}

        <div className={styles.scroll}>
          {status === "done" ? (
            <VouchSuccess profile={profile} first={first} onClose={onClose} />
          ) : (
            <VouchForm
              profile={profile}
              first={first}
              relationship={relationship}
              setRelationship={setRelationship}
              endorsed={endorsed}
              toggleTag={toggleTag}
              note={note}
              setNote={setNote}
              canSubmit={canSubmit}
              status={status}
              onClose={onClose}
              onSubmit={submit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
