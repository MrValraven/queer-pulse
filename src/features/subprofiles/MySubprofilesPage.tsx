import { useState } from "react";
import { FiLayers, FiPlus } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button, EmptyState, Modal, Spinner } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSubprofiles } from "./api/useSubprofiles";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { MySubprofileRow } from "./MySubprofileRow";
import { NewSubprofileModal } from "./NewSubprofileModal";
import styles from "./MySubprofilesPage.module.css";

const MAX_SUBPROFILES = 12;

/**
 * Owner dashboard: every persona this member runs, with its state at a glance,
 * a create flow, and per-row edit / delete. Wrapped in `AppShell` (logged-in).
 */
export function MySubprofilesPage() {
  const { data: subprofiles, isLoading } = useSubprofiles();
  const { remove } = useSubprofileMutations();
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SubprofileView | null>(null);

  const list = subprofiles ?? [];
  const atCap = list.length >= MAX_SUBPROFILES;

  async function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.displayName || "That persona";
    try {
      await remove.mutateAsync(deleteTarget.id);
      showToast(`${name} deleted`, "info");
    } catch {
      showToast("We couldn't delete that just now — try again.", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.headText}>
              <h1 className={styles.title}>
                Your <em>subprofiles</em>
              </h1>
              <p className={styles.sub}>
                A professional side of you for each thing you do — linked to
                your main profile, or standing on its own.
              </p>
            </div>
            {list.length > 0 && (
              <Button
                variant="primary"
                onClick={() => setCreating(true)}
                disabled={atCap}
              >
                <FiPlus size={16} aria-hidden /> New subprofile
              </Button>
            )}
          </header>

          {atCap && (
            <p className={styles.count}>
              You've reached the most personas one account can hold.
            </p>
          )}

          {isLoading ? (
            <div role="status" aria-live="polite">
              <Spinner />
            </div>
          ) : list.length === 0 ? (
            <EmptyState
              icon={<FiLayers />}
              title="No subprofiles yet"
              description="Make one for each craft you want to share — your music, your code, your writing — and choose whether it's tied to your name."
              action={{
                label: "Create your first",
                onClick: () => setCreating(true),
              }}
            />
          ) : (
            <div className={styles.list}>
              {list.map((sp) => (
                <MySubprofileRow
                  key={sp.id}
                  subprofile={sp}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {creating && <NewSubprofileModal onClose={() => setCreating(false)} />}

      {deleteTarget && (
        <Modal
          title="Delete this persona?"
          sub={`"${deleteTarget.displayName || "This persona"}" and everything on it will be gone for good.`}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Keep it
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                disabled={remove.isPending}
              >
                {remove.isPending ? "Deleting…" : "Delete"}
              </Button>
            </>
          }
        >
          <p>This can't be undone.</p>
        </Modal>
      )}
    </AppShell>
  );
}
