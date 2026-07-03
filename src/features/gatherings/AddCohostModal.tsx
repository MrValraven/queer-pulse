import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useScrollLock } from "../../shared/hooks";
import { MemberPicker } from "./MemberPicker";
import { MEMBER_POOL, type CohostCandidate } from "./manageCohosts.data";
import modal from "./GatheringModals.module.css";

export function AddCohostModal({
  /** Slugs already cohosting — hidden from the pool. */
  excludeSlugs,
  onPick,
  onClose,
}: {
  excludeSlugs: string[];
  onPick: (candidate: CohostCandidate) => void;
  onClose: () => void;
}) {
  useScrollLock();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pick = (slug: string) => {
    const candidate = MEMBER_POOL.find((c) => c.slug === slug);
    if (candidate) onPick(candidate);
  };

  return (
    <div
      className={modal.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add a cohost"
        className={modal.modal}
      >
        <button
          type="button"
          className={modal.close}
          onClick={onClose}
          aria-label="Close"
        >
          <FiX />
        </button>
        <div className={modal.eye}>Add a cohost</div>
        <div className={modal.title}>
          Share the <em>load</em>
        </div>
        <p className={modal.sub}>
          A cohost can edit the page, message guests and manage RSVPs alongside
          you. Pick someone you trust — they'll be asked to accept.
        </p>

        <MemberPicker
          candidates={MEMBER_POOL}
          excludeSlugs={excludeSlugs}
          onToggle={pick}
          searchLabel="Search members to add as cohost"
        />
      </div>
    </div>
  );
}
