import { useState } from "react";
import { Avatar, Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { AddCohostModal } from "./AddCohostModal";
import { INITIAL_COHOSTS, type CohostCandidate } from "./manageCohosts.data";
import { useAddCohost, useRemoveCohost } from "./api/useEventMutations";
import styles from "./ManageCohosts.module.css";

/**
 * Lists the event's cohosts and lets the host add/remove them. Owns the cohost
 * list as local state (seeded from mock data), so it works identically in demo
 * and live: the mutation is a no-op in demo and a real call + invalidate in live.
 */
export function CohostManager({ slug }: { slug: string }) {
  const { showToast } = useToast();
  const addCohost = useAddCohost(slug);
  const removeCohost = useRemoveCohost(slug);
  const [cohosts, setCohosts] = useState<CohostCandidate[]>(INITIAL_COHOSTS);
  const [addOpen, setAddOpen] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  const add = (candidate: CohostCandidate) => {
    setAddOpen(false);
    if (cohosts.some((c) => c.slug === candidate.slug)) return;
    addCohost.mutate(candidate.slug);
    setCohosts((prev) => [...prev, candidate]);
    showToast(`${candidate.name} added as a cohost`, "success");
  };

  const remove = (candidate: CohostCandidate) => {
    setConfirming(null);
    removeCohost.mutate(candidate.slug);
    setCohosts((prev) => prev.filter((c) => c.slug !== candidate.slug));
    showToast(`${candidate.name} removed as a cohost`, "info");
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelTitle}>Cohosts</div>
        <Button variant="ghost" onClick={() => setAddOpen(true)}>
          Add cohost
        </Button>
      </div>
      <p className={styles.panelDesc}>
        Cohosts can edit this gathering, message guests and manage RSVPs. You
        stay the lead host — cancelling and the host fund stay with you.
      </p>

      {cohosts.length === 0 ? (
        <div className={styles.empty}>
          No cohosts yet. Adding one means you're not carrying the night alone.
        </div>
      ) : (
        <div className={styles.cohostList}>
          {cohosts.map((c) => (
            <div className={styles.cohostRow} key={c.slug}>
              <Avatar
                initials={c.initials}
                tint={c.tint}
                src={c.photo}
                size={40}
              />
              <div className={styles.cohostInfo}>
                <div className={styles.cohostName}>{c.name}</div>
                <div className={styles.cohostRole}>{c.role}</div>
              </div>
              {confirming === c.slug ? (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmText}>Remove?</span>
                  <Button variant="ghost" onClick={() => remove(c)}>
                    Yes, remove
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirming(null)}>
                    Keep
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setConfirming(c.slug)}
                  aria-label={`Remove ${c.name} as a cohost`}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <AddCohostModal
          excludeSlugs={cohosts.map((c) => c.slug)}
          onPick={add}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}
