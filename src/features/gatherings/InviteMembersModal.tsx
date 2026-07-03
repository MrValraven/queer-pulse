import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useScrollLock } from "../../shared/hooks";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import { MemberPicker } from "./MemberPicker";
import { MEMBER_POOL } from "./manageCohosts.data";
import { useInviteMembers } from "./api/useEventMutations";
import modal from "./GatheringModals.module.css";
import styles from "./ManageCohosts.module.css";

/** Backend cap: at most 100 slugs per invite call. */
const MAX_INVITES = 100;

export function InviteMembersModal({
  slug,
  /** Slugs already going / already invited — hidden from the pool. */
  excludeSlugs = [],
  onClose,
}: {
  slug: string;
  excludeSlugs?: string[];
  onClose: () => void;
}) {
  useScrollLock();
  const { showToast } = useToast();
  const inviteMembers = useInviteMembers(slug);
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const atCap = selected.length >= MAX_INVITES;

  const toggle = (memberSlug: string) => {
    setSelected((prev) =>
      prev.includes(memberSlug)
        ? prev.filter((s) => s !== memberSlug)
        : prev.length >= MAX_INVITES
          ? prev
          : [...prev, memberSlug],
    );
  };

  const send = () => {
    if (selected.length === 0) return;
    // Demo → no-op mutation, optimistic UI here. Live → fires the POST + invalidate.
    inviteMembers.mutate(selected);
    setSent(true);
    showToast(
      `Invitation sent to ${selected.length} ${
        selected.length === 1 ? "member" : "members"
      }`,
      "success",
    );
  };

  return (
    <div
      className={modal.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {sent ? (
        <GatheringSuccessPanel
          title={
            <>
              Invitations <em>on their way.</em>
            </>
          }
          sub={
            <>
              <b>
                {selected.length} {selected.length === 1 ? "member" : "members"}
              </b>{" "}
              just got an invite to this gathering, by email and in their
              QueerPulse notifications. You'll see them appear as they RSVP.
            </>
          }
          meta={`Sent just now · ${selected.length} invited`}
          onClose={onClose}
        />
      ) : (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Invite members"
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
          <div className={modal.eye}>Invite members</div>
          <div className={modal.title}>
            Bring the <em>right people</em> in
          </div>
          <p className={modal.sub}>
            Pick the members you'd like at this gathering. They'll get a warm
            invite they can accept or pass on — no pressure either way.
          </p>

          <MemberPicker
            candidates={MEMBER_POOL}
            excludeSlugs={excludeSlugs}
            selected={selected}
            onToggle={toggle}
            atCap={atCap}
            multiSelect
            searchLabel="Search members to invite"
          />

          <div className={styles.pickerFooter}>
            <div className={styles.selCount}>
              {selected.length === 0 ? (
                "No one selected yet"
              ) : (
                <>
                  <b>{selected.length}</b> selected
                  {atCap && (
                    <span className={styles.capWarn}>
                      {" "}
                      · that's the max (100)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={modal.actions}>
            <Button
              variant="primary"
              onClick={send}
              disabled={selected.length === 0}
            >
              {selected.length === 0
                ? "Send invites"
                : `Invite ${selected.length} ${
                    selected.length === 1 ? "member" : "members"
                  }`}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
